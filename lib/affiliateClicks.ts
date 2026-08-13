import sql from "@/lib/db";

// Only ever written from the public /go/[slug] redirect route, based on
// real visitor requests. No owner-facing code path touches this table, so
// counts can't be edited or faked from the owner dashboard.
export async function logAffiliateClick(params: {
  courseId: string;
  userId: string | null;
  visitorId: string | null;
  referrer: string | null;
}) {
  await sql`
    INSERT INTO affiliate_clicks (course_id, user_id, visitor_id, referrer)
    VALUES (${params.courseId}, ${params.userId}, ${params.visitorId}, ${params.referrer})
  `;
}

export async function getClickCounts(courseIds: string[]): Promise<Map<string, number>> {
  if (courseIds.length === 0) return new Map();

  const rows = await sql<{ course_id: string; count: number }[]>`
    SELECT course_id, COUNT(*)::int AS count
    FROM affiliate_clicks
    WHERE course_id IN ${sql(courseIds)}
      AND clicked_at >= now() - INTERVAL '30 days'
    GROUP BY course_id
  `;

  const map = new Map<string, number>();
  for (const row of rows) map.set(row.course_id, row.count);
  return map;
}
