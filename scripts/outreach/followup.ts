// The follow-up sequence: Email 2 (about 3 days after Email 1) and Email 3
// (about 7 days after), then stop. Drafting and approval only. There is no
// follow-up send command yet; adding one is a separate, deliberate step.
//
//   npm run outreach:followup -- preview                    # the exact text, no database
//   npm run outreach:followup -- plan                       # who is due, who is blocked and why
//   npm run outreach:followup -- sweep                      # cancel every sequence that must stop
//   npm run outreach:followup -- draft "<creator>" --step 1 [--greeting "<name>"]
//   npm run outreach:followup -- approve "<creator>" --step 1 --by "<you>"   # human only
import { sql, findRow, coursesFor, ensureInvitation, argValue, SITE_TOKEN, type OutreachRow } from "./lib";
import { renderFollowUp, DUE_DAYS, MAX_STEP } from "./followups";
import { verdictFor, sweepSequences } from "./sequence";
import { lintDraft } from "./drafts";
import { wordCount } from "./template";

function step(): 1 | 2 {
  const s = Number(argValue("--step"));
  if (s !== 1 && s !== 2) throw new Error("--step must be 1 or 2");
  return s as 1 | 2;
}

async function preview() {
  for (const s of [1, 2] as const) {
    const d = renderFollowUp(s, { greetingName: "Adam", courseTitle: "Podcasting Business School", claimCode: "SAMPLE-CODE-0123456789" });
    const problem = lintDraft(d.subject, d.body);
    console.log(`=== Follow-up ${s} (due about ${DUE_DAYS[s]}+ days after Email 1) | ${wordCount(d.body)} words | rules: ${problem ?? "pass"}`);
    console.log(`Subject: ${d.subject}\n\n${d.body.replaceAll(SITE_TOKEN, "https://www.nobscourses.com")}\n`);
  }
}

async function plan() {
  const rows = await sql<OutreachRow[]>`SELECT * FROM creator_outreach WHERE sent_at IS NOT NULL ORDER BY sent_at`;
  if (rows.length === 0) return console.log("Nothing has been sent, so no follow-up is due or possible.");
  for (const row of rows) {
    for (const s of [1, 2] as const) {
      const { verdict } = await verdictFor(row, s);
      console.log(`${row.creator_name} | step ${s}: ${verdict.due ? "DUE" : verdict.eligible ? "not due yet" : "BLOCKED"}${verdict.reasons.length ? ` (${verdict.reasons.join("; ")})` : ""}`);
    }
  }
}

async function draft(ref: string) {
  const row = await findRow(ref);
  if (!row) throw new Error(`${ref}: not found`);
  const s = step();
  const { verdict } = await verdictFor(row, s);
  if (!verdict.eligible) throw new Error(`${row.creator_name}: no follow-up ${s}: ${verdict.reasons.join("; ")}`);
  const courses = await coursesFor(row);
  if (courses.length !== 1) throw new Error(`${row.creator_name}: ${courses.length} listings; draft by hand`);

  const greeting = argValue("--greeting") ?? (/[&,]| and /.test(row.creator_name) ? null : row.creator_name.split(/\s+/)[0]);
  const code = await ensureInvitation(row.id, courses[0].id);
  const d = renderFollowUp(s, { greetingName: greeting, courseTitle: courses[0].title, claimCode: code });
  const problem = lintDraft(d.subject, d.body);
  if (problem) throw new Error(`${row.creator_name}: draft rejected: ${problem}`);

  await sql`
    INSERT INTO outreach_followups (outreach_id, step, subject, body) VALUES (${row.id}, ${s}, ${d.subject}, ${d.body})
    ON CONFLICT (outreach_id, step) DO UPDATE SET subject = EXCLUDED.subject, body = EXCLUDED.body,
      status = 'drafted', drafted_at = now(), approved_at = NULL, approved_by = NULL
    WHERE outreach_followups.status IN ('drafted', 'approved')
  `;
  console.log(`${row.creator_name}: follow-up ${s} drafted (${wordCount(d.body)} words). ${verdict.due ? "Due now." : "Not due yet."}`);
}

async function approve(ref: string) {
  const by = argValue("--by");
  if (!by) throw new Error('--by "<your name>" is required');
  const row = await findRow(ref);
  if (!row) throw new Error(`${ref}: not found`);
  const s = step();
  const { verdict } = await verdictFor(row, s);
  if (!verdict.due) throw new Error(`${row.creator_name}: follow-up ${s} can't be approved: ${verdict.eligible ? "not due yet" : verdict.reasons.join("; ")}`);
  const [r] = await sql`
    UPDATE outreach_followups SET status = 'approved', approved_at = now(), approved_by = ${by}
    WHERE outreach_id = ${row.id} AND step = ${s} AND status = 'drafted' RETURNING step
  `;
  if (!r) throw new Error(`${row.creator_name}: no drafted follow-up ${s} to approve`);
  console.log(`${row.creator_name}: follow-up ${s} approved by ${by}. (Nothing is sent: there is no follow-up send command yet.)`);
}

async function main() {
  const [cmd, ref] = process.argv.slice(2);
  if (cmd === "preview") return preview();
  if (cmd === "plan") return plan();
  if (cmd === "sweep") {
    const stopped = await sweepSequences();
    return console.log(stopped.length ? stopped.map((s) => `${s.name}: sequence stopped (${s.reason})`).join("\n") : "No running sequence needed stopping.");
  }
  if (cmd === "draft" && ref) return draft(ref);
  if (cmd === "approve" && ref) return approve(ref);
  throw new Error(`usage: outreach:followup -- preview | plan | sweep | draft "<creator>" --step 1|2 | approve "<creator>" --step 1|2 --by "<you>" (max step ${MAX_STEP})`);
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
