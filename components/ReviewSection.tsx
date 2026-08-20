import { Fragment } from "react";
import { submitReviewAction, submitPurchaseVerificationAction } from "@/app/courses/[slug]/actions";
import { submitOwnerResponseAction } from "@/app/courses/[slug]/owner-actions";
import Honeypot from "@/components/Honeypot";
import Stars from "@/components/Stars";
import { Button } from "@/components/ui/Button";
import { StatusBanner } from "@/components/ui/StatusBanner";
import type { Review } from "@/lib/reviews";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ReviewSection({
  courseId,
  slug,
  category,
  providerName,
  reviews,
  myReview,
  currentUserId,
  isSignedIn,
  isOwnerOfThisCourse,
  isSelfReview,
  error,
}: {
  courseId: string;
  slug: string;
  category: string | null;
  providerName: string;
  reviews: Review[];
  myReview: Review | null;
  currentUserId: string | null;
  isSignedIn: boolean;
  isOwnerOfThisCourse: boolean;
  isSelfReview: boolean;
  error?: string;
}) {
  const editable = myReview
    ? !myReview.edit_locked && new Date(myReview.edit_deadline) > new Date()
    : false;

  return (
    <section className="mt-10 border-t border-hairline pt-8 dark:border-hairline-dark">
      <h2 className="text-lg font-black uppercase tracking-tight text-ink dark:text-ink-dark">
        Reviews ({reviews.length})
      </h2>

      {error && <StatusBanner tone="error">{error}</StatusBanner>}

      <div className="mt-4">
        {!isSignedIn && (
          <p className="text-sm text-ink/60 dark:text-ink-dark/60">
            <a href="/signin" className="underline">
              Sign in
            </a>{" "}
            to write a review.
          </p>
        )}

        {isSignedIn && isSelfReview && !myReview && (
          <p className="text-sm text-ink/60 dark:text-ink-dark/60">
            You can&apos;t review a course you submitted or own.
          </p>
        )}

        {isSignedIn && !isSelfReview && (!myReview || editable) && (
          <form
            action={submitReviewAction}
            className="flex flex-col gap-3 border border-hairline p-4 dark:border-hairline-dark"
          >
            <Honeypot />
            <input type="hidden" name="course_id" value={courseId} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="category" value={category ?? ""} />

            <fieldset className="star-rating" aria-label="Your rating">
              <legend className="mb-1.5 block text-[11px] font-semibold uppercase tracking-eyebrow text-ink dark:text-ink-dark">
                Your rating
              </legend>
              {[5, 4, 3, 2, 1].map((n) => (
                <Fragment key={n}>
                  <input
                    type="radio"
                    name="rating"
                    id={`rating-${n}`}
                    value={n}
                    defaultChecked={myReview ? myReview.rating === n : n === 5}
                    required
                  />
                  <label htmlFor={`rating-${n}`} aria-label={`${n} star${n === 1 ? "" : "s"}`}>
                    ★
                  </label>
                </Fragment>
              ))}
            </fieldset>

            <label className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink dark:text-ink-dark">
              Your review
              <textarea
                name="review_text"
                rows={4}
                defaultValue={myReview?.review_text ?? ""}
                placeholder="What did you think of this course?"
                className="mt-2 w-full border border-hairline bg-transparent px-3 py-2 text-sm normal-case tracking-normal text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none dark:border-hairline-dark dark:text-ink-dark dark:placeholder:text-ink-dark/40 dark:focus:border-ink-dark"
              />
            </label>

            <Button type="submit" size="sm" className="self-start">
              {myReview ? "Update review" : "Submit review"}
            </Button>

            {myReview && (
              <p className="text-xs text-ink/50 dark:text-ink-dark/50">
                You can edit this review until {formatDate(myReview.edit_deadline)}.
              </p>
            )}
          </form>
        )}

        {isSignedIn && myReview && !editable && (
          <p className="text-sm text-ink/50 dark:text-ink-dark/50">
            Your review&apos;s 48-hour edit window has closed.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {reviews.length === 0 && (
          <p className="text-sm text-ink/50 dark:text-ink-dark/50">
            No reviews yet. Be the first to review this course.
          </p>
        )}
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-hairline pb-6 last:border-0 dark:border-hairline-dark"
          >
            <div className="flex items-center gap-2">
              <Stars rating={review.rating} />
              {review.verified_purchase && (
                <span className="border border-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-eyebrow text-ink dark:border-ink-dark dark:text-ink-dark">
                  Verified
                </span>
              )}
            </div>
            {review.review_text && (
              <p className="mt-2 text-sm text-ink/75 dark:text-ink-dark/75">{review.review_text}</p>
            )}
            <p className="mt-2 text-xs text-ink/50 dark:text-ink-dark/50">
              {review.reviewer_display_name ?? "Anonymous"} · {formatDate(review.created_at)}
            </p>

            {currentUserId &&
              review.reviewer_id === currentUserId &&
              !review.verified_purchase &&
              (review.purchase_verification_status === "pending" ? (
                <p className="mt-2 text-xs text-ink/60 dark:text-ink-dark/60">
                  Purchase verification pending admin review.
                </p>
              ) : (
                <form
                  action={submitPurchaseVerificationAction}
                  className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start"
                >
                  <Honeypot />
                  <input type="hidden" name="review_id" value={review.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <input
                    type="text"
                    name="purchase_evidence"
                    required
                    placeholder="Order number, receipt email, etc."
                    className="min-w-[14rem] flex-1 border border-hairline bg-transparent px-3 py-1.5 text-xs text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none dark:border-hairline-dark dark:text-ink-dark dark:placeholder:text-ink-dark/40 dark:focus:border-ink-dark"
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    Verify your purchase
                  </Button>
                </form>
              ))}

            {review.response_text && (
              <div className="mt-3 ml-4 border-l border-hairline pl-4 dark:border-hairline-dark">
                <p className="text-xs font-semibold uppercase tracking-eyebrow text-ink/70 dark:text-ink-dark/70">
                  Response from {providerName}
                </p>
                <p className="mt-1 text-sm text-ink/75 dark:text-ink-dark/75">
                  {review.response_text}
                </p>
                {review.response_created_at && (
                  <p className="mt-1 text-xs text-ink/50 dark:text-ink-dark/50">
                    {formatDate(review.response_created_at)}
                  </p>
                )}
              </div>
            )}

            {isOwnerOfThisCourse && !review.response_text && (
              <form
                action={submitOwnerResponseAction}
                className="mt-3 ml-4 flex flex-col gap-2 border-l border-hairline pl-4 dark:border-hairline-dark"
              >
                <input type="hidden" name="review_id" value={review.id} />
                <input type="hidden" name="slug" value={slug} />
                <label className="text-xs font-semibold uppercase tracking-eyebrow text-ink/70 dark:text-ink-dark/70">
                  Respond as {providerName}
                  <textarea
                    name="response_text"
                    rows={2}
                    required
                    placeholder="Thank the reviewer or address their feedback..."
                    className="mt-2 w-full border border-hairline bg-transparent px-3 py-2 text-sm normal-case tracking-normal text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none dark:border-hairline-dark dark:text-ink-dark dark:placeholder:text-ink-dark/40 dark:focus:border-ink-dark"
                  />
                </label>
                <Button type="submit" variant="secondary" size="sm" className="self-start">
                  Post response
                </Button>
              </form>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
