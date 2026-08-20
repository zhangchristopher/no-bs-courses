import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { AuthShell } from "@/components/ui/AuthShell";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Your Account" };

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <AuthShell title="Sign in required">
        <Link href="/signin" className="inline-block underline">
          Sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        Your account
      </h1>
      <p className="mt-2 text-sm text-ink/60 dark:text-ink-dark/60">{session.user.email}</p>

      <Card className="mt-6">
        <p className="text-sm text-ink/75 dark:text-ink-dark/75">
          Every course listing — description, pricing, and reviews — is free to read. No plan
          required.
        </p>
      </Card>
    </main>
  );
}
