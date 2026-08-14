import { submitReviewAction, submitPurchaseVerificationAction } from "@/app/courses/[slug]/actions";
import { submitOwnerResponseAction } from "@/app/courses/[slug]/owner-actions";
import Stars from "@/components/Stars";
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
  error?: string;
}) {
  const editable = myReview
    ? !myReview.edit_locked && new Date(myReview.edit_deadline) > new Date()
    : false;

  return (
    <section className="mt-10 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Reviews ({reviews.length})
      </h2>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-4">
        {!isSignedIn && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <a href="/signin" className="underline">
              Sign in
            </a>{" "}
            to write a review.
          </p>
        )}

        {isSignedIn && (!myReview || editable) && (
          <form
            action={submitReviewAction}
            className="flex flex-col gap-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <input type="hidden" name="course_id" value={courseId} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="category" value={category ?? ""} />

            <div>
              <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Your rating
              </span>
              <div className="mt-1 flex gap-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label
                    key={n}
                    className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <input
                      type="radio"
                      name="rating"
                      value={n}
                      defaultChecked={myReview ? myReview.rating === n : n === 5}
                      required
                      className="accent-amber-500"
                    />
                    {n}
                  </label>
                ))}
              </div>
            </div>

            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Your review
              <textarea
                name="review_text"
                rows={4}
                defaultValue={myReview?.review_text ?? ""}
                placeholder="What did you think of this course?"
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>

            <button
              type="submit"
              className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {myReview ? "Update review" : "Submit review"}
            </button>

            {myReview && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                You can edit this review until {formatDate(myReview.edit_deadline)}.
              </p>
            )}
          </form>
        )}

        {isSignedIn && myReview && !editable && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your review&apos;s 48-hour edit window has closed.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {reviews.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No reviews yet. Be the first to review this course.
          </p>
        )}
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-zinc-100 pb-6 last:border-0 dark:border-zinc-900"
          >
            <div className="flex items-center gap-2">
              <Stars rating={review.rating} />
              {review.verified_purchase && (
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Verified
                </span>
              )}
            </div>
            {review.review_text && (
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{review.review_text}</p>
            )}
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {review.reviewer_display_name ?? "Anonymous"} · {formatDate(review.created_at)}
            </p>

            {currentUserId &&
              review.reviewer_id === currentUserId &&
              !review.verified_purchase &&
              (review.purchase_verification_status === "pending" ? (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                  Purchase verification pending admin review.
                </p>
              ) : (
                <form
                  action={submitPurchaseVerificationAction}
                  className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start"
                >
                  <input type="hidden" name="review_id" value={review.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <input
                    type="text"
                    name="purchase_evidence"
                    required
                    placeholder="Order number, receipt email, etc."
                    className="min-w-[14rem] flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
                  >
                    Verify your purchase
                  </button>
                </form>
              ))}

            {review.response_text && (
              <div className="mt-3 ml-4 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Response from {providerName}
                </p>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {review.response_text}
                </p>
                {review.response_created_at && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(review.response_created_at)}
                  </p>
                )}
              </div>
            )}

            {isOwnerOfThisCourse && !review.response_text && (
              <form
                action={submitOwnerResponseAction}
                className="mt-3 ml-4 flex flex-col gap-2 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700"
              >
                <input type="hidden" name="review_id" value={review.id} />
                <input type="hidden" name="slug" value={slug} />
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Respond as {providerName}
                  <textarea
                    name="response_text"
                    rows={2}
                    required
                    placeholder="Thank the reviewer or address their feedback..."
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  />
                </label>
                <button
                  type="submit"
                  className="self-start rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
                >
                  Post response
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
