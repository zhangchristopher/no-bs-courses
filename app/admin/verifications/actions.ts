"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import sql from "@/lib/db";
import { requireAdminEmail } from "@/lib/admin";
import { categorySlug } from "@/lib/courses";

async function revalidateCourse(courseId: string) {
  const [course] = await sql<{ slug: string; category: string | null }[]>`
    SELECT slug, category FROM courses WHERE id = ${courseId}
  `;
  if (!course) return;
  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/courses");
  if (course.category) revalidatePath(`/courses/category/${categorySlug(course.category)}`);
}

export async function approveListingAction(formData: FormData) {
  await requireAdminEmail();

  const courseId = String(formData.get("course_id") ?? "");

  const [updated] = await sql<{ id: string }[]>`
    UPDATE courses
    SET listing_status = 'published'
    WHERE id = ${courseId} AND listing_status = 'pending'
    RETURNING id
  `;

  if (updated) {
    await revalidateCourse(courseId);
    revalidatePath("/");
  }

  revalidatePath("/admin/verifications");
  redirect("/admin/verifications");
}

export async function rejectListingAction(formData: FormData) {
  await requireAdminEmail();

  const courseId = String(formData.get("course_id") ?? "");

  await sql`
    UPDATE courses
    SET listing_status = 'rejected'
    WHERE id = ${courseId} AND listing_status = 'pending'
  `;

  revalidatePath("/admin/verifications");
  redirect("/admin/verifications");
}
