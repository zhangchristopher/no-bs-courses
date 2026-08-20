"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import sql from "@/lib/db";
import { categorySlug } from "@/lib/courses";
import { recalculateCourseScores } from "@/lib/scores";
import { checkAndFlagReviewVelocity } from "@/lib/reviewFlags";
import { isSelfReview } from "@/lib/reviews";
import { isLikelyBot } from "@/lib/botCheck";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/clientIp";

export async function submitReviewAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const slug = String(formData.get("slug") ?? "");

  if (isLikelyBot(formData)) {
    redirect(`/courses/${slug}`);
  }

  const ip = await getClientIp();
  const [byUser, byIp] = await Promise.all([
    checkRateLimit({ key: `review:user:${session.user.id}`, limit: 10, windowSeconds: 3600 }),
    checkRateLimit({ key: `review:ip:${ip}`, limit: 20, windowSeconds: 3600 }),
  ]);
  if (!byUser.allowed || !byIp.allowed) {
    redirect(
      `/courses/${slug}?error=${encodeURIComponent("Too many reviews submitted. Try again later.")}`
    );
  }

  const courseId = String(formData.get("course_id") ?? "");
  const category = String(formData.get("category") ?? "");
  const rating = Number(formData.get("rating"));
  const reviewText = String(formData.get("review_text") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect(`/courses/${slug}?error=${encodeURIComponent("Please choose a rating from 1 to 5.")}`);
  }

  const reviewerId = session.user.id;

  if (await isSelfReview(courseId, reviewerId)) {
    redirect(
      `/courses/${slug}?error=${encodeURIComponent("You can't review a course you submitted or own.")}`
    );
  }

  const [existing] = await sql<{ id: string; edit_locked: boolean; edit_deadline: string }[]>`
    SELECT id, edit_locked, edit_deadline
    FROM reviews
    WHERE course_id = ${courseId} AND reviewer_id = ${reviewerId}
    LIMIT 1
  `;

  if (existing) {
    const editable = !existing.edit_locked && new Date(existing.edit_deadline) > new Date();
    if (!editable) {
      redirect(
        `/courses/${slug}?error=${encodeURIComponent("The 48-hour edit window for your review has passed.")}`
      );
    }

    await sql`
      UPDATE reviews
      SET rating = ${rating}, review_text = ${reviewText || null}
      WHERE id = ${existing.id}
    `;
  } else {
    try {
      await sql`
        INSERT INTO reviews (course_id, reviewer_id, rating, review_text, verified_purchase)
        VALUES (${courseId}, ${reviewerId}, ${rating}, ${reviewText || null}, false)
      `;
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? err.code : undefined;
      if (code === "23505") {
        redirect(`/courses/${slug}?error=${encodeURIComponent("You've already reviewed this course.")}`);
      }
      throw err;
    }

    // Only a genuinely new review counts toward the velocity check — an
    // edit to an existing review isn't a new review "received".
    await checkAndFlagReviewVelocity(courseId);
  }

  await recalculateCourseScores(courseId);

  revalidatePath(`/courses/${slug}`);
  revalidatePath("/courses");
  revalidatePath("/");
  if (category) revalidatePath(`/courses/category/${categorySlug(category)}`);

  redirect(`/courses/${slug}`);
}

export async function submitPurchaseVerificationAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const reviewId = String(formData.get("review_id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  if (isLikelyBot(formData)) {
    redirect(`/courses/${slug}`);
  }

  const ip = await getClientIp();
  const [byUser, byIp] = await Promise.all([
    checkRateLimit({ key: `purchase-verify:user:${session.user.id}`, limit: 10, windowSeconds: 3600 }),
    checkRateLimit({ key: `purchase-verify:ip:${ip}`, limit: 20, windowSeconds: 3600 }),
  ]);
  if (!byUser.allowed || !byIp.allowed) {
    redirect(
      `/courses/${slug}?error=${encodeURIComponent("Too many attempts. Try again later.")}`
    );
  }

  const evidence = String(formData.get("purchase_evidence") ?? "").trim();

  if (!evidence) {
    redirect(
      `/courses/${slug}?error=${encodeURIComponent("Please describe how you purchased this course.")}`
    );
  }

  const [updated] = await sql<{ id: string }[]>`
    UPDATE reviews
    SET purchase_evidence = ${evidence}, purchase_verification_status = 'pending'
    WHERE id = ${reviewId}
      AND reviewer_id = ${session.user.id}
      AND purchase_verification_status IN ('none', 'rejected')
    RETURNING id
  `;

  if (!updated) {
    redirect(
      `/courses/${slug}?error=${encodeURIComponent("This review can't be submitted for purchase verification right now.")}`
    );
  }

  revalidatePath(`/courses/${slug}`);
  redirect(`/courses/${slug}`);
}
