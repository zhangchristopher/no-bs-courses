import sql from "@/lib/db";

export type PendingAffiliateLink = {
  course_id: string;
  slug: string;
  title: string;
  platform_url: string;
  affiliate_url: string | null;
  contract_signed_name: string | null;
  contract_signed_at: string | null;
  owner_name: string | null;
  owner_email: string;
};

export async function getPendingAffiliateLinks(): Promise<PendingAffiliateLink[]> {
  return sql<PendingAffiliateLink[]>`
    SELECT
      c.id AS course_id,
      c.slug,
      c.title,
      c.platform_url,
      c.affiliate_url,
      c.contract_signed_name,
      c.contract_signed_at,
      o.name AS owner_name,
      o.email AS owner_email
    FROM courses c
    JOIN owners o ON o.id = c.verified_owner_id
    WHERE c.affiliate_link_status = 'pending'
    ORDER BY c.contract_signed_at
  `;
}

export async function approveAffiliateLink(courseId: string): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    UPDATE courses
    SET affiliate_link_status = 'verified', affiliate_link_rejection_reason = NULL
    WHERE id = ${courseId} AND affiliate_link_status = 'pending'
    RETURNING id
  `;
  return rows.length > 0;
}

export async function rejectAffiliateLink(courseId: string, reason: string): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    UPDATE courses
    SET affiliate_link_status = 'rejected', affiliate_link_rejection_reason = ${reason || null}
    WHERE id = ${courseId} AND affiliate_link_status = 'pending'
    RETURNING id
  `;
  return rows.length > 0;
}
