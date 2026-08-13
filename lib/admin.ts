import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Hardcoded single-admin check against ADMIN_EMAIL, as specified for this
// phase. Replace with a real admin role system before adding more admins.

export type AdminSession =
  | { authorized: true; email: string }
  | { authorized: false; reason: "signed-out" | "forbidden" };

export async function getAdminSession(): Promise<AdminSession> {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!session?.user?.email) {
    return { authorized: false, reason: "signed-out" };
  }

  if (!adminEmail || session.user.email !== adminEmail) {
    return { authorized: false, reason: "forbidden" };
  }

  return { authorized: true, email: session.user.email };
}

// For use inside server actions, where redirecting on failure is fine.
export async function requireAdminEmail(): Promise<string> {
  const result = await getAdminSession();
  if (!result.authorized) {
    redirect("/signin?callbackUrl=/admin/verifications");
  }
  return result.email;
}
