// Draft validation and saving, shared by outreach:save (JSON batches) and
// outreach:draft (one creator at a time).
import { sql, SITE_TOKEN, ALREADY_CONTACTED, isSuppressed } from "./lib";
import { OFFER } from "./offer";
import { MAX_WORDS, wordCount } from "./template";

export function lintDraft(subject: string, body: string): string | null {
  if (!subject || subject.length > 60) return "subject missing or over 60 characters";
  if (!new RegExp(`${SITE_TOKEN.replace(/[{}]/g, "\\$&")}/claim/[A-Za-z0-9_-]{16,}`).test(body)) {
    return `body must contain a course-specific claim link (${SITE_TOKEN}/claim/<code>)`;
  }
  if (/localhost/i.test(body)) return `use ${SITE_TOKEN} for site links, not localhost`;
  if (wordCount(body) > MAX_WORDS) return `body is ${wordCount(body)} words; the limit is ${MAX_WORDS}`;
  if (/!/.test(body + subject)) return "no exclamation marks";
  if (!/\bfree\b/i.test(body)) return "the email must say claiming is free";
  if (!/first course listing/i.test(body)) return 'the free claim must be worded "first course listing" (only the first claim is free)';
  if (/claim (all|every|any number)|all (of )?your (listings|courses)/i.test(body)) return "never imply all listings can be claimed free";
  if (!/never affects/i.test(body)) return "the email must say payment never affects reviews, scores, verification, or ranking";
  if (/forever|last chance|act now|limited time|hurry|only \d+ spots|deadline|expires/i.test(body)) return "no fake urgency or 'forever' pricing";
  if (/endorse|guarantee|proves?\b.*\b(quality|profit)/i.test(body)) return "no endorsement or quality claims";
  if (/registered business/i.test(body)) return "the free badge is called Verified Business; Registered Business is retired";
  const unknown = (body.match(/\$\d[\d,]*(\.\d+)?/g) ?? []).filter((m) => !OFFER.allowedAmounts.has(m));
  if (unknown.length > 0) return `price(s) not in lib/pricing.ts: ${unknown.join(", ")}`;
  return null;
}

export async function saveDraft(id: string, d: { subject: string; body: string }): Promise<string> {
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
  return row ? "draft saved (ready_for_review)" : "rejected: needs a contact_found or ready_for_review row with an email";
}
