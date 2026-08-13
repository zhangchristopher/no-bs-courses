"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ownerAuth } from "@/owner-auth";
import { getOwnedCourseForContract, signCourseContract } from "@/lib/ownerCourses";

export async function signContractAction(formData: FormData) {
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }

  const courseId = String(formData.get("course_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const signedName = String(formData.get("signed_name") ?? "").trim();
  const affiliateUrl = String(formData.get("affiliate_url") ?? "").trim();
  const agreed = formData.get("agree") === "on";

  if (!signedName || !affiliateUrl || !agreed) {
    redirect(
      `/owner/courses/${slug}/verify?error=${encodeURIComponent("Type your name, provide an affiliate URL, and check the agreement box.")}`
    );
  }

  // Re-check ownership + active subscription before writing.
  const course = await getOwnedCourseForContract(slug, session.user.id);
  if (!course) {
    redirect(
      `/owner/dashboard?error=${encodeURIComponent("Registered Business must be active to sign this contract.")}`
    );
  }

  const signed = await signCourseContract({ courseId, ownerId: session.user.id, signedName, affiliateUrl });
  if (!signed) {
    redirect(`/owner/courses/${slug}/verify?error=${encodeURIComponent("Couldn't sign the contract.")}`);
  }

  revalidatePath(`/courses/${slug}`);
  revalidatePath("/owner/dashboard");

  redirect(`/owner/courses/${slug}/verify`);
}
