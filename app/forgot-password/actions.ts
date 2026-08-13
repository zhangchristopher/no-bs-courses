"use server";

import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { issueToken } from "@/lib/tokens";
import { sendEmail, passwordResetEmailHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/clientIp";

// Always redirects to the same "sent" state regardless of whether the email
// matched an account (or matched both a learner and a business account), or
// whether the request was rate-limited — otherwise this endpoint could be
// used to enumerate registered emails or to fingerprint the rate limit.
export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const ip = await getClientIp();
  const { allowed } = await checkRateLimit({
    key: `forgot-password:${ip}`,
    limit: 5,
    windowSeconds: 3600,
  });

  if (allowed && email) {
    const [user] = await sql<{ id: string }[]>`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    const [owner] = await sql<{ id: string }[]>`SELECT id FROM owners WHERE email = ${email} LIMIT 1`;

    if (user) {
      const token = await issueToken("reset_password", "user", user.id);
      await sendEmail({
        to: email,
        subject: "Reset your No BS Courses password",
        html: passwordResetEmailHtml(`${SITE_URL}/reset-password?token=${token}`, "learner"),
      });
    }

    if (owner) {
      const token = await issueToken("reset_password", "owner", owner.id);
      await sendEmail({
        to: email,
        subject: "Reset your No BS Courses business account password",
        html: passwordResetEmailHtml(`${SITE_URL}/reset-password?token=${token}`, "business"),
      });
    }
  }

  redirect("/forgot-password?sent=1");
}
