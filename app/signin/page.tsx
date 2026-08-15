import Link from "next/link";
import type { Metadata } from "next";
import { signinAction } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { FormField } from "@/components/ui/FormField";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Sign In" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string; reset?: string }>;
}) {
  const { error, callbackUrl, reset } = await searchParams;

  return (
    <AuthShell title="Sign in">
      {reset && <StatusBanner tone="success">Password reset. Sign in with your new password.</StatusBanner>}
      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      <form action={signinAction} className="mt-6 flex flex-col gap-4">
        {callbackUrl && <input type="hidden" name="callback_url" value={callbackUrl} />}
        <FormField label="Email" name="email" type="email" required />
        <FormField label="Password" name="password" type="password" required />
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-3 text-sm">
        <Link href="/forgot-password" className="underline text-ink/60 dark:text-ink-dark/60">
          Forgot password?
        </Link>
      </p>

      <p className="mt-4 text-sm text-ink/60 dark:text-ink-dark/60">
        Don&apos;t have an account?{" "}
        <Link
          href={callbackUrl ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/signup"}
          className="underline"
        >
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
