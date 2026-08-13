"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { safeRedirectPath } from "@/lib/safeRedirect";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/clientIp";

export async function signinAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(formData.get("callback_url") as string | null, "/courses");

  const ip = await getClientIp();
  const { allowed } = await checkRateLimit({ key: `signin:${ip}`, limit: 10, windowSeconds: 900 });
  if (!allowed) {
    redirect(`/signin?error=${encodeURIComponent("Too many attempts. Try again in a few minutes.")}`);
  }

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/signin?error=${encodeURIComponent("Invalid email or password.")}`);
    }
    throw error;
  }
}
