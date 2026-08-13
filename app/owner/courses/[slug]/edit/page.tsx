import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ownerAuth } from "@/owner-auth";
import { getOwnedCourseForEdit } from "@/lib/ownerCourses";
import {
  SECTION_TYPES,
  MAX_SECTIONS_PER_COURSE,
  getCourseSections,
  sectionTypeLabel,
} from "@/lib/courseSections";
import {
  updateOwnerCourseAction,
  updateDiscountAction,
  addCourseSectionAction,
  deleteCourseSectionAction,
} from "./actions";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ error?: string; updated?: string }>;

export const metadata: Metadata = { title: "Edit Listing" };

export default async function EditOwnerCoursePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { error, updated } = await searchParams;
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

  // getOwnedCourseForEdit only returns a row when verified_owner_id matches
  // this owner — ownership is enforced in the query, not here.
  const course = await getOwnedCourseForEdit(slug, session.user.id);
  if (!course) notFound();

  const sections = await getCourseSections(course.id);
  const usedTypes = new Set(sections.map((s) => s.section_type));
  const availableTypes = SECTION_TYPES.filter((t) => !usedTypes.has(t.value));
  const canAddSection = sections.length < MAX_SECTIONS_PER_COURSE;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/owner/dashboard" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
        &larr; Back to dashboard
      </Link>

      <h1 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Edit &ldquo;{course.title}&rdquo;
      </h1>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {updated === "discount" && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Discount updated.
        </p>
      )}

      <form action={updateOwnerCourseAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="course_id" value={course.id} />
        <input type="hidden" name="slug" value={course.slug} />

        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Description
          <textarea
            name="description"
            rows={3}
            defaultValue={course.description ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <span className="mt-1 block text-xs font-normal text-zinc-500 dark:text-zinc-400">
            1000 words max (Registered Business limit).
          </span>
        </label>

        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Syllabus
          <textarea
            name="syllabus"
            rows={5}
            defaultValue={course.syllabus ?? ""}
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
              defaultValue={course.price ?? ""}
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
              defaultValue={course.duration_hours ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </label>
        </div>

        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Prerequisites
          <input
            name="prerequisites"
            type="text"
            defaultValue={course.prerequisites ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Thumbnail URL
          <input
            name="thumbnail_url"
            type="url"
            defaultValue={course.thumbnail_url ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <button
          type="submit"
          className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Save changes
        </button>
      </form>

      <section className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Extra sections ({sections.length}/{MAX_SECTIONS_PER_COURSE})
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Add up to {MAX_SECTIONS_PER_COURSE} extra sections to your listing, one of each type.
        </p>

        <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950">
          <p className="text-sm font-medium text-violet-900 dark:text-violet-200">
            {course.affiliate_link_status === "verified"
              ? "✓ Affiliate Link"
              : course.affiliate_link_status === "pending"
                ? "Affiliate Link (pending review)"
                : course.affiliate_link_status === "rejected"
                  ? "Affiliate Link (rejected)"
                  : "Affiliate Link"}
          </p>
          <p className="mt-1 text-sm text-violet-800 dark:text-violet-300">
            {course.affiliate_link_status === "verified"
              ? "Your affiliate link is verified and live. Update it or review the Verified Course agreement anytime — resubmitting requires re-approval."
              : course.affiliate_link_status === "pending"
                ? "Your affiliate link is awaiting admin review. Verified Course features stay off until it's approved."
                : course.affiliate_link_status === "rejected"
                  ? "Your submission was rejected. Review and resubmit your affiliate link."
                  : "Add your affiliate link and, once an admin approves it, unlock the Verified Course badge, click analytics, and the ability to respond to reviews."}
          </p>
          <Link
            href={`/owner/courses/${course.slug}/verify`}
            className="mt-2 inline-block text-sm font-medium text-violet-900 underline dark:text-violet-200"
          >
            {course.affiliate_link_status === "verified"
              ? "Manage affiliate link →"
              : course.affiliate_link_status === "pending"
                ? "View submission →"
                : course.affiliate_link_status === "rejected"
                  ? "Resubmit affiliate link →"
                  : "Add affiliate link & unlock Verified Course →"}
          </Link>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Affiliate discount
          </h3>
          {course.affiliate_link_status === "verified" ? (
            <form action={updateDiscountAction} className="mt-2 flex flex-col gap-3">
              <input type="hidden" name="course_id" value={course.id} />
              <input type="hidden" name="slug" value={course.slug} />
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Compare-at price (optional)
                <input
                  name="compare_at_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Shown crossed out"
                  defaultValue={course.compare_at_price ?? ""}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </label>
              <button
                type="submit"
                className="self-start rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Save discount
              </button>
            </form>
          ) : (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              🔒 Discounts are a Verified Course perk — available once your affiliate link is
              verified.
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {sectionTypeLabel(section.section_type)}
                </span>
                <form action={deleteCourseSectionAction}>
                  <input type="hidden" name="section_id" value={section.id} />
                  <input type="hidden" name="slug" value={course.slug} />
                  <button
                    type="submit"
                    className="text-xs text-red-700 hover:underline dark:text-red-400"
                  >
                    Remove
                  </button>
                </form>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300">
                {section.content}
              </p>
              {section.image_url && (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary owner-supplied URLs, not in next/image's remotePatterns allowlist
                <img
                  src={section.image_url}
                  alt={sectionTypeLabel(section.section_type)}
                  className="mt-2 max-h-40 rounded-lg object-cover"
                />
              )}
              {section.video_url && (
                <a
                  href={section.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm underline"
                >
                  ▶ Watch video
                </a>
              )}
            </div>
          ))}
        </div>

        {canAddSection ? (
          <form
            action={addCourseSectionAction}
            className="mt-4 flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <input type="hidden" name="course_id" value={course.id} />
            <input type="hidden" name="slug" value={course.slug} />

            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Section type
              <select
                name="section_type"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                {availableTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Content
              <textarea
                name="content"
                rows={3}
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Image URL (optional)
                <input
                  name="image_url"
                  type="url"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </label>
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Video URL (optional)
                <input
                  name="video_url"
                  type="url"
                  placeholder="YouTube, Vimeo, direct link..."
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </label>
            </div>

            <button
              type="submit"
              className="self-start rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Add section
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            You&apos;ve reached the {MAX_SECTIONS_PER_COURSE}-section limit.
          </p>
        )}
      </section>
    </main>
  );
}
