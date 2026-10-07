// The numbers that decide whether outreach is working and whether volume
// should grow: outcomes per delivered email, not sends or opens.
//
//   npm run outreach:metrics
//
// Deliberately not tracked: open rates (plain-text email has no tracking
// pixel, and opens are unreliable anyway) and link clicks (the links are plain
// URLs; claims are attributed by course instead).
import { sql } from "./lib";
import { syncMilestones } from "./sync";

async function main() {
  const changed = await syncMilestones();

  const counts = Object.fromEntries(
    (
      await sql<{ event_type: string; n: number }[]>`
        SELECT event_type, count(*)::int AS n FROM outreach_events GROUP BY event_type
      `
    ).map((r) => [r.event_type, r.n])
  ) as Record<string, number>;
  const n = (t: string) => counts[t] ?? 0;

  // Gmail SMTP only tells us a message was accepted. A bounce arrives later,
  // as an email, and is entered with outreach:mark. "Delivered" therefore means
  // sent and not (yet) bounced; read rates only after ~72 hours.
  const sent = n("sent");
  const delivered = Math.max(0, sent - n("bounced"));
  const pct = (a: number, b: number) => (b === 0 ? "n/a" : `${((a / b) * 100).toFixed(1)}%  (${a}/${b})`);

  console.log(`(synced ${changed} change(s) from the marketplace)\n`);
  console.log("Volume");
  console.log(`  sent                         ${sent}`);
  console.log(`  delivered (sent - bounced)   ${delivered}`);
  console.log(`  replies / positive           ${n("reply")} / ${n("positive_reply")}`);
  console.log(`  claim link opened            ${n("link_click")}  (upper bound: includes mail scanners)`);
  console.log("\nFunnel (counts)");
  for (const t of [
    "claim_started", "claim_completed", "business_verified", "free_verified_owner",
    "founding_subscription", "first_verified_review", "five_verified_reviews", "activated",
  ]) console.log(`  ${t.padEnd(28)} ${n(t)}`);

  console.log("\nBusiness metrics");
  console.log(`  verified claims / delivered       ${pct(n("claim_completed"), delivered)}`);
  console.log(`  paid founding conv. / delivered   ${pct(n("founding_subscription"), delivered)}`);
  console.log(`  activated listings / delivered    ${pct(n("activated"), delivered)}`);
  console.log(`  wrong-owner / contact rate        ${pct(n("wrong_person"), delivered)}`);
  console.log(`  unsubscribe rate                  ${pct(n("unsubscribed"), delivered)}`);
  console.log(`  bounce rate                       ${pct(n("bounced"), sent)}`);
  console.log(`  complaint rate                    ${pct(n("complaint"), delivered)}  (only what is entered by hand)`);

  if (sent < 30) console.log(`\nSmall sample (${sent} sent): treat every rate above as anecdote, not signal.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
