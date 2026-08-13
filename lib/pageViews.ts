import sql from "@/lib/db";

export async function logCoursePageView(params: {
  courseId: string;
  userId: string | null;
  referrer: string | null;
}) {
  await sql`
    INSERT INTO course_page_views (course_id, user_id, referrer)
    VALUES (${params.courseId}, ${params.userId}, ${params.referrer})
  `;
}
