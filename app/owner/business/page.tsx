import Link from "next/link";
import type { Metadata } from "next";
import { ownerAuth } from "@/owner-auth";
import { getOwnerBusinessInfo } from "@/lib/business";
import { submitBusinessInfoAction } from "./actions";

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
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sign in required
        </h1>
        <Link href="/owner/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </main>
    );
  }

  const business = await getOwnerBusinessInfo(session.user.id);

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Registered Business
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Submitting your business paperwork is free. Once an admin approves it, you can claim
        course listings. Claiming more than one course, editing your listings, and the
        &ldquo;Registered Business&rdquo; badge require an active $99 + $50/mo subscription
        (started from your dashboard once approved).
      </p>

      {submitted && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Submitted for review.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {business?.business_verification_status === "verified" ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          ✓ Business verified — {business.business_name}. Visit your{" "}
          <Link href="/owner/dashboard" className="underline">
            dashboard
          </Link>{" "}
          to claim courses or subscribe.
        </div>
      ) : business?.business_verification_status === "pending" ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
          Your paperwork for {business.business_name} is awaiting admin review.
        </div>
      ) : (
        <form
          action={submitBusinessInfoAction}
          className="mt-6 flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          {business?.business_verification_status === "rejected" && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              Your previous submission was rejected
              {business.business_rejection_reason ? `: ${business.business_rejection_reason}` : "."}{" "}
              You can resubmit below.
            </p>
          )}
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Business name
            <input
              name="business_name"
              type="text"
              required
              defaultValue={business?.business_name ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Registration number (EIN / LLC number)
            <input
              name="business_registration_number"
              type="text"
              required
              defaultValue={business?.business_registration_number ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            State of registration
            <input
              name="business_state"
              type="text"
              required
              defaultValue={business?.business_state ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Link to paperwork
            <input
              name="business_paperwork_url"
              type="url"
              required
              placeholder="Link to your LLC/registration document"
              defaultValue={business?.business_paperwork_url ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <button
            type="submit"
            className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Submit for review
          </button>
        </form>
      )}
    </main>
  );
}
