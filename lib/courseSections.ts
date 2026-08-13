import sql from "@/lib/db";

export const SECTION_TYPES = [
  { value: "hosting_platform", label: "Hosting Platform" },
  { value: "paid_testimonials", label: "Paid Testimonials" },
  { value: "success_stories", label: "Success Stories" },
  { value: "community_events", label: "Community Events" },
  { value: "instructor_bio", label: "Instructor Bio" },
  { value: "refund_policy", label: "Refund Policy" },
  { value: "faqs", label: "FAQs" },
  { value: "awards_recognition", label: "Awards & Recognition" },
  { value: "alumni_outcomes", label: "Alumni Outcomes" },
  { value: "free_preview", label: "Free Preview / Trial" },
] as const;

export type SectionType = (typeof SECTION_TYPES)[number]["value"];

const SECTION_TYPE_VALUES = SECTION_TYPES.map((t) => t.value);

export function isSectionType(value: string): value is SectionType {
  return (SECTION_TYPE_VALUES as string[]).includes(value);
}

export function sectionTypeLabel(value: string): string {
  return SECTION_TYPES.find((t) => t.value === value)?.label ?? value;
}

export const MAX_SECTIONS_PER_COURSE = 5;

export type CourseSection = {
  id: string;
  course_id: string;
  section_type: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
};

export async function getCourseSections(courseId: string): Promise<CourseSection[]> {
  return sql<CourseSection[]>`
    SELECT id, course_id, section_type, content, image_url, video_url, created_at
    FROM course_sections
    WHERE course_id = ${courseId}
    ORDER BY created_at
  `;
}

export type AddSectionResult = { ok: true } | { ok: false; error: string };

// Enforces ownership, an active Registered Business subscription, and the
// 5-section cap in the query itself — not just in the UI.
export async function addCourseSection(params: {
  courseId: string;
  ownerId: string;
  sectionType: string;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
}): Promise<AddSectionResult> {
  if (!isSectionType(params.sectionType)) {
    return { ok: false, error: "Invalid section type." };
  }

  const [existingCount] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM course_sections WHERE course_id = ${params.courseId}
  `;
  if (existingCount.count >= MAX_SECTIONS_PER_COURSE) {
    return { ok: false, error: `You can add up to ${MAX_SECTIONS_PER_COURSE} sections.` };
  }

  try {
    const rows = await sql<{ id: string }[]>`
      INSERT INTO course_sections (course_id, section_type, content, image_url, video_url)
      SELECT c.id, ${params.sectionType}, ${params.content}, ${params.imageUrl}, ${params.videoUrl}
      FROM courses c
      JOIN owners o ON o.id = c.verified_owner_id
      WHERE c.id = ${params.courseId}
        AND c.verified_owner_id = ${params.ownerId}
        AND o.business_subscription_status = 'active'
      RETURNING id
    `;
    if (rows.length === 0) {
      return { ok: false, error: "Registered Business must be active to add sections." };
    }
    return { ok: true };
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? err.code : undefined;
    if (code === "23505") {
      return { ok: false, error: "You already have a section of that type." };
    }
    throw err;
  }
}

export async function deleteCourseSection(sectionId: string, ownerId: string): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    DELETE FROM course_sections cs
    USING courses c
    WHERE cs.id = ${sectionId}
      AND cs.course_id = c.id
      AND c.verified_owner_id = ${ownerId}
    RETURNING cs.id
  `;
  return rows.length > 0;
}
