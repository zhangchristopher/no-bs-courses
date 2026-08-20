import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { ownerAuth } from "@/owner-auth";
import Honeypot from "@/components/Honeypot";
import CategoryField from "@/components/CategoryField";
import PlatformUrlField from "@/components/PlatformUrlField";
import { getCategoryNames } from "@/lib/courses";
import { submitNewCourseAction } from "./actions";

export const metadata: Metadata = { title: "Add a Course" };

const FIELD_CLASSES =
  "mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none dark:border-hairline-dark dark:text-ink-dark dark:placeholder:text-ink-dark/40 dark:focus:border-ink-dark";

export default async function AddCoursePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; submitted?: string }>;
}) {
  const { error, submitted } = await searchParams;
  const userSession = await auth();
  const ownerSession = await ownerAuth();
  const isSignedIn = Boolean(userSession?.user?.id || ownerSession?.user?.id);
  const categories = await getCategoryNames();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        Add a course
      </h1>
      <p className="mt-2 text-sm text-ink/60 dark:text-ink-dark/60">
        Anyone with an account can add a course listing — it goes through a quick admin review
        for content quality before it&apos;s public. Adding a listing doesn&apos;t make you its
        owner; if you&apos;re the actual creator, claim it separately once it&apos;s live.
      </p>

      <div className="mt-4 border border-dashed border-ink/30 p-4 text-sm text-ink/70 dark:border-ink-dark/30 dark:text-ink-dark/70">
        <Link href="/courses" className="underline hover:no-underline">
          Search for this course first
        </Link>{" "}
        — someone else may have already added it, and duplicate listings get rejected in
        review.
      </div>

      {submitted && (
        <p className="mt-4 border border-ink/20 bg-ink/[0.03] px-4 py-2 text-sm text-ink dark:border-ink-dark/20 dark:bg-ink-dark/[0.04] dark:text-ink-dark">
          Thanks! Your course submission is pending review.
        </p>
      )}
      {error && (
        <p className="mt-4 border border-red-600/30 bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {!isSignedIn ? (
        <div className="mt-6 border border-hairline p-4 text-sm text-ink/70 dark:border-hairline-dark dark:text-ink-dark/70">
          <Link href="/signin?callbackUrl=/courses/new" className="underline hover:no-underline">
            Sign in
          </Link>{" "}
          (as a learner or a course owner) to add a course.
        </div>
      ) : (
        <form
          action={submitNewCourseAction}
          className="mt-6 flex flex-col gap-4 border border-hairline p-5 dark:border-hairline-dark"
        >
          <Honeypot />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-ink dark:text-ink-dark">
              Title
              <input name="title" type="text" required className={FIELD_CLASSES} />
            </label>
            <label className="text-sm font-medium text-ink dark:text-ink-dark">
              Provider name
              <input name="provider_name" type="text" required className={FIELD_CLASSES} />
            </label>
          </div>

          <PlatformUrlField />

          <CategoryField categories={categories} />

          <label className="text-sm font-medium text-ink dark:text-ink-dark">
            Description
            <textarea name="description" rows={3} className={FIELD_CLASSES} />
            <span className="mt-1 block text-xs font-normal text-ink/50 dark:text-ink-dark/50">
              500 words max. Verified owners with an active Registered Business subscription get
              a 1000-word limit when editing from their dashboard.
            </span>
          </label>

          <label className="text-sm font-medium text-ink dark:text-ink-dark">
            Syllabus
            <textarea name="syllabus" rows={4} className={FIELD_CLASSES} />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm font-medium text-ink dark:text-ink-dark">
              Price (USD)
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0 if free"
                className={FIELD_CLASSES}
              />
            </label>
            <label className="text-sm font-medium text-ink dark:text-ink-dark">
              Duration (hours)
              <input
                name="duration_hours"
                type="number"
                step="0.01"
                min="0"
                className={FIELD_CLASSES}
              />
            </label>
          </div>

          <label className="text-sm font-medium text-ink dark:text-ink-dark">
            Prerequisites
            <input name="prerequisites" type="text" className={FIELD_CLASSES} />
          </label>

          <label className="text-sm font-medium text-ink dark:text-ink-dark">
            Thumbnail URL
            <input name="thumbnail_url" type="url" className={FIELD_CLASSES} />
          </label>

          <button
            type="submit"
            className="mt-2 self-start bg-ink px-6 py-3 text-xs font-bold uppercase tracking-eyebrow text-cream transition hover:bg-ink/80 dark:bg-ink-dark dark:text-cream-dark dark:hover:bg-ink-dark/80"
          >
            Submit for review
          </button>
        </form>
      )}
    </main>
  );
}
