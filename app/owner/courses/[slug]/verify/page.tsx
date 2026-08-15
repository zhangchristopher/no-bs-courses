import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ownerAuth } from "@/owner-auth";
import { getOwnedCourseForContract } from "@/lib/ownerCourses";
import { signContractAction } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { FormField } from "@/components/ui/FormField";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Button } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/icons";

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
      <AuthShell title="Sign in required" maxWidthClassName="max-w-2xl">
        <Link href="/owner/signin" className="inline-block underline">
          Sign in
        </Link>
      </AuthShell>
    );
  }

  // Only returns a row when owned AND Registered Business is active.
  const course = await getOwnedCourseForContract(slug, session.user.id);
  if (!course) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/owner/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink/55 hover:underline dark:text-ink-dark/55"
      >
        <ArrowIcon direction="left" className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      <h1 className="mt-3 text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">
        Verified Course agreement — &ldquo;{course.title}&rdquo;
      </h1>
      <p className="mt-2 text-sm text-ink/60 dark:text-ink-dark/60">
        Submitting this goes to an admin for review — the &ldquo;Verified Course&rdquo; badge,
        click analytics, and the ability to respond to reviews only activate once your affiliate
        link is approved. It replaces the plain course-site link everywhere visitors click
        through from this listing, but only after approval.
      </p>

      {course.affiliate_link_status === "verified" && (
        <StatusBanner tone="success">Your affiliate link is verified and live.</StatusBanner>
      )}
      {course.affiliate_link_status === "pending" && (
        <StatusBanner tone="warning">Your submission is awaiting admin review.</StatusBanner>
      )}
      {course.affiliate_link_status === "rejected" && (
        <StatusBanner tone="error">
          Your previous submission was rejected
          {course.affiliate_link_rejection_reason ? `: ${course.affiliate_link_rejection_reason}` : "."} You
          can resubmit below.
        </StatusBanner>
      )}
      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      <div className="mt-6 max-h-64 overflow-y-auto border border-hairline bg-ink/[0.02] p-4 text-sm text-ink/75 dark:border-hairline-dark dark:bg-ink-dark/[0.03] dark:text-ink-dark/75">
        <p className="text-xs font-semibold uppercase tracking-eyebrow text-ink/50 dark:text-ink-dark/50">
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

        <FormField
          label="Your affiliate link"
          name="affiliate_url"
          type="url"
          required
          defaultValue={course.affiliate_url ?? ""}
          placeholder="https://..."
        />
        <FormField
          label="Type your full legal name to sign"
          name="signed_name"
          type="text"
          required
          defaultValue={course.contract_signed_name ?? ""}
        />

        <label className="flex items-center gap-2 text-sm text-ink/70 dark:text-ink-dark/70">
          <input type="checkbox" name="agree" required className="accent-ink dark:accent-ink-dark" />
          I have read and agree to the terms above.
        </label>

        <Button type="submit" className="self-start">
          {course.contract_signed_at ? "Update agreement" : "Sign agreement"}
        </Button>

        {course.contract_signed_at && (
          <p className="text-xs text-ink/50 dark:text-ink-dark/50">
            Originally signed {new Date(course.contract_signed_at).toLocaleDateString()}.
          </p>
        )}
      </form>
    </main>
  );
}
