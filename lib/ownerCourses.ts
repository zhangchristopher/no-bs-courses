import sql from "@/lib/db";

export type OwnerCourseSummary = {
  id: string;
  slug: string;
  title: string;
  provider_name: string;
  verification_status: string;
  contract_signed_at: string | null;
  affiliate_link_status: string;
};

export type OwnerCourseEdit = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  syllabus: string | null;
  price: string | null;
  compare_at_price: string | null;
  duration_hours: string | null;
  prerequisites: string | null;
  thumbnail_url: string | null;
  contract_signed_at: string | null;
  affiliate_link_status: string;
};

export type OwnerCourseContract = {
  id: string;
  slug: string;
  title: string;
  affiliate_url: string | null;
  contract_signed_at: string | null;
  contract_signed_name: string | null;
  affiliate_link_status: string;
  affiliate_link_rejection_reason: string | null;
};

export type OwnerPendingListing = {
  course_id: string;
  slug: string;
  title: string;
  submitted_at: string;
};

export type OwnerPendingClaim = {
  course_id: string;
  slug: string;
  title: string;
};

export type OwnerRejectedClaim = {
  course_id: string;
  slug: string;
  title: string;
  claim_rejection_reason: string;
};

export type AdminPendingClaim = {
  course_id: string;
  slug: string;
  title: string;
  provider_name: string;
  owner_id: string;
  owner_email: string;
  owner_name: string | null;
};

export type OwnerVerifiedCourse = {
  id: string;
  slug: string;
  title: string;
};

// Analytics are only for courses whose affiliate link has been admin-verified
// — not just owned, and not just "contract signed."
export async function getOwnedVerifiedCourse(
  slug: string,
  ownerId: string
): Promise<OwnerVerifiedCourse | null> {
  const rows = await sql<OwnerVerifiedCourse[]>`
    SELECT id, slug, title
    FROM courses
    WHERE slug = ${slug} AND verified_owner_id = ${ownerId} AND affiliate_link_status = 'verified'
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export function courseSlugBase(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

export async function generateUniqueCourseSlug(title: string): Promise<string> {
  const base = courseSlugBase(title) || "course";
  let slug = base;
  let suffix = 2;

  for (;;) {
    const [existing] = await sql`SELECT 1 FROM courses WHERE slug = ${slug} LIMIT 1`;
    if (!existing) return slug;
    slug = `${base}-${suffix}`;
    suffix++;
  }
}

// Anyone (a learner or an owner) can submit a new course. It's pure content
// contribution — listing_status='pending' means it's not public yet and no
// ownership is implied; added_by_* just records who submitted it.
export async function createCourse(params: {
  title: string;
  providerName: string;
  platformUrl: string;
  platform: string | null;
  category: string | null;
  description: string | null;
  syllabus: string | null;
  price: number | null;
  durationHours: number | null;
  prerequisites: string | null;
  thumbnailUrl: string | null;
  addedByUserId: string | null;
  addedByOwnerId: string | null;
}): Promise<{ id: string; slug: string }> {
  const slug = await generateUniqueCourseSlug(params.title);

  const [course] = await sql<{ id: string; slug: string }[]>`
    INSERT INTO courses (
      slug, title, provider_name, platform_url, platform, category,
      listing_status, added_by_user_id, added_by_owner_id
    )
    VALUES (
      ${slug}, ${params.title}, ${params.providerName}, ${params.platformUrl}, ${params.platform},
      ${params.category}, 'pending', ${params.addedByUserId}, ${params.addedByOwnerId}
    )
    RETURNING id, slug
  `;

  // No compare_at_price here — discounts are an affiliate-only perk, set
  // later via updateCourseDiscount() once the course's affiliate link is
  // admin-verified. It defaults to NULL.
  await sql`
    INSERT INTO course_owner_fields (
      course_id, description, syllabus, price, duration_hours, prerequisites, thumbnail_url
    )
    VALUES (
      ${course.id}, ${params.description}, ${params.syllabus}, ${params.price},
      ${params.durationHours}, ${params.prerequisites}, ${params.thumbnailUrl}
    )
  `;

  return course;
}

// Ownership is enforced in the WHERE clause, not just at the UI layer:
// a course only appears here if verified_owner_id actually matches this
// owner AND admin has actually approved the claim (verification_status =
// 'verified') — a pending or rejected claim doesn't count as "owned" yet.
export async function getCoursesOwnedBy(ownerId: string): Promise<OwnerCourseSummary[]> {
  return sql<OwnerCourseSummary[]>`
    SELECT id, slug, title, provider_name, verification_status, contract_signed_at, affiliate_link_status
    FROM courses
    WHERE verified_owner_id = ${ownerId} AND verification_status = 'verified'
    ORDER BY title
  `;
}

// Used for the "one free claim without a subscription" cap — counts a
// pending claim too, not just an approved one, so a non-subscriber can't
// submit several claims at once while waiting on admin review.
export async function getOwnedCourseCount(ownerId: string): Promise<number> {
  const [row] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM courses
    WHERE verified_owner_id = ${ownerId} AND verification_status IN ('pending', 'verified')
  `;
  return row.count;
}

export async function getOwnerPendingClaims(ownerId: string): Promise<OwnerPendingClaim[]> {
  return sql<OwnerPendingClaim[]>`
    SELECT id AS course_id, slug, title
    FROM courses
    WHERE verified_owner_id = ${ownerId} AND verification_status = 'pending'
    ORDER BY title
  `;
}

export async function getOwnerRejectedClaims(ownerId: string): Promise<OwnerRejectedClaim[]> {
  return sql<OwnerRejectedClaim[]>`
    SELECT id AS course_id, slug, title, claim_rejection_reason
    FROM courses
    WHERE claim_rejection_owner_id = ${ownerId}
      AND verification_status = 'unclaimed'
      AND claim_rejection_reason IS NOT NULL
    ORDER BY title
  `;
}

// Editing requires ownership AND the owner's Registered Business subscription
// being active (owner-level, not a per-course flag). Admin-approved paperwork
// alone ("business_verification_status='verified'") grants ownership but not
// editing control. Also requires the claim itself to be admin-approved
// (verification_status='verified'), not just pending review.
export async function getOwnedCourseForEdit(
  slug: string,
  ownerId: string
): Promise<OwnerCourseEdit | null> {
  const rows = await sql<OwnerCourseEdit[]>`
    SELECT
      c.id, c.slug, c.title, c.contract_signed_at, c.affiliate_link_status,
      cof.description, cof.syllabus, cof.price, cof.compare_at_price,
      cof.duration_hours, cof.prerequisites, cof.thumbnail_url
    FROM courses c
    LEFT JOIN course_owner_fields cof ON cof.course_id = c.id
    JOIN owners o ON o.id = c.verified_owner_id
    WHERE c.slug = ${slug} AND c.verified_owner_id = ${ownerId}
      AND c.verification_status = 'verified' AND o.business_subscription_status = 'active'
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function updateOwnerCourseFields(params: {
  courseId: string;
  ownerId: string;
  description: string | null;
  syllabus: string | null;
  price: number | null;
  durationHours: number | null;
  prerequisites: string | null;
  thumbnailUrl: string | null;
}): Promise<boolean> {
  const rows = await sql<{ course_id: string }[]>`
    UPDATE course_owner_fields
    SET
      description = ${params.description},
      syllabus = ${params.syllabus},
      price = ${params.price},
      duration_hours = ${params.durationHours},
      prerequisites = ${params.prerequisites},
      thumbnail_url = ${params.thumbnailUrl},
      last_edited_by = ${params.ownerId},
      last_edited_at = now()
    WHERE course_id = ${params.courseId}
      AND EXISTS (
        SELECT 1 FROM courses c
        JOIN owners o ON o.id = c.verified_owner_id
        WHERE c.id = ${params.courseId}
          AND c.verified_owner_id = ${params.ownerId}
          AND c.verification_status = 'verified'
          AND o.business_subscription_status = 'active'
      )
    RETURNING course_id
  `;

  return rows.length > 0;
}

// Discounts are an affiliate-only perk: only owners whose affiliate link has
// been admin-verified can set a compare-at price, enforced in the query
// itself (not just hidden in the UI).
export async function updateCourseDiscount(params: {
  courseId: string;
  ownerId: string;
  compareAtPrice: number | null;
}): Promise<boolean> {
  const rows = await sql<{ course_id: string }[]>`
    UPDATE course_owner_fields
    SET compare_at_price = ${params.compareAtPrice}
    WHERE course_id = ${params.courseId}
      AND EXISTS (
        SELECT 1 FROM courses c
        WHERE c.id = ${params.courseId}
          AND c.verified_owner_id = ${params.ownerId}
          AND c.affiliate_link_status = 'verified'
      )
    RETURNING course_id
  `;

  return rows.length > 0;
}

export type ClaimResult = { ok: true } | { ok: false; error: string };

// Claiming submits the course for admin review rather than granting
// ownership instantly — business_verification_status='verified' is required
// just to submit, but the course only becomes actually owned
// (verification_status='verified') once an admin approves it via
// approveClaim(). Without an active subscription, an owner is capped at one
// claim in flight at a time (pending or verified) — cancelling a
// subscription later never revokes courses already approved.
export async function claimCourse(ownerId: string, courseId: string): Promise<ClaimResult> {
  const [owner] = await sql<
    { business_verification_status: string; business_subscription_status: string }[]
  >`
    SELECT business_verification_status, business_subscription_status
    FROM owners
    WHERE id = ${ownerId}
  `;

  if (!owner || owner.business_verification_status !== "verified") {
    return { ok: false, error: "Complete business verification before claiming a course." };
  }

  if (owner.business_subscription_status !== "active") {
    const count = await getOwnedCourseCount(ownerId);
    if (count >= 1) {
      return {
        ok: false,
        error: "Subscribe to Registered Business ($99 + $50/mo) to claim more than one course.",
      };
    }
  }

  const [updated] = await sql<{ id: string }[]>`
    UPDATE courses
    SET
      verified_owner_id = ${ownerId},
      verification_status = 'pending',
      claim_rejection_reason = NULL,
      claim_rejection_owner_id = NULL
    WHERE id = ${courseId} AND verification_status = 'unclaimed' AND listing_status = 'published'
    RETURNING id
  `;

  if (!updated) {
    return { ok: false, error: "This course is already claimed or under review." };
  }

  await sql`
    INSERT INTO verification_audit_log (course_id, action, reviewed_by, owner_id)
    VALUES (${courseId}, 'claimed', 'pending-review', ${ownerId})
  `;

  return { ok: true };
}

export async function getPendingClaims(): Promise<AdminPendingClaim[]> {
  return sql<AdminPendingClaim[]>`
    SELECT
      c.id AS course_id, c.slug, c.title, c.provider_name,
      o.id AS owner_id, o.email AS owner_email, o.name AS owner_name
    FROM courses c
    JOIN owners o ON o.id = c.verified_owner_id
    WHERE c.verification_status = 'pending'
    ORDER BY c.title
  `;
}

export async function approveClaim(courseId: string): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    UPDATE courses
    SET verification_status = 'verified', claimed_at = now()
    WHERE id = ${courseId} AND verification_status = 'pending'
    RETURNING id
  `;

  if (rows.length === 0) return false;

  await sql`
    INSERT INTO verification_audit_log (course_id, action, reviewed_by)
    VALUES (${courseId}, 'verified', 'admin')
  `;

  return true;
}

// Reverts the course to genuinely unclaimed (anyone can attempt it, not just
// the rejected owner) but keeps a record of who was rejected and why, so
// that owner sees the reason and can appeal by simply claiming it again.
export async function rejectClaim(courseId: string, reason: string): Promise<boolean> {
  const rows = await sql<{ id: string; rejected_owner_id: string }[]>`
    UPDATE courses
    SET
      claim_rejection_owner_id = verified_owner_id,
      claim_rejection_reason = ${reason || "Rejected without a stated reason."},
      verified_owner_id = NULL,
      verification_status = 'unclaimed',
      claimed_at = NULL
    WHERE id = ${courseId} AND verification_status = 'pending'
    RETURNING id, claim_rejection_owner_id AS rejected_owner_id
  `;

  const rejected = rows[0];
  if (!rejected) return false;

  await sql`
    INSERT INTO verification_audit_log (course_id, action, reviewed_by, owner_id)
    VALUES (${courseId}, 'rejected', 'admin', ${rejected.rejected_owner_id})
  `;

  return true;
}

// Verified Course requires an active Registered Business subscription first,
// and the claim itself to already be admin-approved — not just pending.
export async function getOwnedCourseForContract(
  slug: string,
  ownerId: string
): Promise<OwnerCourseContract | null> {
  const rows = await sql<OwnerCourseContract[]>`
    SELECT
      c.id, c.slug, c.title, c.affiliate_url, c.contract_signed_at, c.contract_signed_name,
      c.affiliate_link_status, c.affiliate_link_rejection_reason
    FROM courses c
    JOIN owners o ON o.id = c.verified_owner_id
    WHERE c.slug = ${slug} AND c.verified_owner_id = ${ownerId}
      AND c.verification_status = 'verified' AND o.business_subscription_status = 'active'
    LIMIT 1
  `;

  return rows[0] ?? null;
}

// Submitting (or resubmitting) always resets the affiliate link to 'pending'
// — an admin must approve it before Verified Course actually activates,
// even if this owner had a previously-verified link they're now changing.
export async function signCourseContract(params: {
  courseId: string;
  ownerId: string;
  signedName: string;
  affiliateUrl: string;
}): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    UPDATE courses
    SET
      contract_signed_at = now(),
      contract_signed_name = ${params.signedName},
      affiliate_url = ${params.affiliateUrl},
      affiliate_link_status = 'pending',
      affiliate_link_rejection_reason = NULL
    WHERE id = ${params.courseId}
      AND verified_owner_id = ${params.ownerId}
      AND verification_status = 'verified'
      AND EXISTS (
        SELECT 1 FROM owners o
        WHERE o.id = ${params.ownerId} AND o.business_subscription_status = 'active'
      )
    RETURNING id
  `;

  return rows.length > 0;
}

export async function getOwnerPendingListings(ownerId: string): Promise<OwnerPendingListing[]> {
  return sql<OwnerPendingListing[]>`
    SELECT id AS course_id, slug, title, created_at AS submitted_at
    FROM courses
    WHERE added_by_owner_id = ${ownerId} AND listing_status = 'pending'
    ORDER BY created_at DESC
  `;
}
