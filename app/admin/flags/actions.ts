"use server";

import { redirect } from "next/navigation";
import { requireAdminEmail } from "@/lib/admin";
import { resolveReviewFlag } from "@/lib/reviewFlags";

export async function resolveReviewFlagAction(formData: FormData) {
  await requireAdminEmail();

  const flagId = String(formData.get("flag_id") ?? "");
  await resolveReviewFlag(flagId);

  redirect("/admin/flags");
}
