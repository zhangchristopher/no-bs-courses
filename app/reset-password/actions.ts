"use server";

import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { consumeToken } from "@/lib/tokens";

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) {
    redirect(
      `/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent("Password must be at least 8 characters.")}`
    );
  }
  if (password !== confirmPassword) {
    redirect(
      `/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent("Passwords don't match.")}`
    );
  }

  const result = await consumeToken("reset_password", token);
  if (!result.ok) {
    redirect(`/reset-password?status=error&reason=${result.error}`);
  }

  const passwordHash = await hashPassword(password);
  if (result.accountType === "user") {
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${result.accountId}`;
    redirect("/signin?reset=1");
  } else {
    await sql`UPDATE owners SET password_hash = ${passwordHash} WHERE id = ${result.accountId}`;
    redirect("/owner/signin?reset=1");
  }
}
