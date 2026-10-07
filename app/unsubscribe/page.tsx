import type { Metadata } from "next";
import { unsubscribeAction } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

// A button rather than unsubscribing on page load: mail security scanners
// open every link in an email, and would otherwise opt people out unasked.
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; status?: string }>;
}) {
  const { t, status } = await searchParams;

  if (status === "done") {
    return (
      <AuthShell title="You're unsubscribed" align="center">
        <p className="text-sm text-ink/60 dark:text-ink-dark/60">
          We won&apos;t email this address again. Your course listing isn&apos;t affected.
        </p>
      </AuthShell>
    );
  }

  if (status === "invalid" || !t) {
    return (
      <AuthShell title="Link not recognized" align="center">
        <p className="text-sm text-ink/60 dark:text-ink-dark/60">
          Open the unsubscribe link from the email you received, or just reply to that email
          and ask — we&apos;ll remove you by hand.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Unsubscribe" align="center">
      <p className="text-sm text-ink/60 dark:text-ink-dark/60">
        Stop all emails from No BS Courses about claiming your listing.
      </p>
      <form action={unsubscribeAction} className="mt-6">
        <input type="hidden" name="token" value={t} />
        <Button type="submit">Unsubscribe</Button>
      </form>
    </AuthShell>
  );
}
