"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminEmail } from "@/lib/admin";
import { approveBusinessVerification, rejectBusinessVerification, markSetupFeeRefunded } from "@/lib/business";

export async function approveBusinessAction(formData: FormData) {
  await requireAdminEmail();

  const ownerId = String(formData.get("owner_id") ?? "");
  await approveBusinessVerification(ownerId);

  revalidatePath("/admin/businesses");
  redirect("/admin/businesses");
}

export async function rejectBusinessAction(formData: FormData) {
  await requireAdminEmail();

  const ownerId = String(formData.get("owner_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  await rejectBusinessVerification(ownerId, reason || "Rejected without a stated reason.");

  revalidatePath("/admin/businesses");
  redirect("/admin/businesses");
}

// Refund itself happens in the Stripe dashboard — this just records that it
// happened, once the admin has actually issued it there.
export async function markSetupFeeRefundedAction(formData: FormData) {
  await requireAdminEmail();

  const ownerId = String(formData.get("owner_id") ?? "");
  await markSetupFeeRefunded(ownerId);

  revalidatePath("/admin/businesses");
  redirect("/admin/businesses");
}
