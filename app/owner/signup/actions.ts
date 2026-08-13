"use server";

import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { ownerSignIn } from "@/owner-auth";
import { safeRedirectPath } from "@/lib/safeRedirect";
import { issueToken } from "@/lib/tokens";
import { sendEmail, verificationEmailHtml } from "@/lib/email";
import { SITE_URL } from "@/lib/site";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/clientIp";
import { isLikelyBot } from "@/lib/botCheck";

export async function registerOwnerAction(formData: FormData) {
  if (isLikelyBot(formData)) {
    redirect("/owner/signup?error=");
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const emailMarketingOptIn = formData.get("email_marketing_opt_in") === "on";
  const smsMarketingOptIn = formData.get("sms_marketing_opt_in") === "on";
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(
    formData.get("callback_url") as string | null,
    "/owner/dashboard"
  );

  const ip = await getClientIp();
  const { allowed } = await checkRateLimit({
    key: `owner-signup:${ip}`,
    limit: 5,
    windowSeconds: 3600,
  });
  if (!allowed) {
    redirect(`/owner/signup?error=${encodeURIComponent("Too many attempts. Try again later.")}`);
  }

  if (!email || password.length < 8) {
    redirect(
      `/owner/signup?error=${encodeURIComponent("Email and a password of at least 8 characters are required.")}`
    );
  }

  const existing = await sql`SELECT id FROM owners WHERE email = ${email} LIMIT 1`;
  if (existing.length > 0) {
    redirect(`/owner/signup?error=${encodeURIComponent("An owner account with that email already exists.")}`);
  }

  const passwordHash = await hashPassword(password);
  const [owner] = await sql<{ id: string }[]>`
    INSERT INTO owners (email, name, phone, email_marketing_opt_in, sms_marketing_opt_in, password_hash)
    VALUES (${email}, ${name || null}, ${phone || null}, ${emailMarketingOptIn}, ${smsMarketingOptIn}, ${passwordHash})
    RETURNING id
  `;

  const token = await issueToken("verify_email", "owner", owner.id);
  await sendEmail({
    to: email,
    subject: "Verify your No BS Courses business account email",
    html: verificationEmailHtml(`${SITE_URL}/verify-email?token=${token}`),
  });

  await ownerSignIn("credentials", { email, password, redirectTo });
}
