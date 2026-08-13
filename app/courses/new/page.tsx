import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { ownerAuth } from "@/owner-auth";
import Honeypot from "@/components/Honeypot";
import { submitNewCourseAction } from "./actions";

export const metadata: Metadata = { title: "Add a Course" };

export default async function AddCoursePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; submitted?: string }>;
}) {
  const { error, submitted } = await searchParams;
  const userSession = await auth();
  const ownerSession = await ownerAuth();
  const isSignedIn = Boolean(userSession?.user?.id || ownerSession?.user?.id);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Add a course</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Anyone with an account can add a course listing — it goes through a quick admin review
        for content quality before it&apos;s public. Adding a listing doesn&apos;t make you its
        owner; if you&apos;re the actual creator, claim it separately once it&apos;s live.
      </p>

      {submitted && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Thanks! Your course submission is pending review.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {!isSignedIn ? (
        <div className="mt-6 rounded-lg border border-zinc-200 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
          <Link href="/signin?callbackUrl=/courses/new" className="underline">
            Sign in
          </Link>{" "}
          (as a learner or a course owner) to add a course.
        </div>
      ) : (
        <form
          action={submitNewCourseAction}
          className="mt-6 flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <Honeypot />
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Title
            <input
              name="title"
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Provider name
            <input
              name="provider_name"
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Platform URL
            <input
              name="platform_url"
              type="url"
              required
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Category
            <input
              name="category"
              type="text"
              placeholder="e.g. Web Development"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Description
            <textarea
              name="description"
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
            <span className="mt-1 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
              500 words max. Verified owners with an active Registered Business subscription get
              a 1000-word limit when editing from their dashboard.
            </span>
          </label>
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Syllabus
            <textarea
              name="syllabus"
              rows={4}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Price (USD)
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Duration (hours)
              <input
                name="duration_hours"
                type="number"
                step="0.01"
                min="0"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>
          </div>
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Prerequisites
            <input
              name="prerequisites"
              type="text"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Thumbnail URL
            <input
              name="thumbnail_url"
              type="url"
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
