// The numbers that decide whether outreach is working and whether volume
// should grow: outcomes per delivered email, never sends or opens.
//
//   npm run outreach:metrics                    # funnel and rates
//   npm run outreach:metrics -- --by category   # the same outcomes split by a segment
//
// Segments: category, platform, price_band, creator_size, source, channel,
// variant, followup_step, confidence, testimonials, active.
//
// Deliberately not tracked: open rates (plain-text email has no tracking pixel,
// and opens are unreliable) and link clicks as a conversion signal (claims are
// attributed by course; the claim-link open count includes mail scanners).
//
// "Delivered" means accepted by SMTP and not bounced. Gmail SMTP gives no
// delivery receipts, so bounces are entered by hand (outreach:mark) and
// rates are only meaningful after a few days.
import { sql, argValue } from "./lib";
import { syncMilestones } from "./sync";

// Fixed whitelist: these expressions are never built from user input.
const SEGMENTS: Record<string, string> = {
  category: "COALESCE(c.category, '(none)')",
  platform: "COALESCE(c.platform, '(none)')",
  price_band:
    "CASE WHEN f.price IS NULL THEN 'unknown' WHEN f.price = 0 THEN 'free' WHEN f.price < 100 THEN 'under $100' WHEN f.price < 500 THEN '$100-$499' ELSE '$500+' END",
  creator_size: "COALESCE(o.creator_size, 'unknown')",
  source: "COALESCE(o.contact_source_type, 'unknown')",
  channel: "COALESCE(o.preferred_channel, 'unknown')",
  variant: "o.message_variant",
  followup_step: "(SELECT COALESCE(max(step), 0)::text FROM outreach_followups fu WHERE fu.outreach_id = o.id AND fu.status = 'sent')",
  confidence: "COALESCE(o.contact_confidence, 'none')",
  testimonials: "CASE o.testimonials_visible WHEN true THEN 'visible' WHEN false THEN 'not visible' ELSE 'unknown' END",
  active: "COALESCE(o.appears_active, 'unknown')",
};

const pct = (a: number, b: number) => (b === 0 ? "n/a" : `${((a / b) * 100).toFixed(1)}%  (${a}/${b})`);

async function bySegment(dimension: string) {
  const expr = SEGMENTS[dimension];
  if (!expr) throw new Error(`--by must be one of: ${Object.keys(SEGMENTS).join(", ")}`);
  const rows = await sql.unsafe(`
    SELECT ${expr} AS segment,
      count(*)::int AS researched,
      count(*) FILTER (WHERE o.sent_at IS NOT NULL)::int AS sent,
      count(*) FILTER (WHERE o.sent_at IS NOT NULL AND NOT COALESCE(ev.bounced, false))::int AS delivered,
      count(*) FILTER (WHERE ev.replied)::int AS replied,
      count(*) FILTER (WHERE ev.positive)::int AS positive,
      count(*) FILTER (WHERE ev.claimed)::int AS claimed,
      count(*) FILTER (WHERE ev.founding)::int AS founding,
      count(*) FILTER (WHERE ev.activated)::int AS activated,
      count(*) FILTER (WHERE ev.unsub)::int AS unsubscribed,
      count(*) FILTER (WHERE ev.bounced)::int AS bounced,
      round(avg(o.prospect_score))::int AS avg_score
    FROM creator_outreach o
    LEFT JOIN courses c ON c.id = o.course_ids[1]
    LEFT JOIN course_owner_fields f ON f.course_id = c.id
    LEFT JOIN LATERAL (
      SELECT bool_or(event_type = 'bounced') AS bounced, bool_or(event_type = 'reply') AS replied,
             bool_or(event_type = 'positive_reply') AS positive, bool_or(event_type = 'claim_completed') AS claimed,
             bool_or(event_type = 'founding_subscription') AS founding, bool_or(event_type = 'activated') AS activated,
             bool_or(event_type = 'unsubscribed') AS unsub
      FROM outreach_events e WHERE e.outreach_id = o.id
    ) ev ON true
    WHERE o.researched_at IS NOT NULL
    GROUP BY 1 ORDER BY sent DESC, researched DESC
  `);
  console.log(`By ${dimension} (outcomes count only for creators who were sent Email 1):\n`);
  console.log("segment".padEnd(26) + ["researched", "sent", "deliv", "reply", "pos", "claim", "found", "activ", "unsub", "bounce", "score"].map((h) => h.padStart(10)).join(""));
  for (const r of rows) {
    console.log(
      String(r.segment).slice(0, 25).padEnd(26) +
        [r.researched, r.sent, r.delivered, r.replied, r.positive, r.claimed, r.founding, r.activated, r.unsubscribed, r.bounced, r.avg_score ?? "-"]
          .map((v) => String(v).padStart(10)).join("")
    );
  }
  const sent = rows.reduce((a, r) => a + r.sent, 0);
  if (sent < 30) console.log(`\nSmall sample (${sent} sent). These are for recording, not for changing strategy.`);
}

async function main() {
  const dimension = argValue("--by");
  const changed = await syncMilestones();
  if (dimension) return bySegment(dimension);

  const counts = Object.fromEntries(
    (await sql<{ event_type: string; n: number }[]>`SELECT event_type, count(*)::int AS n FROM outreach_events GROUP BY event_type`).map((r) => [r.event_type, r.n])
  ) as Record<string, number>;
  const n = (t: string) => counts[t] ?? 0;
  const [f] = await sql<{ researched: number; qualified: number; drafted: number; approved: number; sent: number }[]>`
    SELECT count(*) FILTER (WHERE researched_at IS NOT NULL)::int AS researched,
           count(*) FILTER (WHERE researched_at IS NOT NULL AND contact_confidence IN ('high', 'medium'))::int AS qualified,
           count(*) FILTER (WHERE drafted_at IS NOT NULL)::int AS drafted,
           count(*) FILTER (WHERE approved_at IS NOT NULL OR sent_at IS NOT NULL)::int AS approved,
           count(*) FILTER (WHERE sent_at IS NOT NULL)::int AS sent
    FROM creator_outreach`;
  const sent = Math.max(f.sent, n("sent"));
  const delivered = Math.max(0, sent - n("bounced"));

  console.log(`(synced ${changed} change(s) from the marketplace)\n`);
  console.log("Funnel");
  const stages: [string, number][] = [
    ["RESEARCHED", f.researched], ["QUALIFIED (high/medium match)", f.qualified], ["DRAFTED", f.drafted], ["APPROVED", f.approved],
    ["SENT", sent], ["DELIVERED (accepted, not bounced)", delivered], ["REPLIED", n("reply")], ["POSITIVE_REPLY", n("positive_reply")],
    ["CLAIM_STARTED", n("claim_started")], ["CLAIMED", n("claim_completed")], ["BUSINESS_VERIFIED", n("business_verified")],
    ["FREE_OWNER", n("free_verified_owner")], ["FOUNDING_OWNER", n("founding_subscription")],
    ["FIRST_PURCHASE_VERIFIED_REVIEW", n("first_verified_review")], ["FIVE_PURCHASE_VERIFIED_REVIEWS", n("five_verified_reviews")],
    ["ACTIVATED (claimed + 1 verified-purchase review)", n("activated")],
  ];
  for (const [name, v] of stages) console.log(`  ${name.padEnd(50)} ${v}`);
  console.log(`  ${"claim link opened (upper bound, includes scanners)".padEnd(50)} ${n("link_click")}`);
  console.log(`  ${"follow-up 1 / follow-up 2 sent".padEnd(50)} ${n("followup_1_sent")} / ${n("followup_2_sent")}`);

  console.log("\nRates, per delivered outreach");
  console.log(`  reply rate                        ${pct(n("reply"), delivered)}`);
  console.log(`  positive reply rate               ${pct(n("positive_reply"), delivered)}`);
  console.log(`  verified claims                   ${pct(n("claim_completed"), delivered)}`);
  console.log(`  business verification rate        ${pct(n("business_verified"), delivered)}`);
  console.log(`  Founding Owner conversion         ${pct(n("founding_subscription"), delivered)}`);
  console.log(`  activation rate                   ${pct(n("activated"), delivered)}`);
  console.log(`  wrong-owner rate                  ${pct(n("wrong_person"), delivered)}`);
  console.log(`  unsubscribe rate                  ${pct(n("unsubscribed"), delivered)}`);
  console.log(`  bounce rate (of sent)             ${pct(n("bounced"), sent)}`);
  console.log(`  complaint rate                    ${pct(n("complaint"), delivered)}  (only complaints entered by hand)`);

  if (sent < 30) console.log(`\nSmall sample (${sent} sent): treat every rate as anecdote, not signal. Open rate is intentionally not tracked.`);
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
