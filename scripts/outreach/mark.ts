// Record what happened after a send, by hand: a reply, a bounce, a wrong
// person. Gmail SMTP gives no delivery receipts, so bounces (which arrive as
// emails in the sending mailbox) and replies have to be entered here.
//
//   npm run outreach:mark -- "Carter Surach" reply
//   npm run outreach:mark -- carter@example.com bounced "mailbox full"
//
// Events: reply, positive_reply, owner_confirmed, wrong_person, not_interested,
//         bounced, complaint, unsubscribed, do_not_contact
//
// Anything that means "stop" also suppresses the address, immediately and
// permanently, in outreach_suppressions.
import { sql, findRow, suppress, recordEvent, type EventType } from "./lib";

const STOP_REASON: Record<string, string> = {
  wrong_person: "wrong_person",
  not_interested: "not_interested",
  bounced: "bounced",
  complaint: "complaint",
  unsubscribed: "unsubscribe_manual",
  do_not_contact: "do_not_contact",
};

async function main() {
  const [ref, event, ...note] = process.argv.slice(2);
  const known = ["reply", "positive_reply", "owner_confirmed", ...Object.keys(STOP_REASON)];
  if (!ref || !event || !known.includes(event)) throw new Error(`usage: outreach:mark -- <creator|email|id> <${known.join("|")}> [note]`);

  const row = await findRow(ref);
  if (!row) throw new Error(`${ref}: not found`);
  const detail = note.join(" ") || undefined;

  if (event in STOP_REASON && row.contact_email) {
    await suppress(row.contact_email, STOP_REASON[event]);
  }

  const eventType: EventType | null =
    event === "owner_confirmed" ? "positive_reply" : (event as EventType);
  if (event !== "do_not_contact") await recordEvent(row.id, eventType!, detail);
  if (event === "positive_reply" || event === "owner_confirmed") await recordEvent(row.id, "reply", detail);

  // The suppression trigger already moved stop-events to unsubscribed/bounced;
  // the specific state is set after it.
  const nextState: Record<string, string> = {
    reply: "replied", positive_reply: "replied", owner_confirmed: "owner_confirmed",
    wrong_person: "wrong_person", not_interested: "not_interested", bounced: "bounced",
    complaint: "unsubscribed", unsubscribed: "unsubscribed", do_not_contact: "do_not_contact",
  };
  await sql`UPDATE creator_outreach SET status = ${nextState[event]}, approved_at = NULL, approved_by = NULL, updated_at = now() WHERE id = ${row.id}`;
  console.log(`${row.creator_name}: ${event} recorded -> ${nextState[event]}${event in STOP_REASON ? " (address suppressed)" : ""}`);
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
