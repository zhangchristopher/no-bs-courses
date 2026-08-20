import sql from "@/lib/db";

// Analytics logging is a side effect, not part of the actual page — a
// failure here (e.g. a session referencing a user row that no longer
// exists) must never take down the course page itself with an unhandled
// 500. Losing one page-view row is the correct failure mode, not crashing.
export async function logCoursePageView(params: {
  courseId: string;
  userId: string | null;
  referrer: string | null;
}) {
  try {
    await sql`
      INSERT INTO course_page_views (course_id, user_id, referrer)
      VALUES (${params.courseId}, ${params.userId}, ${params.referrer})
    `;
  } catch (err) {
    console.error("logCoursePageView failed:", err);
  }
}
