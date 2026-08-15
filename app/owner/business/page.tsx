import Link from "next/link";
import type { Metadata } from "next";
import { ownerAuth } from "@/owner-auth";
import { getOwnerBusinessInfo } from "@/lib/business";
import { submitBusinessInfoAction } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { FormField } from "@/components/ui/FormField";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckMarkIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Registered Business" };

export default async function OwnerBusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; submitted?: string }>;
}) {
  const { error, submitted } = await searchParams;
  const session = await ownerAuth();

  if (!session?.user?.id) {
    return (
      <AuthShell title="Sign in required" maxWidthClassName="max-w-2xl">
        <Link href="/owner/signin" className="inline-block underline">
          Sign in
        </Link>
      </AuthShell>
    );
  }

  const business = await getOwnerBusinessInfo(session.user.id);

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        Registered Business
      </h1>
      <p className="mt-2 text-sm text-ink/60 dark:text-ink-dark/60">
        Submitting your business paperwork is free. Once an admin approves it, you can claim
        course listings. Claiming more than one course, editing your listings, and the
        &ldquo;Registered Business&rdquo; badge require an active $99 + $50/mo subscription
        (started from your dashboard once approved).
      </p>

      {submitted && <StatusBanner tone="success">Submitted for review.</StatusBanner>}
      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      {business?.business_verification_status === "verified" ? (
        <Card className="mt-6 flex items-center gap-2 text-sm text-ink dark:text-ink-dark">
          <CheckMarkIcon className="h-4 w-4 shrink-0" />
          <span>
            Business verified — {business.business_name}. Visit your{" "}
            <Link href="/owner/dashboard" className="underline">
              dashboard
            </Link>{" "}
            to claim courses or subscribe.
          </span>
        </Card>
      ) : business?.business_verification_status === "pending" ? (
        <Card tone="warning" className="mt-6 text-sm text-ink/70 dark:text-ink-dark/70">
          Your paperwork for {business.business_name} is awaiting admin review.
        </Card>
      ) : (
        <form action={submitBusinessInfoAction} className="mt-6 flex flex-col gap-4 border border-hairline p-4 dark:border-hairline-dark">
          {business?.business_verification_status === "rejected" && (
            <StatusBanner tone="error">
              Your previous submission was rejected
              {business.business_rejection_reason ? `: ${business.business_rejection_reason}` : "."}{" "}
              You can resubmit below.
            </StatusBanner>
          )}
          <FormField
            label="Business name"
            name="business_name"
            type="text"
            required
            defaultValue={business?.business_name ?? ""}
          />
          <FormField
            label="Registration number (EIN / LLC number)"
            name="business_registration_number"
            type="text"
            required
            defaultValue={business?.business_registration_number ?? ""}
          />
          <FormField
            label="State of registration"
            name="business_state"
            type="text"
            required
            defaultValue={business?.business_state ?? ""}
          />
          <FormField
            label="Link to paperwork"
            name="business_paperwork_url"
            type="url"
            required
            placeholder="Link to your LLC/registration document"
            defaultValue={business?.business_paperwork_url ?? ""}
          />
          <Button type="submit" className="self-start">
            Submit for review
          </Button>
        </form>
      )}
    </main>
  );
}
