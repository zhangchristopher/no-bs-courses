import Link from "next/link";
import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin";
import { getPendingListings } from "@/lib/verifications";
import { approveListingAction, rejectListingAction } from "./actions";

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
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Not authorized
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
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
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        New Listing Review
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {listings.length} pending listing{listings.length === 1 ? "" : "s"}. Signed in as{" "}
        {session.email}. This is content review only — business paperwork is at{" "}
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
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No pending listings.</p>
        )}
        {listings.map((listing) => (
          <div
            key={listing.course_id}
            className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{listing.title}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Submitted {formatDate(listing.submitted_at)}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Provider: {listing.provider_name} · Category: {listing.category ?? "—"}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Platform URL:{" "}
              <a href={listing.platform_url} target="_blank" rel="noopener noreferrer" className="underline">
                {listing.platform_url}
              </a>
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Added by:{" "}
              {listing.added_by_owner_name
                ? `${listing.added_by_owner_name} <${listing.added_by_owner_email}> (owner account)`
                : listing.added_by_user_name
                  ? `${listing.added_by_user_name} (learner account)`
                  : "Unknown"}
            </p>

            <div className="mt-3 rounded-md bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              {listing.thumbnail_url && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Thumbnail: {listing.thumbnail_url}
                </p>
              )}
              {listing.description && <p className="mt-1 whitespace-pre-line">{listing.description}</p>}
              {listing.syllabus && (
                <>
                  <div className="mt-2 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                    Syllabus
                  </div>
                  <p className="mt-1 whitespace-pre-line">{listing.syllabus}</p>
                </>
              )}
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Price: {listing.price ? `$${listing.price}` : "N/A"} · Duration:{" "}
                {listing.duration_hours ? `${listing.duration_hours}h` : "N/A"} · Prerequisites:{" "}
                {listing.prerequisites || "None listed"}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <form action={approveListingAction}>
                <input type="hidden" name="course_id" value={listing.course_id} />
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                >
                  Approve
                </button>
              </form>
              <form action={rejectListingAction}>
                <input type="hidden" name="course_id" value={listing.course_id} />
                <button
                  type="submit"
                  className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Reject
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
