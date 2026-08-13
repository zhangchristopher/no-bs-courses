"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ownerAuth } from "@/owner-auth";
import { claimCourse } from "@/lib/ownerCourses";
import { categorySlug } from "@/lib/courses";
import { sendEmail, claimSubmittedEmailHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export async function claimCourseAction(formData: FormData) {
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }

  const courseId = String(formData.get("course_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const category = String(formData.get("category") ?? "");
  const title = String(formData.get("title") ?? "");

  const result = await claimCourse(session.user.id, courseId);

  if (!result.ok) {
    redirect(`/courses/${slug}?error=${encodeURIComponent(result.error)}`);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `Claim submitted: ${title || slug}`,
      html: claimSubmittedEmailHtml({
        courseTitle: title || slug,
        ownerEmail: session.user.email ?? "(unknown owner)",
        reviewLink: `${SITE_URL}/admin/claims`,
      }),
    });
  }

  revalidatePath(`/courses/${slug}`);
  revalidatePath("/courses");
  revalidatePath("/owner/dashboard");
  if (category) revalidatePath(`/courses/category/${categorySlug(category)}`);

  redirect(`/courses/${slug}?submitted=1`);
}
