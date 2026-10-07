// Saves research results, channel decisions and drafts produced by the
// creator-outreach skill. Validates each entry and skips (with a reason)
// anything that breaks the rules, rather than writing it.
//
//   npm run -s outreach:save -- path/to/results.json
//
// File shape: an array of
//   { id, research?: { email, source_url, contact_form_url, confidence, notes,
//                      needs_review?, official_website?, course_price?, risk?,
//                      segment?: { source_type, creator_size, testimonials_visible, appears_active },
//                      score_input?: { match, contactSource, activity, business, commercial, fit } },
//         channel?: { preferred, instagram_handle, instagram_source_url },
//         draft?: { subject, body } }
import fs from "node:fs";
import { sql, isSuppressed, normalizeEmail } from "./lib";
import { saveDraft } from "./drafts";
import { scoreProspect, type ScoreInput } from "./scoring";

type Research = {
  email: string;
  source_url: string;
  contact_form_url: string;
  confidence: "high" | "medium" | "low" | "none";
  notes: string;
  // Set when the exact course-to-owner match can't be established, even if
  // there is no email: the record goes to a person instead of a quota.
  needs_review?: boolean;
  official_website?: string;
  course_price?: string;
  risk?: string;
  segment?: {
    source_type?: string;
    creator_size?: string;
    testimonials_visible?: boolean;
    appears_active?: string;
  };
  score_input?: ScoreInput;
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
  const status = r.needs_review || (hasEmail && r.confidence === "low") ? "manual_review" : !hasEmail ? "no_contact" : "contact_found";
  const seg = r.segment ?? {};
  const scored = r.score_input ? scoreProspect(r.score_input) : null;
  const [row] = await sql`
    UPDATE creator_outreach SET
      official_website = ${r.official_website || null},
      course_price_text = ${r.course_price || null},
      research_risk = ${r.risk || null},
      contact_source_type = ${seg.source_type ?? null},
      creator_size = ${seg.creator_size ?? null},
      testimonials_visible = ${seg.testimonials_visible ?? null},
      appears_active = ${seg.appears_active ?? null},
      prospect_score = ${scored?.score ?? null},
      score_breakdown = ${scored ? sql.json({ ...scored.breakdown, cap: scored.cap }) : null},
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
