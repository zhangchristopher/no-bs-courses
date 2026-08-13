"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import sql from "@/lib/db";
import { requireAdminEmail } from "@/lib/admin";
import { recalculateCourseScores } from "@/lib/scores";
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

export async function approvePurchaseVerificationAction(formData: FormData) {
  await requireAdminEmail();

  const reviewId = String(formData.get("review_id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  const reviewerId = String(formData.get("reviewer_id") ?? "");

  const [updated] = await sql<{ id: string }[]>`
    UPDATE reviews
    SET verified_purchase = true, purchase_verification_status = 'verified'
    WHERE id = ${reviewId} AND purchase_verification_status = 'pending'
    RETURNING id
  `;

  if (updated) {
    await sql`UPDATE users SET bonus_unlock_credits = bonus_unlock_credits + 1 WHERE id = ${reviewerId}`;
    await recalculateCourseScores(courseId);
    await revalidateCourse(courseId);
  }

  revalidatePath("/admin/purchase-verifications");
  redirect("/admin/purchase-verifications");
}

export async function rejectPurchaseVerificationAction(formData: FormData) {
  await requireAdminEmail();

  const reviewId = String(formData.get("review_id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");

  await sql`
    UPDATE reviews
    SET purchase_verification_status = 'rejected'
    WHERE id = ${reviewId} AND purchase_verification_status = 'pending'
  `;

  await revalidateCourse(courseId);
  revalidatePath("/admin/purchase-verifications");
  redirect("/admin/purchase-verifications");
}
