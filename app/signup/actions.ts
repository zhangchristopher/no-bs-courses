"use server";

import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/auth";
import { safeRedirectPath } from "@/lib/safeRedirect";
import { issueToken } from "@/lib/tokens";
import { sendEmail, verificationEmailHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/clientIp";
import { isLikelyBot } from "@/lib/botCheck";

export async function registerAction(formData: FormData) {
  if (isLikelyBot(formData)) {
    // Don't tip off the bot — pretend it worked.
    redirect("/signup?error=");
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const emailMarketingOptIn = formData.get("email_marketing_opt_in") === "on";
  const smsMarketingOptIn = formData.get("sms_marketing_opt_in") === "on";
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(formData.get("callback_url") as string | null, "/courses");

  const ip = await getClientIp();
  const { allowed } = await checkRateLimit({ key: `signup:${ip}`, limit: 5, windowSeconds: 3600 });
  if (!allowed) {
    redirect(`/signup?error=${encodeURIComponent("Too many attempts. Try again later.")}`);
  }

  if (!email || password.length < 8) {
    redirect(
      `/signup?error=${encodeURIComponent("Email and a password of at least 8 characters are required.")}`
    );
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing.length > 0) {
    redirect(`/signup?error=${encodeURIComponent("An account with that email already exists.")}`);
  }

  const passwordHash = await hashPassword(password);
  const [user] = await sql<{ id: string }[]>`
    INSERT INTO users (email, display_name, phone, email_marketing_opt_in, sms_marketing_opt_in, password_hash)
    VALUES (${email}, ${displayName || null}, ${phone || null}, ${emailMarketingOptIn}, ${smsMarketingOptIn}, ${passwordHash})
    RETURNING id
  `;

  const token = await issueToken("verify_email", "user", user.id);
  await sendEmail({
    to: email,
    subject: "Verify your No BS Courses email",
    html: verificationEmailHtml(`${SITE_URL}/verify-email?token=${token}`),
  });

  await signIn("credentials", { email, password, redirectTo });
}
