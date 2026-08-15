import type { Metadata } from "next";
import { confirmEmailVerificationAction } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Verify Email" };

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "This verification link isn't valid.",
  expired: "This verification link has expired — sign up again or request a new one from your account.",
  used: "This verification link has already been used.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string; reason?: string; type?: string }>;
}) {
  const { token, status, reason, type } = await searchParams;

  if (status === "success") {
    return (
      <AuthShell title="Email verified" align="center">
        <p className="text-sm text-ink/60 dark:text-ink-dark/60">
          Your {type === "owner" ? "business" : "learner"} account email is confirmed.
        </p>
        <Button href={type === "owner" ? "/owner/dashboard" : "/courses"} className="mt-6">
          Continue
        </Button>
      </AuthShell>
    );
  }

  if (status === "error") {
    return (
      <AuthShell title="Couldn't verify email" align="center">
        <p className="text-sm text-ink/60 dark:text-ink-dark/60">
          {ERROR_MESSAGES[reason ?? ""] ?? "Something went wrong verifying this link."}
        </p>
      </AuthShell>
    );
  }

  if (!token) {
    return (
      <AuthShell title="Missing verification link" align="center">
        <p className="text-sm text-ink/60 dark:text-ink-dark/60">
          Open the verification link from your email to continue.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Confirm your email address" align="center">
      <p className="text-sm text-ink/60 dark:text-ink-dark/60">
        Click below to finish verifying your No BS Courses account email.
      </p>
      <form action={confirmEmailVerificationAction} className="mt-6">
        <input type="hidden" name="token" value={token} />
        <Button type="submit">Verify email</Button>
      </form>
    </AuthShell>
  );
}
