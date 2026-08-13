"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { ownerSignIn } from "@/owner-auth";
import { safeRedirectPath } from "@/lib/safeRedirect";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/clientIp";

export async function ownerSigninAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(
    formData.get("callback_url") as string | null,
    "/owner/dashboard"
  );

  const ip = await getClientIp();
  const { allowed } = await checkRateLimit({
    key: `owner-signin:${ip}`,
    limit: 10,
    windowSeconds: 900,
  });
  if (!allowed) {
    redirect(
      `/owner/signin?error=${encodeURIComponent("Too many attempts. Try again in a few minutes.")}`
    );
  }

  try {
    await ownerSignIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/owner/signin?error=${encodeURIComponent("Invalid email or password.")}`);
    }
    throw error;
  }
}
