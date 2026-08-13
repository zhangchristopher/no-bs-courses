"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import sql from "@/lib/db";
import { requireAdminEmail } from "@/lib/admin";
import { approveAffiliateLink, rejectAffiliateLink } from "@/lib/affiliateLinkVerifications";
import { categorySlug } from "@/lib/courses";

async function revalidateCourse(courseId: string) {
  const [course] = await sql<{ slug: string; category: string | null }[]>`
    SELECT slug, category FROM courses WHERE id = ${courseId}
  `;
  if (!course) return;
  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/courses");
  revalidatePath("/owner/dashboard");
  if (course.category) revalidatePath(`/courses/category/${categorySlug(course.category)}`);
}

export async function approveAffiliateLinkAction(formData: FormData) {
  await requireAdminEmail();

  const courseId = String(formData.get("course_id") ?? "");
  const approved = await approveAffiliateLink(courseId);
  if (approved) await revalidateCourse(courseId);

  revalidatePath("/admin/affiliate-links");
  redirect("/admin/affiliate-links");
}

export async function rejectAffiliateLinkAction(formData: FormData) {
  await requireAdminEmail();

  const courseId = String(formData.get("course_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const rejected = await rejectAffiliateLink(courseId, reason || "Rejected without a stated reason.");
  if (rejected) await revalidateCourse(courseId);

  revalidatePath("/admin/affiliate-links");
  redirect("/admin/affiliate-links");
}
