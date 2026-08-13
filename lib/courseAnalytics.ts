import sql from "@/lib/db";
import { sectionTypeLabel } from "@/lib/courseSections";

export type SectionConversion = {
  sectionType: string;
  label: string;
  engagedVisitors: number;
  convertedVisitors: number;
  conversionRate: number; // percentage
};

export type CourseAnalytics = {
  views30d: number;
  clicks30d: number;
  ctr: number | null; // percentage; null when there are no views to divide by
  uniqueVisitors30d: number;
  dailyClicks: { date: string; count: number }[]; // last 7 days
  topReferrers: { source: string; count: number }[]; // top 5, last 30 days
  totalReviews: number;
  averageRating: number | null;
  verifiedPurchaseReviews: number;
  sectionConversions: SectionConversion[];
};

function referrerSource(referrer: string | null): string {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

export async function getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
  const [
    [{ count: views30d }],
    [{ count: clicks30d }],
    [{ count: uniqueVisitors30d }],
    dailyClicksRows,
    referrerRows,
    [reviewStats],
    sectionRows,
  ] = await Promise.all([
    sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM course_page_views
      WHERE course_id = ${courseId} AND viewed_at >= now() - INTERVAL '30 days'
    `,
    sql<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM affiliate_clicks
      WHERE course_id = ${courseId} AND clicked_at >= now() - INTERVAL '30 days'
    `,
    sql<{ count: number }[]>`
      SELECT COUNT(DISTINCT user_id)::int AS count FROM (
        SELECT user_id FROM course_page_views
        WHERE course_id = ${courseId} AND viewed_at >= now() - INTERVAL '30 days' AND user_id IS NOT NULL
        UNION
        SELECT user_id FROM affiliate_clicks
        WHERE course_id = ${courseId} AND clicked_at >= now() - INTERVAL '30 days' AND user_id IS NOT NULL
      ) t
    `,
    sql<{ date: string; count: number }[]>`
      SELECT date_trunc('day', clicked_at)::date::text AS date, COUNT(*)::int AS count
      FROM affiliate_clicks
      WHERE course_id = ${courseId} AND clicked_at >= now() - INTERVAL '7 days'
      GROUP BY 1
      ORDER BY 1
    `,
    sql<{ referrer: string | null }[]>`
      SELECT referrer FROM affiliate_clicks
      WHERE course_id = ${courseId} AND clicked_at >= now() - INTERVAL '30 days'
    `,
    sql<{ total: number; avg_rating: string | null; verified_count: number }[]>`
      SELECT
        COUNT(*)::int AS total,
        AVG(rating)::numeric(3,2) AS avg_rating,
        COUNT(*) FILTER (WHERE verified_purchase)::int AS verified_count
      FROM reviews
      WHERE course_id = ${courseId}
    `,
    // A visitor "converted" if the same person (matched by signed-in user_id,
    // or by the anonymous visitor_id cookie for signed-out visitors) also has
    // an affiliate click for this course. This is a real, query-derived
    // signal — not estimated or fabricated.
    sql<{ section_type: string; engaged: number; converted: number }[]>`
      SELECT
        csc.section_type,
        COUNT(DISTINCT COALESCE(csc.user_id::text, csc.visitor_id))::int AS engaged,
        COUNT(DISTINCT COALESCE(csc.user_id::text, csc.visitor_id)) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM affiliate_clicks ac
            WHERE ac.course_id = csc.course_id
              AND (
                (csc.user_id IS NOT NULL AND ac.user_id = csc.user_id)
                OR (csc.visitor_id IS NOT NULL AND ac.visitor_id = csc.visitor_id)
              )
          )
        )::int AS converted
      FROM course_section_clicks csc
      WHERE csc.course_id = ${courseId}
      GROUP BY csc.section_type
    `,
  ]);

  const referrerCounts = new Map<string, number>();
  for (const row of referrerRows) {
    const source = referrerSource(row.referrer);
    referrerCounts.set(source, (referrerCounts.get(source) ?? 0) + 1);
  }
  const topReferrers = Array.from(referrerCounts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const sectionConversions = sectionRows
    .map((row) => ({
      sectionType: row.section_type,
      label: sectionTypeLabel(row.section_type),
      engagedVisitors: row.engaged,
      convertedVisitors: row.converted,
      conversionRate: row.engaged > 0 ? Math.round((row.converted / row.engaged) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.conversionRate - a.conversionRate || b.engagedVisitors - a.engagedVisitors);

  return {
    views30d,
    clicks30d,
    ctr: views30d > 0 ? Math.round((clicks30d / views30d) * 1000) / 10 : null,
    uniqueVisitors30d,
    dailyClicks: dailyClicksRows,
    topReferrers,
    totalReviews: reviewStats.total,
    averageRating: reviewStats.avg_rating ? Number(reviewStats.avg_rating) : null,
    verifiedPurchaseReviews: reviewStats.verified_count,
    sectionConversions,
  };
}
