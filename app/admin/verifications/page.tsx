import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin";
import { getPendingListings } from "@/lib/verifications";
import { approveListingAction, rejectListingAction } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Listing Review" };

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminVerificationsPage() {
  const session = await getAdminSession();

  if (!session.authorized) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
          Not authorized
        </h1>
        <p className="mt-2 text-ink/60 dark:text-ink-dark/60">
          {session.reason === "signed-out"
            ? "Sign in with the admin account to view the listing queue."
            : "Your account does not have access to this page."}
        </p>
        <Link href="/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </main>
    );
  }

  const listings = await getPendingListings();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        New Listing Review
      </h1>
      <p className="mt-2 text-sm tabular-nums text-ink/60 dark:text-ink-dark/60">
        {listings.length} pending listing{listings.length === 1 ? "" : "s"}. This is content
        review only — business paperwork is at{" "}
        <Link href="/admin/businesses" className="underline">
          Business Verifications
        </Link>
        , and course ownership claims are at{" "}
        <Link href="/admin/claims" className="underline">
          Course Claims
        </Link>
        .
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {listings.length === 0 && (
          <p className="text-sm text-ink/50 dark:text-ink-dark/50">No pending listings.</p>
        )}
        {listings.map((listing) => (
          <Card key={listing.course_id}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink dark:text-ink-dark">{listing.title}</span>
              <span className="text-xs tabular-nums text-ink/50 dark:text-ink-dark/50">
                Submitted {formatDate(listing.submitted_at)}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink/55 dark:text-ink-dark/55">
              Provider: {listing.provider_name} · Category: {listing.category ?? "—"}
            </p>
            <p className="mt-1 text-sm text-ink/55 dark:text-ink-dark/55">
              Platform URL:{" "}
              <a href={listing.platform_url} target="_blank" rel="noopener noreferrer" className="underline">
                {listing.platform_url}
              </a>
            </p>
            <p className="mt-1 text-sm text-ink/55 dark:text-ink-dark/55">
              Added by:{" "}
              {listing.added_by_owner_name
                ? `${listing.added_by_owner_name} <${listing.added_by_owner_email}> (owner account)`
                : listing.added_by_user_name
                  ? `${listing.added_by_user_name} (learner account)`
                  : "Unknown"}
            </p>

            <div className="mt-3 border border-hairline bg-ink/[0.02] p-3 text-sm text-ink/75 dark:border-hairline-dark dark:bg-ink-dark/[0.03] dark:text-ink-dark/75">
              {listing.thumbnail_url && (
                <p className="text-xs text-ink/50 dark:text-ink-dark/50">
                  Thumbnail: {listing.thumbnail_url}
                </p>
              )}
              {listing.description && <p className="mt-1 whitespace-pre-line">{listing.description}</p>}
              {listing.syllabus && (
                <>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
                    Syllabus
                  </div>
                  <p className="mt-1 whitespace-pre-line">{listing.syllabus}</p>
                </>
              )}
              <p className="mt-2 text-xs tabular-nums text-ink/50 dark:text-ink-dark/50">
                Price: {listing.price ? `$${listing.price}` : "N/A"} · Duration:{" "}
                {listing.duration_hours ? `${listing.duration_hours}h` : "N/A"} · Prerequisites:{" "}
                {listing.prerequisites || "None listed"}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <form action={approveListingAction}>
                <input type="hidden" name="course_id" value={listing.course_id} />
                <Button type="submit" size="sm">
                  Approve
                </Button>
              </form>
              <form action={rejectListingAction}>
                <input type="hidden" name="course_id" value={listing.course_id} />
                <Button type="submit" variant="secondary" size="sm">
                  Reject
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
