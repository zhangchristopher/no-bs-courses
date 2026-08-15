import Link from "next/link";
import type { Metadata } from "next";
import AccountTypeToggle from "@/components/AccountTypeToggle";
import Honeypot from "@/components/Honeypot";
import { registerOwnerAction } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { FormField } from "@/components/ui/FormField";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Owner Sign Up" };

export default async function OwnerSignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;

  return (
    <AuthShell title="Create a business account">
      <p className="text-sm text-ink/60 dark:text-ink-dark/60">
        For course providers who want to claim and manage their listings. This is separate
        from a personal learner account.
      </p>
      <AccountTypeToggle active="business" callbackUrl={callbackUrl} />

      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      <form action={registerOwnerAction} className="mt-6 flex flex-col gap-4">
        <Honeypot />
        {callbackUrl && <input type="hidden" name="callback_url" value={callbackUrl} />}
        <FormField
          label="Display name"
          name="name"
          type="text"
          placeholder="An alias or online handle works fine"
          helperText="Only ever seen by the No BS Courses team, never shown publicly — use an alias if you'd rather keep your real name private. You can change it anytime from your profile. Your legal business name is captured separately (and kept private) during business verification."
        />
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
            Send me owner tips and platform updates by email
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
        Already have a business account?{" "}
        <Link
          href={
            callbackUrl ? `/owner/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/owner/signin"
          }
          className="underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
