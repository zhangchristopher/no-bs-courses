"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ownerAuth } from "@/owner-auth";
import { claimInvitedCourse } from "@/lib/claimInvitations";
import { sendEmail, claimSubmittedEmailHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

// The only input is the invitation code from the URL. The listing is looked
// up from it on the server; nothing about the course is read from the form.
export async function claimInvitedCourseAction(formData: FormData) {
  const code = String(formData.get("code") ?? "");
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect(`/owner/signin?callbackUrl=${encodeURIComponent(`/claim/${code}`)}`);
  }

  const result = await claimInvitedCourse(code, session.user.id);
  if (!result.ok) {
    redirect(`/claim/${code}?error=${encodeURIComponent(result.error)}`);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `Claim submitted: ${result.title ?? "a listing"}`,
      html: claimSubmittedEmailHtml({
        courseTitle: result.title ?? "a listing",
        ownerEmail: session.user.email ?? "(unknown owner)",
        reviewLink: `${SITE_URL}/admin/claims`,
      }),
    });
  }

  revalidatePath("/courses");
  revalidatePath("/owner/dashboard");
  if (result.slug) revalidatePath(`/courses/${result.slug}`);
  redirect(`/claim/${code}?submitted=1`);
}
