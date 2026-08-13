"use server";

import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { auth } from "@/auth";
import { ownerAuth } from "@/owner-auth";
import { consumeToken, issueToken } from "@/lib/tokens";
import { sendEmail, verificationEmailHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export async function confirmEmailVerificationAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const result = await consumeToken("verify_email", token);

  if (!result.ok) {
    redirect(`/verify-email?status=error&reason=${result.error}`);
  }

  if (result.accountType === "user") {
    await sql`UPDATE users SET email_verified = true WHERE id = ${result.accountId}`;
  } else {
    await sql`UPDATE owners SET email_verified = true WHERE id = ${result.accountId}`;
  }

  redirect(`/verify-email?status=success&type=${result.accountType}`);
}

export async function resendLearnerVerificationAction() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) redirect("/signin");

  const token = await issueToken("verify_email", "user", session.user.id);
  await sendEmail({
    to: session.user.email,
    subject: "Verify your No BS Courses email",
    html: verificationEmailHtml(`${SITE_URL}/verify-email?token=${token}`),
  });

  redirect("/?verification_sent=1");
}

export async function resendOwnerVerificationAction() {
  const session = await ownerAuth();
  if (!session?.user?.id || !session.user.email) redirect("/owner/signin");

  const token = await issueToken("verify_email", "owner", session.user.id);
  await sendEmail({
    to: session.user.email,
    subject: "Verify your No BS Courses business account email",
    html: verificationEmailHtml(`${SITE_URL}/verify-email?token=${token}`),
  });

  redirect("/owner/dashboard?verification_sent=1");
}
