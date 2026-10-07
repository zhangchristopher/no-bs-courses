// Inbound creator replies. Paste a reply in, and the deterministic classifier
// decides what it is, applies the pipeline effects that must happen at once
// (an unsubscribe suppresses the address first, before anything else), stops
// the follow-up sequence, and stores a suggested response. It never sends.
//
//   npm run outreach:reply -- "<creator>" --file reply.txt
//   npm run outreach:reply -- "<creator>" --text "Yes that's my course, how do I claim?"
//   npm run outreach:reply -- list                         # replies a person still has to handle
//   npm run outreach:reply -- handled <reply-id> --by "<you>"
import fs from "node:fs";
import { sql, findRow, coursesFor, ensureInvitation, suppress, recordEvent, argValue, SITE_TOKEN } from "./lib";
import { classifyReply, pipelineEffect, renderTemplate, replyOwnText } from "./replies";
import { stopSequence } from "./sequence";

async function ingest(ref: string) {
  const file = argValue("--file");
  const text = file ? fs.readFileSync(file, "utf8") : argValue("--text");
  if (!text) throw new Error("give the reply with --file <path> or --text \"...\"");
  const row = await findRow(ref);
  if (!row) throw new Error(`${ref}: not found`);

  const c = classifyReply(text);
  const effect = pipelineEffect(c.classification);

  // 1. Opt-outs and other stop signals act immediately and cannot be overridden.
  if (effect.suppress && row.contact_email) await suppress(row.contact_email, effect.suppress);

  // 2. Events and state.
  for (const e of effect.events) await recordEvent(row.id, e, c.classification);
  const mayMove = ["sent", "replied", "owner_confirmed", "send_failed"].includes(row.status);
  if (effect.status && (effect.suppress || mayMove)) {
    await sql`UPDATE creator_outreach SET status = ${effect.status}, approved_at = NULL, approved_by = NULL, updated_at = now() WHERE id = ${row.id}`;
  }
  if (effect.stopSequence) await stopSequence(row.id, effect.stopSequence);

  // 3. A suggested response, from a fixed template, for a person to send or discard.
  let suggested: string | null = null;
  if (c.template) {
    const courses = await coursesFor(row);
    const code = courses.length === 1 ? await ensureInvitation(row.id, courses[0].id) : null;
    if (courses.length === 1 && code) {
      const first = /[&,]| and /.test(row.creator_name) ? null : row.creator_name.split(/\s+/)[0];
      suggested = renderTemplate(c.template, { name: first, title: courses[0].title, claimUrl: `${SITE_TOKEN}/claim/${code}` });
    }
  }

  const [saved] = await sql`
    INSERT INTO outreach_replies (outreach_id, body, classification, confidence, recommended_action, auto_response_permitted, human_review_required, suggested_response)
    VALUES (${row.id}, ${text}, ${c.classification}, ${c.confidence}, ${c.recommendedAction}, ${c.autoResponsePermitted}, ${c.humanReviewRequired}, ${suggested})
    RETURNING id
  `;

  console.log(
    `${row.creator_name}: ${c.classification} (confidence ${c.confidence})\n` +
      `  action: ${c.recommendedAction}\n` +
      `  auto response permitted: ${c.autoResponsePermitted} | human review required: ${c.humanReviewRequired}\n` +
      `  reasons: ${c.reasons.join("; ")}\n` +
      `  pipeline: ${effect.status ?? "(unchanged)"}${effect.suppress ? ", address suppressed" : ""}${effect.stopSequence ? `, sequence stopped (${effect.stopSequence})` : ""}\n` +
      `  reply id: ${saved.id}  (own words used: ${replyOwnText(text).split(/\s+/).length})` +
      (suggested ? `\n--- suggested response (not sent) ---\n${suggested}` : "")
  );
}

async function list() {
  const rows = await sql`
    SELECT r.id, o.creator_name, r.classification, r.confidence, r.received_at
    FROM outreach_replies r JOIN creator_outreach o ON o.id = r.outreach_id
    WHERE r.human_review_required AND r.handled_at IS NULL ORDER BY r.received_at
  `;
  console.log(rows.length ? rows.map((r) => `${r.id}  ${r.creator_name}  ${r.classification} (${r.confidence})`).join("\n") : "No replies waiting for a person.");
}

async function handled(id: string) {
  const by = argValue("--by");
  if (!by) throw new Error('--by "<your name>" is required');
  const r = await sql`UPDATE outreach_replies SET handled_at = now(), handled_by = ${by} WHERE id = ${id} AND handled_at IS NULL RETURNING id`;
  console.log(r.length ? "marked handled" : "not found or already handled");
}

async function main() {
  const [a, b] = process.argv.slice(2);
  if (a === "list") return list();
  if (a === "handled" && b) return handled(b);
  if (a) return ingest(a);
  throw new Error('usage: outreach:reply -- "<creator>" --file <path> | --text "..." | list | handled <id> --by "<you>"');
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
