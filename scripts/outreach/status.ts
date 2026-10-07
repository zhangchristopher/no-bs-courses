// npm run outreach:status — where every creator is in the pipeline.
import { sql, syncCreators } from "./lib";

async function main() {
  await syncCreators();
  const counts = await sql<{ status: string; count: number }[]>`
    SELECT status, count(*)::int AS count FROM creator_outreach GROUP BY status ORDER BY status
  `;
  for (const c of counts) console.log(`${c.status.padEnd(22)} ${c.count}`);

  const channels = await sql<{ channel: string; count: number; with_handle: number }[]>`
    SELECT preferred_channel AS channel, count(*)::int AS count, count(instagram_handle)::int AS with_handle
    FROM creator_outreach WHERE preferred_channel IS NOT NULL GROUP BY 1 ORDER BY 1
  `;
  if (channels.length > 0) console.log("\nby channel:");
  for (const c of channels) {
    console.log(`${c.channel.padEnd(22)} ${c.count}${c.channel === "instagram" ? ` (${c.with_handle} with a handle)` : ""}`);
  }
  console.log("\nFor outcomes per delivered email, run: npm run outreach:metrics");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
