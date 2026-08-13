"use server";

import { redirect } from "next/navigation";
import { ownerAuth } from "@/owner-auth";
import { submitBusinessInfo } from "@/lib/business";

export async function submitBusinessInfoAction(formData: FormData) {
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }

  const businessName = String(formData.get("business_name") ?? "").trim();
  const businessRegistrationNumber = String(formData.get("business_registration_number") ?? "").trim();
  const businessState = String(formData.get("business_state") ?? "").trim();
  const businessPaperworkUrl = String(formData.get("business_paperwork_url") ?? "").trim();

  if (!businessName || !businessRegistrationNumber || !businessState || !businessPaperworkUrl) {
    redirect(`/owner/business?error=${encodeURIComponent("All fields are required.")}`);
  }

  const updated = await submitBusinessInfo(session.user.id, {
    businessName,
    businessRegistrationNumber,
    businessState,
    businessPaperworkUrl,
  });

  if (!updated) {
    redirect(
      `/owner/business?error=${encodeURIComponent("You already have a submission pending or approved.")}`
    );
  }

  redirect("/owner/business?submitted=1");
}
