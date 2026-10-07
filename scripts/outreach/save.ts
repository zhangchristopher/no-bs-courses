// Saves research results, channel decisions and drafts produced by the
// creator-outreach skill. Validates each entry and skips (with a reason)
// anything that breaks the rules, rather than writing it.
//
//   npm run -s outreach:save -- path/to/results.json
//
// File shape: an array of
//   { id, research?: { email, source_url, contact_form_url, confidence, notes },
//         channel?: { preferred, instagram_handle, instagram_source_url },
//         draft?: { subject, body } }
import fs from "node:fs";
import { sql, SITE_TOKEN, ALREADY_CONTACTED, isSuppressed, normalizeEmail } from "./lib";
import { OFFER } from "./offer";
import { MAX_WORDS, wordCount } from "./template";

type Research = {
  email: string;
  source_url: string;
  contact_form_url: string;
  confidence: "high" | "medium" | "low" | "none";
  notes: string;
};
type Channel = { preferred: "email" | "instagram" | "other"; instagram_handle?: string; instagram_source_url?: string };
type Entry = { id: string; research?: Research; channel?: Channel; draft?: { subject: string; body: string } };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HANDLE_RE = /^[a-z0-9._]{1,30}$/;
const CONFIDENCES = ["high", "medium", "low", "none"];
const CHANNELS = ["email", "instagram", "other"];

async function saveResearch(id: string, r: Research): Promise<string> {
  if (!CONFIDENCES.includes(r.confidence)) return `bad confidence "${r.confidence}"`;
  const email = normalizeEmail(r.email ?? "");
  const hasEmail = r.confidence !== "none" && email !== "";
  if (hasEmail && !EMAIL_RE.test(email)) return `"${email}" isn't an email address`;
  if (hasEmail && !/^https?:\/\//.test(r.source_url ?? "")) return "an email needs the source_url it was published on";

  // A suppressed address is never queued again, whoever found it.
  if (hasEmail && (await isSuppressed(email))) {
    await sql`
      UPDATE creator_outreach SET status = 'do_not_contact', contact_email = NULL, researched_at = now(),
        research_notes = 'Contact address is on the suppression list.', updated_at = now()
      WHERE id = ${id} AND status = 'unresearched'
    `;
    return "address is on the suppression list; marked do_not_contact";
  }

  // The owner match, not just the address, has to be solid: low confidence
  // goes to a human instead of the send queue.
  const status = !hasEmail ? "no_contact" : r.confidence === "low" ? "manual_review" : "contact_found";
  const [row] = await sql`
    UPDATE creator_outreach SET
      status = ${status},
      contact_email = ${hasEmail ? email : null},
      contact_source_url = ${r.source_url || null},
      contact_form_url = ${r.contact_form_url || null},
      contact_confidence = ${hasEmail ? r.confidence : null},
      research_notes = ${r.notes || null},
      researched_at = now(), updated_at = now()
    WHERE id = ${id} AND status IN ('unresearched', 'researching')
    RETURNING creator_name
  `;
  if (!row) return "not found or already researched";
  return `research saved: ${hasEmail ? `${email} (${r.confidence}) -> ${status}` : "no email"}`;
}

// Applies at any status except the already-contacted ones: a no_contact
// creator is exactly who needs an Instagram route.
async function saveChannel(id: string, c: Channel): Promise<string> {
  if (!CHANNELS.includes(c.preferred)) return `bad channel "${c.preferred}"`;
  const handle = (c.instagram_handle ?? "").trim().replace(/^@/, "").toLowerCase();
  if (handle && !HANDLE_RE.test(handle)) return `"${handle}" isn't an Instagram handle`;
  if (handle && !/^https?:\/\//.test(c.instagram_source_url ?? "")) return "a handle needs the instagram_source_url it was found on";

  const [row] = await sql`
    UPDATE creator_outreach SET
      preferred_channel = ${c.preferred},
      instagram_handle = ${handle || null},
      instagram_source_url = ${handle ? c.instagram_source_url! : null},
      updated_at = now()
    WHERE id = ${id}
    RETURNING contact_email
  `;
  if (!row) return "not found";
  if (c.preferred === "email" && !row.contact_email) return "channel saved, but there's no contact email for it";
  return `channel saved: ${c.preferred}${handle ? ` (@${handle})` : ""}`;
}

function lintDraft(subject: string, body: string): string | null {
  if (!subject || subject.length > 60) return "subject missing or over 60 characters";
  if (!body.includes(`${SITE_TOKEN}/owner/signup`)) return `body must link ${SITE_TOKEN}/owner/signup`;
  if (!body.includes(`${SITE_TOKEN}/courses/`)) return "body must link their listing";
  if (/localhost/i.test(body)) return `use ${SITE_TOKEN} for site links, not localhost`;
  if (wordCount(body) > MAX_WORDS) return `body is ${wordCount(body)} words; the limit is ${MAX_WORDS}`;
  if (/!/.test(body + subject)) return "no exclamation marks";
  if (!/\bfree\b/i.test(body)) return "the email must say claiming is free";
  if (!/never changes/i.test(body)) return "the email must say payment never changes reviews, score, or ranking";
  if (/forever|last chance|act now|limited time|hurry|only \d+ spots/i.test(body)) return "no fake urgency or 'forever' pricing";
  const unknown = (body.match(/\$\d[\d,]*(\.\d+)?/g) ?? []).filter((m) => !OFFER.allowedAmounts.has(m));
  if (unknown.length > 0) return `price(s) not in lib/pricing.ts: ${unknown.join(", ")}`;
  return null;
}

async function saveDraft(id: string, d: { subject: string; body: string }): Promise<string> {
  const subject = (d.subject ?? "").trim();
  const body = (d.body ?? "").trim();
  const problem = lintDraft(subject, body);
  if (problem) return `rejected: ${problem}`;

  const [target] = await sql<{ contact_email: string | null; status: string }[]>`
    SELECT contact_email, status FROM creator_outreach WHERE id = ${id}
  `;
  if (!target) return "not found";
  if (await isSuppressed(target.contact_email)) return "rejected: address is on the suppression list";
  if ((ALREADY_CONTACTED as string[]).includes(target.status)) return `rejected: already ${target.status}`;

  // Redrafting always drops any earlier approval: the human approved a
  // different text.
  const [row] = await sql`
    UPDATE creator_outreach SET
      status = 'ready_for_review', email_subject = ${subject}, email_body = ${body},
      drafted_at = now(), approved_at = NULL, approved_by = NULL, updated_at = now()
    WHERE id = ${id} AND contact_email IS NOT NULL
      AND status IN ('contact_found', 'ready_for_review', 'approved_for_outreach')
    RETURNING creator_name
  `;
  return row ? "draft saved (ready_for_review)" : "rejected: needs a contact_found row with an email";
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("usage: outreach:save -- <results.json>");
  const entries: Entry[] = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const e of entries) {
    const [row] = await sql<{ creator_name: string }[]>`SELECT creator_name FROM creator_outreach WHERE id = ${e.id}`;
    const name = row?.creator_name ?? e.id;
    if (e.research) console.log(`${name}: ${await saveResearch(e.id, e.research)}`);
    if (e.channel) console.log(`${name}: ${await saveChannel(e.id, e.channel)}`);
    if (e.draft) console.log(`${name}: ${await saveDraft(e.id, e.draft)}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
