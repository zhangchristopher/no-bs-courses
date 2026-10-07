import Link from "next/link";
import type { Metadata } from "next";
import { ownerAuth } from "@/owner-auth";
import { getOwnerBusinessInfo } from "@/lib/business";
import { getClaimInvitation, recordInvitationOpen } from "@/lib/claimInvitations";
import { ownerPlanName, pricingSentence } from "@/lib/pricing";
import { claimInvitedCourseAction } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { Button } from "@/components/ui/Button";
import { StatusBanner } from "@/components/ui/StatusBanner";

export const metadata: Metadata = {
  title: "Claim your course listing",
  // A private link meant for one recipient: keep it out of search engines.
  robots: { index: false, follow: false },
};

export default async function ClaimPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ error?: string; submitted?: string }>;
}) {
  const { code } = await params;
  const { error, submitted } = await searchParams;

  const invitation = await getClaimInvitation(code);
  if (!invitation) {
    return (
      <AuthShell title="Link not recognized" align="center">
        <p className="text-sm text-ink-dark/60">
          This claim link is invalid or has expired. If you were invited to claim a listing, reply to
          the email you received and we&apos;ll send a new one.
        </p>
      </AuthShell>
    );
  }

  const session = await ownerAuth();
  const ownerId = session?.user?.id ?? null;
  await recordInvitationOpen(invitation.id, ownerId);

  const callback = encodeURIComponent(`/claim/${code}`);
  const course = (
    <div className="border border-hairline-dark p-4 text-left">
      <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink-dark/50">
        The listing
      </p>
      <p className="mt-1 text-lg font-bold text-ink-dark">{invitation.title}</p>
      <p className="text-sm text-ink-dark/60">
        {invitation.provider_name}
        {invitation.platform ? ` · ${invitation.platform}` : ""}
      </p>
      <Link href={`/courses/${invitation.slug}`} className="mt-2 inline-block text-sm underline">
        View the listing
      </Link>
    </div>
  );

  const claimed = invitation.verification_status !== "unclaimed";
  if (claimed || invitation.listing_status !== "published") {
    const mine = Boolean(ownerId) && invitation.owner_id === ownerId;
    return (
      <AuthShell title={submitted || mine ? "Claim submitted" : "Already claimed"} maxWidthClassName="max-w-lg">
        {course}
        <p className="mt-4 text-sm text-ink-dark/60">
          {submitted || mine
            ? "Your claim is with our team for review. You'll hear from us by email once it's approved."
            : "This listing has already been claimed or is under review, so this link can't be used to claim it."}
        </p>
        {ownerId && (
          <p className="mt-4 text-sm">
            <Link href="/owner/dashboard" className="underline">
              Go to your dashboard
            </Link>
          </p>
        )}
      </AuthShell>
    );
  }

  const business = ownerId ? await getOwnerBusinessInfo(ownerId) : null;
  const status = business?.business_verification_status ?? "none";

  return (
    <AuthShell title="Claim your course listing" maxWidthClassName="max-w-lg">
      {error && <StatusBanner tone="error">{error}</StatusBanner>}
      {course}
      <p className="mt-4 text-sm text-ink-dark/60">
        This course already has a listing on No BS Courses, currently marked Unclaimed. You can claim
        your first course listing for free, and verifying your business is free too. Payment never
        changes ratings, rankings, or verification.
      </p>

      {!ownerId ? (
        <div className="mt-6 flex flex-col gap-3">
          <Button href={`/owner/signup?callbackUrl=${callback}`}>Create a free business account</Button>
          <Button href={`/owner/signin?callbackUrl=${callback}`} variant="secondary">
            I already have an account
          </Button>
        </div>
      ) : status === "verified" ? (
        <form action={claimInvitedCourseAction} className="mt-6">
          <input type="hidden" name="code" value={code} />
          <Button type="submit" className="w-full">
            Claim this course
          </Button>
          <p className="mt-2 text-xs text-ink-dark/50">
            Claims are reviewed by our team before they take effect.
          </p>
        </form>
      ) : status === "pending" ? (
        <StatusBanner tone="info">
          Your business paperwork is being reviewed. Come back to this page once it&apos;s approved to
          claim this course.
        </StatusBanner>
      ) : (
        <div className="mt-6">
          <p className="text-sm text-ink-dark">
            {status === "rejected"
              ? "Your business paperwork needs to be resubmitted before you can claim."
              : "First, verify your business. It's free: we review your business registration details."}
          </p>
          <div className="mt-3">
            <Button href="/owner/business">{status === "rejected" ? "Resubmit paperwork" : "Verify your business"}</Button>
          </div>
          <p className="mt-2 text-xs text-ink-dark/50">
            This page will be waiting here, and it&apos;ll appear on your dashboard too.
          </p>
        </div>
      )}

      <p className="mt-6 border-t border-hairline-dark pt-4 text-xs text-ink-dark/50">
        Optional: the {ownerPlanName()} plan adds listing-management tools ({pricingSentence()}). You
        don&apos;t need it to claim or to be verified.
      </p>
    </AuthShell>
  );
}
