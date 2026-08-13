"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminEmail } from "@/lib/admin";
import { approveClaim, rejectClaim } from "@/lib/ownerCourses";

export async function approveClaimAction(formData: FormData) {
  await requireAdminEmail();

  const courseId = String(formData.get("course_id") ?? "");
  await approveClaim(courseId);

  revalidatePath("/admin/claims");
  redirect("/admin/claims");
}

export async function rejectClaimAction(formData: FormData) {
  await requireAdminEmail();

  const courseId = String(formData.get("course_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  await rejectClaim(courseId, reason);

  revalidatePath("/admin/claims");
  redirect("/admin/claims");
}
