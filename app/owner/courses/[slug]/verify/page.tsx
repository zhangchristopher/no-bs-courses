import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ownerAuth } from "@/owner-auth";
import { getOwnedCourseForContract } from "@/lib/ownerCourses";
import { signContractAction } from "./actions";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ error?: string }>;

export const metadata: Metadata = { title: "Verified Course Agreement" };

export default async function VerifyCoursePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
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

  // Only returns a row when owned AND Registered Business is active.
  const course = await getOwnedCourseForContract(slug, session.user.id);
  if (!course) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/owner/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
        &larr; Back to dashboard
      </Link>

      <h1 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Verified Course agreement — &ldquo;{course.title}&rdquo;
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Submitting this goes to an admin for review — the &ldquo;Verified Course&rdquo; badge,
        click analytics, and the ability to respond to reviews only activate once your affiliate
        link is approved. It replaces the plain course-site link everywhere visitors click
        through from this listing, but only after approval.
      </p>

      {course.affiliate_link_status === "verified" && (
        <p className="mt-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          ✓ Your affiliate link is verified and live.
        </p>
      )}
      {course.affiliate_link_status === "pending" && (
        <p className="mt-4 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Your submission is awaiting admin review.
        </p>
      )}
      {course.affiliate_link_status === "rejected" && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          Your previous submission was rejected
          {course.affiliate_link_rejection_reason ? `: ${course.affiliate_link_rejection_reason}` : "."} You
          can resubmit below.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 max-h-64 overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
          Sample terms — not legally binding. Replace with real reviewed legal terms before
          using this in production.
        </p>
        <p className="mt-3">
          By signing below, you confirm that you are authorized to represent{" "}
          <strong>{course.title}</strong>&apos;s provider and agree to:
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Provide accurate, non-misleading information about this course.</li>
          <li>
            Grant this platform the right to redirect visitors to your official course page via
            the tracked affiliate link you provide below.
          </li>
          <li>Honor the affiliate commission terms communicated separately by this platform.</li>
        </ol>
      </div>

      <form action={signContractAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="course_id" value={course.id} />
        <input type="hidden" name="slug" value={course.slug} />

        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Your affiliate link
          <input
            name="affiliate_url"
            type="url"
            required
            defaultValue={course.affiliate_url ?? ""}
            placeholder="https://..."
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Type your full legal name to sign
          <input
            name="signed_name"
            type="text"
            required
            defaultValue={course.contract_signed_name ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" name="agree" required className="accent-zinc-900" />
          I have read and agree to the terms above.
        </label>

        <button
          type="submit"
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {course.contract_signed_at ? "Update agreement" : "Sign agreement"}
        </button>

        {course.contract_signed_at && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Originally signed {new Date(course.contract_signed_at).toLocaleDateString()}.
          </p>
        )}
      </form>
    </main>
  );
}
