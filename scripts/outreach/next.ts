// Prints the next batch of creators to work on, as JSON, for the
// creator-outreach skill (.claude/skills/creator-outreach) to research or
// draft in a Claude Code session.
//
//   npm run -s outreach:next -- --stage research --limit 10
//   npm run -s outreach:next -- --stage draft --limit 10
import { sql, syncCreators, coursesFor, argValue, SITE_TOKEN, type OutreachRow } from "./lib";

async function main() {
  const stage = argValue("--stage") ?? "research";
  const limit = Number(argValue("--limit") ?? 10);
  await syncCreators();

  const rows =
    stage === "draft"
      ? await sql<OutreachRow[]>`
          SELECT * FROM creator_outreach
          WHERE status = 'contact_found' AND contact_email IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM outreach_suppressions s WHERE lower(s.email) = lower(contact_email))
          ORDER BY creator_name LIMIT ${limit}
        `
      : await sql<OutreachRow[]>`
          SELECT * FROM creator_outreach
          WHERE status = 'unresearched' AND researched_at IS NULL
          ORDER BY creator_name LIMIT ${limit}
        `;

  const batch = await Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      creator_name: row.creator_name,
      ...(stage === "draft" && {
        contact_email: row.contact_email,
        research_notes: row.research_notes,
      }),
      courses: (await coursesFor(row)).map((c) => ({
        title: c.title,
        slug: c.slug,
        platform: c.platform,
        platform_url: c.platform_url,
        listing_url: `${SITE_TOKEN}/courses/${c.slug}`,
        reviews: c.total_reviews,
      })),
    }))
  );
  console.log(JSON.stringify(batch, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
