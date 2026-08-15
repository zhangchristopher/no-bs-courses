import type { Metadata } from "next";
import { requestPasswordResetAction } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { FormField } from "@/components/ui/FormField";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Forgot Password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <AuthShell title="Forgot password">
      <p className="text-sm text-ink/60 dark:text-ink-dark/60">
        Enter the email on your account (learner or business) and we&apos;ll send a reset link.
      </p>

      {sent && (
        <StatusBanner tone="success">
          If an account exists for that email, we&apos;ve sent a password reset link.
        </StatusBanner>
      )}

      <form action={requestPasswordResetAction} className="mt-6 flex flex-col gap-4">
        <FormField label="Email" name="email" type="email" required />
        <Button type="submit" className="self-start">
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
