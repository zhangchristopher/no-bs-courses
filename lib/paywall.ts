import sql from "@/lib/db";

export type UnlockState =
  | { unlocked: true }
  | { unlocked: false; reason: "signin_required" }
  | { unlocked: false; reason: "limit_reached"; bonusCredits: number };

// Free courses (no price, or price 0) are never gated. Paid courses require
// a signed-in account: active $5/mo plan unlocks everything; otherwise the
// first 3 distinct courses per calendar month unlock automatically and stay
// unlocked permanently; a reviewer's own verified-purchase review on this
// course auto-unlocks it too. Past that, the caller can offer a bonus
// credit, a $0.99 one-time unlock, or the $5/mo upgrade.
//
// A course's own owner is always unlocked for that course specifically —
// checked here (not left to the caller) so this bypass can never be
// forgotten by a future call site. Ownership means verified_owner_id
// matches and the claim is 'pending' or 'verified' (not 'unclaimed' or
// rejected) — a live DB check, not something the caller pre-computes, since
// this is a learner-vs-owner session boundary that's easy to get wrong (see
// the bug this fixed: the paywall only ever checked the learner session,
// so an owner with no paired learner account was locked out of their own
// listing).
export async function checkCourseAccess(
  courseId: string,
  price: string | null,
  userId: string | null,
  ownerId: string | null = null
): Promise<UnlockState> {
  if (ownerId) {
    const [owned] = await sql<{ id: string }[]>`
      SELECT id FROM courses
      WHERE id = ${courseId} AND verified_owner_id = ${ownerId} AND verification_status IN ('pending', 'verified')
    `;
    if (owned) return { unlocked: true };
  }

  if (!price || Number(price) <= 0) return { unlocked: true };
  if (!userId) return { unlocked: false, reason: "signin_required" };

  const [user] = await sql<{ plan_subscription_status: string; bonus_unlock_credits: number }[]>`
    SELECT plan_subscription_status, bonus_unlock_credits FROM users WHERE id = ${userId}
  `;
  if (!user) return { unlocked: false, reason: "signin_required" };
  if (user.plan_subscription_status === "active") return { unlocked: true };

  const [existing] = await sql`
    SELECT 1 FROM course_unlocks WHERE user_id = ${userId} AND course_id = ${courseId}
  `;
  if (existing) return { unlocked: true };

  const [ownReview] = await sql<{ id: string }[]>`
    SELECT id FROM reviews
    WHERE course_id = ${courseId} AND reviewer_id = ${userId} AND verified_purchase = true
    LIMIT 1
  `;
  if (ownReview) {
    await sql`
      INSERT INTO course_unlocks (user_id, course_id, source)
      VALUES (${userId}, ${courseId}, 'own_verified_review')
      ON CONFLICT (user_id, course_id) DO NOTHING
    `;
    return { unlocked: true };
  }

  const [{ count }] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM course_unlocks
    WHERE user_id = ${userId} AND source = 'free_monthly' AND unlocked_at >= date_trunc('month', now())
  `;
  if (count < 3) {
    await sql`
      INSERT INTO course_unlocks (user_id, course_id, source)
      VALUES (${userId}, ${courseId}, 'free_monthly')
      ON CONFLICT (user_id, course_id) DO NOTHING
    `;
    return { unlocked: true };
  }

  return { unlocked: false, reason: "limit_reached", bonusCredits: user.bonus_unlock_credits };
}

export async function spendBonusCredit(userId: string, courseId: string): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    UPDATE users
    SET bonus_unlock_credits = bonus_unlock_credits - 1
    WHERE id = ${userId} AND bonus_unlock_credits > 0
    RETURNING id
  `;
  if (rows.length === 0) return false;

  await sql`
    INSERT INTO course_unlocks (user_id, course_id, source)
    VALUES (${userId}, ${courseId}, 'bonus_credit')
    ON CONFLICT (user_id, course_id) DO NOTHING
  `;
  return true;
}

export async function getAccountSummary(userId: string) {
  const [user] = await sql<
    { plan_subscription_status: string; bonus_unlock_credits: number; email: string }[]
  >`
    SELECT plan_subscription_status, bonus_unlock_credits, email FROM users WHERE id = ${userId}
  `;
  const [{ count: unlocksThisMonth }] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM course_unlocks
    WHERE user_id = ${userId} AND source = 'free_monthly' AND unlocked_at >= date_trunc('month', now())
  `;

  return { ...user, unlocksThisMonth };
}
