// Pulls the marketplace events we can observe straight from the database into
// the outreach pipeline: claims, business verification, subscriptions,
// verified-purchase reviews. Run by outreach:metrics, or on its own.
//
// Attribution is by course: a recipient is credited when a course on their
// outreach row gets claimed, whatever route the owner took to the site. There
// is no click tracking (see the note in outreach:metrics).
import { sql, recordEvent, type OutreachRow, type EventType } from "./lib";

// "Activated" = a verified claimed listing with real marketplace activity,
// not merely a payment. Initial definition: at least this many
// verified-purchase reviews. Raise it as the marketplace grows.
export const ACTIVATION_MIN_VERIFIED_REVIEWS = 1;

const ADVANCEABLE = [
  "sent", "replied", "owner_confirmed", "claim_started", "claimed", "business_verified",
  "free_owner", "founding_subscriber", "activated",
];

export async function syncMilestones(): Promise<number> {
  const rows = await sql<OutreachRow[]>`SELECT * FROM creator_outreach WHERE sent_at IS NOT NULL`;
  let changed = 0;

  for (const row of rows) {
    const courses = await sql<
      { verification_status: string; business_verification_status: string | null; business_subscription_status: string | null }[]
    >`
      SELECT c.verification_status, o.business_verification_status, o.business_subscription_status
      FROM courses c LEFT JOIN owners o ON o.id = c.verified_owner_id
      WHERE c.id = ANY(${row.course_ids})
    `;
    const [{ n: verifiedReviews }] = await sql<{ n: number }[]>`
      SELECT count(*)::int AS n FROM reviews WHERE course_id = ANY(${row.course_ids}) AND verified_purchase
    `;

    const [invitation] = await sql<{ first_opened_at: Date | null; claim_started_at: Date | null }[]>`
      SELECT min(first_opened_at) AS first_opened_at, min(claim_started_at) AS claim_started_at
      FROM claim_invitations WHERE outreach_id = ${row.id}
    `;

    const claimStarted = Boolean(invitation?.claim_started_at) || courses.some((c) => ["pending", "verified"].includes(c.verification_status));
    const claimed = courses.some((c) => c.verification_status === "verified");
    const bizVerified = courses.some(
      (c) => ["pending", "verified"].includes(c.verification_status) && c.business_verification_status === "verified"
    );
    const subscribed = courses.some((c) => c.business_subscription_status === "active");

    const events: [boolean, EventType, string?][] = [
      // Opens include mail-security scanners, so this is an upper bound on human
      // clicks and is never used as a conversion signal.
      [Boolean(invitation?.first_opened_at), "link_click", "claim link opened; may include automated scanners"],
      [claimStarted, "claim_started"],
      [claimed, "claim_completed"],
      [bizVerified, "business_verified"],
      [claimed && !subscribed, "free_verified_owner"],
      // The tier (founding vs standard) isn't stored on the owner; while the
      // founding offer is open every new subscriber is a founding one.
      [subscribed, "founding_subscription", "active subscription; tier not stored on owners"],
      [claimed && verifiedReviews >= 1, "first_verified_review"],
      [claimed && verifiedReviews >= 5, "five_verified_reviews"],
      [claimed && verifiedReviews >= ACTIVATION_MIN_VERIFIED_REVIEWS, "activated"],
    ];
    for (const [happened, type, detail] of events) {
      if (happened && (await recordEvent(row.id, type, detail))) changed++;
    }

    const next =
      claimed && verifiedReviews >= ACTIVATION_MIN_VERIFIED_REVIEWS ? "activated"
      : claimed && subscribed ? "founding_subscriber"
      : claimed ? "free_owner"
      : claimStarted ? "claim_started"
      : null;
    if (next && next !== row.status && ADVANCEABLE.includes(row.status)) {
      await sql`UPDATE creator_outreach SET status = ${next}, updated_at = now() WHERE id = ${row.id}`;
      changed++;
    }
  }
  return changed;
}

if (require.main === module) {
  syncMilestones()
    .then((n) => console.log(`${n} change(s) synced.`))
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => sql.end());
}
