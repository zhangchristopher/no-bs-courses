// Builds and saves Email 1 for one creator, with a course-specific claim link.
//
//   npm run -s outreach:draft -- "Carter Surach"
//   npm run -s outreach:draft -- "Bryan Franklin & Jennifer Russell" --greeting "Bryan and Jennifer"
//
// The greeting defaults to the first name only when the creator field is
// plainly one person; otherwise "there". Creators with more than one unclaimed
// listing are refused: only the first claim is free, so those need a human.
import { sql, findRow, coursesFor, ensureInvitation, argValue } from "./lib";
import { renderFirstEmail, wordCount } from "./template";
import { saveDraft } from "./drafts";

function defaultGreeting(name: string): string | null {
  if (/[&,]| and |team|coach(es)?$|academy|school|community/i.test(name)) return null;
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts.length <= 3 ? parts[0] : null;
}

async function main() {
  const ref = process.argv[2];
  if (!ref || ref.startsWith("--")) throw new Error('usage: outreach:draft -- "<creator>" [--greeting "<name>"]');
  const row = await findRow(ref);
  if (!row) throw new Error(`${ref}: not found`);
  if (!row.contact_email) throw new Error(`${row.creator_name}: no contact email`);

  const courses = await coursesFor(row);
  if (courses.length !== 1) throw new Error(`${row.creator_name}: has ${courses.length} listings; only the first claim is free, so draft this one by hand`);

  const greeting = argValue("--greeting") ?? defaultGreeting(row.creator_name);
  const claimCode = await ensureInvitation(row.id, courses[0].id);
  const draft = renderFirstEmail({ greetingName: greeting, courseTitle: courses[0].title, claimCode });
  const result = await saveDraft(row.id, draft);
  console.log(`${row.creator_name}: ${result} (${wordCount(draft.body)} words)`);
  if (result.startsWith("rejected")) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
