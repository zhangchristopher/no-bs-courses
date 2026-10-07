// Human approval of specific recipients. Nothing is sent unless it went
// through here, one recipient and one exact draft at a time.
//
//   npm run outreach:approve -- "Carter Surach" --by Christopher
//   npm run outreach:approve -- <id-or-name-or-email> [more...] --by <your name>
//
// Moves ready_for_review -> approved_for_outreach and prints the exact text
// that was approved. Run by a person; the creator-outreach skill never does.
import { sql, findRow, isSuppressed, argValue, SITE_TOKEN } from "./lib";

async function main() {
  const by = argValue("--by");
  const refs = process.argv.slice(2).filter((a, i, all) => !a.startsWith("--") && all[i - 1] !== "--by");
  if (!by || refs.length === 0) throw new Error('usage: outreach:approve -- <creator> [more...] --by "<your name>"');

  for (const ref of refs) {
    const row = await findRow(ref);
    if (!row) { console.log(`${ref}: not found`); continue; }
    if (row.status !== "ready_for_review") { console.log(`${row.creator_name}: is ${row.status}, not ready_for_review`); continue; }
    if (!row.email_body || !row.contact_email) { console.log(`${row.creator_name}: no draft`); continue; }
    if (await isSuppressed(row.contact_email)) { console.log(`${row.creator_name}: address is suppressed`); continue; }

    const [claimed] = await sql`SELECT 1 FROM courses WHERE id = ANY(${row.course_ids}) AND verification_status <> 'unclaimed'`;
    if (claimed) { console.log(`${row.creator_name}: a listing is already claimed or under review`); continue; }

    await sql`
      UPDATE creator_outreach SET status = 'approved_for_outreach', approved_at = now(), approved_by = ${by}, updated_at = now()
      WHERE id = ${row.id} AND status = 'ready_for_review'
    `;
    console.log(`\n${row.creator_name} <${row.contact_email}> approved by ${by}\nSubject: ${row.email_subject}\n\n${row.email_body.replaceAll(SITE_TOKEN, "(site)")}\n`);
  }
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
