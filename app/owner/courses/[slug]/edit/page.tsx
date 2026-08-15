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
import { AuthShell } from "@/components/ui/AuthShell";
import { FormField, FormTextarea } from "@/components/ui/FormField";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowIcon, CheckMarkIcon, LockIcon, PlayIcon } from "@/components/icons";

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
      <AuthShell title="Sign in required" maxWidthClassName="max-w-2xl">
        <Link href="/owner/signin" className="inline-block underline">
          Sign in
        </Link>
      </AuthShell>
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
      <Link
        href="/owner/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink/55 hover:underline dark:text-ink-dark/55"
      >
        <ArrowIcon direction="left" className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      <h1 className="mt-3 text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        Edit &ldquo;{course.title}&rdquo;
      </h1>

      {error && <StatusBanner tone="error">{error}</StatusBanner>}
      {updated === "discount" && <StatusBanner tone="success">Discount updated.</StatusBanner>}

      <form action={updateOwnerCourseAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="course_id" value={course.id} />
        <input type="hidden" name="slug" value={course.slug} />

        <FormTextarea
          label="Description"
          name="description"
          rows={3}
          defaultValue={course.description ?? ""}
          helperText="1000 words max (Registered Business limit)."
        />
        <FormTextarea label="Syllabus" name="syllabus" rows={5} defaultValue={course.syllabus ?? ""} />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Price (USD)"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={course.price ?? ""}
          />
          <FormField
            label="Duration (hours)"
            name="duration_hours"
            type="number"
            step="0.01"
            min="0"
            defaultValue={course.duration_hours ?? ""}
          />
        </div>

        <FormField label="Prerequisites" name="prerequisites" type="text" defaultValue={course.prerequisites ?? ""} />
        <FormField label="Thumbnail URL" name="thumbnail_url" type="url" defaultValue={course.thumbnail_url ?? ""} />

        <Button type="submit" className="self-start">
          Save changes
        </Button>
      </form>

      <section className="mt-10 border-t border-hairline pt-6 dark:border-hairline-dark">
        <h2 className="text-lg font-black uppercase tracking-tight text-ink dark:text-ink-dark">
          Extra sections ({sections.length}/{MAX_SECTIONS_PER_COURSE})
        </h2>
        <p className="mt-1 text-sm text-ink/60 dark:text-ink-dark/60">
          Add up to {MAX_SECTIONS_PER_COURSE} extra sections to your listing, one of each type.
        </p>

        <Card tone={course.affiliate_link_status === "verified" ? "default" : "warning"} className="mt-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink dark:text-ink-dark">
            {course.affiliate_link_status === "verified" && <CheckMarkIcon className="h-4 w-4 shrink-0" />}
            {course.affiliate_link_status === "verified"
              ? "Affiliate Link"
              : course.affiliate_link_status === "pending"
                ? "Affiliate Link (pending review)"
                : course.affiliate_link_status === "rejected"
                  ? "Affiliate Link (rejected)"
                  : "Affiliate Link"}
          </p>
          <p className="mt-1 text-sm text-ink/70 dark:text-ink-dark/70">
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
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-ink underline dark:text-ink-dark"
          >
            {course.affiliate_link_status === "verified"
              ? "Manage affiliate link"
              : course.affiliate_link_status === "pending"
                ? "View submission"
                : course.affiliate_link_status === "rejected"
                  ? "Resubmit affiliate link"
                  : "Add affiliate link & unlock Verified Course"}
            <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
        </Card>

        <Card className="mt-4">
          <h3 className="text-sm font-semibold uppercase tracking-eyebrow text-ink dark:text-ink-dark">
            Affiliate discount
          </h3>
          {course.affiliate_link_status === "verified" ? (
            <form action={updateDiscountAction} className="mt-2 flex flex-col gap-3">
              <input type="hidden" name="course_id" value={course.id} />
              <input type="hidden" name="slug" value={course.slug} />
              <FormField
                label="Compare-at price (optional)"
                name="compare_at_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Shown crossed out"
                defaultValue={course.compare_at_price ?? ""}
              />
              <Button type="submit" variant="secondary" size="sm" className="self-start">
                Save discount
              </Button>
            </form>
          ) : (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-ink/55 dark:text-ink-dark/55">
              <LockIcon className="h-3.5 w-3.5 shrink-0" /> Discounts are a Verified Course perk —
              available once your affiliate link is verified.
            </p>
          )}
        </Card>

        <div className="mt-4 flex flex-col gap-3">
          {sections.map((section) => (
            <Card key={section.id}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-eyebrow text-ink dark:text-ink-dark">
                  {sectionTypeLabel(section.section_type)}
                </span>
                <form action={deleteCourseSectionAction}>
                  <input type="hidden" name="section_id" value={section.id} />
                  <input type="hidden" name="slug" value={course.slug} />
                  <button type="submit" className="text-xs text-ink/60 hover:underline dark:text-ink-dark/60">
                    Remove
                  </button>
                </form>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-ink/75 dark:text-ink-dark/75">
                {section.content}
              </p>
              {section.image_url && (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary owner-supplied URLs, not in next/image's remotePatterns allowlist
                <img
                  src={section.image_url}
                  alt={sectionTypeLabel(section.section_type)}
                  className="mt-2 max-h-40 object-cover"
                />
              )}
              {section.video_url && (
                <a
                  href={section.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm underline"
                >
                  <PlayIcon className="h-4 w-4" /> Watch video
                </a>
              )}
            </Card>
          ))}
        </div>

        {canAddSection ? (
          <form action={addCourseSectionAction} className="mt-4 flex flex-col gap-3 border border-hairline p-4 dark:border-hairline-dark">
            <input type="hidden" name="course_id" value={course.id} />
            <input type="hidden" name="slug" value={course.slug} />

            <label className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink dark:text-ink-dark">
              Section type
              <select
                name="section_type"
                required
                className="mt-2 w-full border border-hairline bg-transparent px-3 py-2 text-sm normal-case tracking-normal text-ink focus:border-ink focus:outline-none dark:border-hairline-dark dark:bg-cream-dark dark:text-ink-dark dark:focus:border-ink-dark"
              >
                {availableTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <FormTextarea label="Content" name="content" rows={3} required />

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Image URL (optional)" name="image_url" type="url" />
              <FormField label="Video URL (optional)" name="video_url" type="url" placeholder="YouTube, Vimeo, direct link..." />
            </div>

            <Button type="submit" variant="secondary" size="sm" className="self-start">
              Add section
            </Button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-ink/50 dark:text-ink-dark/50">
            You&apos;ve reached the {MAX_SECTIONS_PER_COURSE}-section limit.
          </p>
        )}
      </section>
    </main>
  );
}
