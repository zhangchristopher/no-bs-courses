import Link from "next/link";
import type { Metadata } from "next";
import AccountTypeToggle from "@/components/AccountTypeToggle";
import Honeypot from "@/components/Honeypot";
import { AuthShell } from "@/components/ui/AuthShell";
import { FormField } from "@/components/ui/FormField";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Button } from "@/components/ui/Button";
import { registerAction } from "./actions";

export const metadata: Metadata = { title: "Sign Up" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;

  return (
    <AuthShell title="Create an account">
      <p className="text-sm text-ink/60 dark:text-ink-dark/60">
        A personal account is for taking and reviewing courses. Managing or listing courses
        needs a business account instead.
      </p>
      <AccountTypeToggle active="personal" callbackUrl={callbackUrl} />

      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      <form action={registerAction} className="mt-6 flex flex-col gap-4">
        <Honeypot />
        {callbackUrl && <input type="hidden" name="callback_url" value={callbackUrl} />}
        <FormField label="Display name" name="display_name" type="text" placeholder="Shown on your reviews" />
        <FormField label="Email" name="email" type="email" required />
        <FormField label="Phone" name="phone" type="tel" placeholder="Optional" />
        <FormField
          label="Password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-ink/70 dark:text-ink-dark/70">
            <input type="checkbox" name="email_marketing_opt_in" className="accent-ink dark:accent-ink-dark" />
            Send me course recommendations and review reminders by email
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/70 dark:text-ink-dark/70">
            <input type="checkbox" name="sms_marketing_opt_in" className="accent-ink dark:accent-ink-dark" />
            Send me text updates
          </label>
        </div>
        <Button type="submit" className="w-full">
          Sign up
        </Button>
        <p className="text-xs text-ink/50 dark:text-ink-dark/50">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="mt-4 text-sm text-ink/60 dark:text-ink-dark/60">
        Already have an account?{" "}
        <Link
          href={callbackUrl ? `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/signin"}
          className="underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
