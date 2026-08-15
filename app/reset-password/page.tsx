import Link from "next/link";
import type { Metadata } from "next";
import { resetPasswordAction } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { FormField } from "@/components/ui/FormField";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Reset Password" };

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "This reset link isn't valid.",
  expired: "This reset link has expired — request a new one.",
  used: "This reset link has already been used.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string; status?: string; reason?: string }>;
}) {
  const { token, error, status, reason } = await searchParams;

  if (status === "error") {
    return (
      <AuthShell title="Couldn't reset password" align="center">
        <p className="text-sm text-ink/60 dark:text-ink-dark/60">
          {ERROR_MESSAGES[reason ?? ""] ?? "Something went wrong with this link."}
        </p>
        <Link href="/forgot-password" className="mt-4 inline-block underline text-sm">
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (!token) {
    return (
      <AuthShell title="Missing reset link" align="center">
        <p className="text-sm text-ink/60 dark:text-ink-dark/60">
          Open the reset link from your email, or{" "}
          <Link href="/forgot-password" className="underline">
            request a new one
          </Link>
          .
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password">
      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      <form action={resetPasswordAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <FormField
          label="New password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
        <FormField label="Confirm new password" name="confirm_password" type="password" required minLength={8} />
        <Button type="submit" className="self-start">
          Reset password
        </Button>
      </form>
    </AuthShell>
  );
}
