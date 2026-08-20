"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminEmail } from "@/lib/admin";
import { categorySlug, setCategoryFeaturedCourse, setSiteFeaturedCourse } from "@/lib/courses";

export async function setSiteFeaturedAction(formData: FormData) {
  await requireAdminEmail();

  const courseId = String(formData.get("course_id") ?? "").trim();
  await setSiteFeaturedCourse(courseId || null);

  revalidatePath("/");
  revalidatePath("/admin/featured");
  redirect("/admin/featured");
}

export async function setCategoryFeaturedAction(formData: FormData) {
  await requireAdminEmail();

  const category = String(formData.get("category") ?? "").trim();
  const courseId = String(formData.get("course_id") ?? "").trim();
  if (!category) redirect("/admin/featured");

  await setCategoryFeaturedCourse(category, courseId || null);

  revalidatePath("/");
  revalidatePath(`/courses/category/${categorySlug(category)}`);
  revalidatePath("/admin/featured");
  redirect("/admin/featured");
}
