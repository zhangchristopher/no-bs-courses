"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ownerAuth } from "@/owner-auth";
import { createOwnerResponse } from "@/lib/ownerResponses";

export async function submitOwnerResponseAction(formData: FormData) {
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }

  const reviewId = String(formData.get("review_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const responseText = String(formData.get("response_text") ?? "").trim();

  if (!responseText) {
    redirect(`/courses/${slug}?error=${encodeURIComponent("Response text is required.")}`);
  }

  try {
    const created = await createOwnerResponse({
      reviewId,
      ownerId: session.user.id,
      responseText,
    });

    if (!created) {
      redirect(
        `/courses/${slug}?error=${encodeURIComponent("You can only respond to reviews on courses you've verified.")}`
      );
    }
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? err.code : undefined;
    if (code === "23505") {
      redirect(`/courses/${slug}?error=${encodeURIComponent("You've already responded to this review.")}`);
    }
    throw err;
  }

  revalidatePath(`/courses/${slug}`);
  redirect(`/courses/${slug}`);
}
