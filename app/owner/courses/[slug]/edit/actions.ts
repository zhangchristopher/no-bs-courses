"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ownerAuth } from "@/owner-auth";
import { updateOwnerCourseFields, updateCourseDiscount } from "@/lib/ownerCourses";
import { addCourseSection, deleteCourseSection } from "@/lib/courseSections";
import { wordCount } from "@/lib/text";

const BUSINESS_DESCRIPTION_WORD_LIMIT = 1000;

export async function updateOwnerCourseAction(formData: FormData) {
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }

  const courseId = String(formData.get("course_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;
  const syllabus = String(formData.get("syllabus") ?? "").trim() || null;
  const priceRaw = String(formData.get("price") ?? "").trim();
  const durationRaw = String(formData.get("duration_hours") ?? "").trim();
  const prerequisites = String(formData.get("prerequisites") ?? "").trim() || null;
  const thumbnailUrl = String(formData.get("thumbnail_url") ?? "").trim() || null;

  if (description && wordCount(description) > BUSINESS_DESCRIPTION_WORD_LIMIT) {
    redirect(
      `/owner/courses/${slug}/edit?error=${encodeURIComponent(`Description must be ${BUSINESS_DESCRIPTION_WORD_LIMIT} words or fewer.`)}`
    );
  }

  const price = priceRaw ? Number(priceRaw) : null;
  const durationHours = durationRaw ? Number(durationRaw) : null;

  if ((priceRaw && Number.isNaN(price)) || (durationRaw && Number.isNaN(durationHours))) {
    redirect(
      `/owner/courses/${slug}/edit?error=${encodeURIComponent("Price and duration must be numbers.")}`
    );
  }

  const updated = await updateOwnerCourseFields({
    courseId,
    ownerId: session.user.id,
    description,
    syllabus,
    price,
    durationHours,
    prerequisites,
    thumbnailUrl,
  });

  if (!updated) {
    redirect(
      `/owner/dashboard?error=${encodeURIComponent("You do not have permission to edit this course.")}`
    );
  }

  revalidatePath(`/courses/${slug}`);
  revalidatePath("/courses");
  revalidatePath(`/owner/courses/${slug}/edit`);

  redirect(`/owner/dashboard?updated=${slug}`);
}

// Discounts are a Verified Course (affiliate) perk — updateCourseDiscount
// re-checks affiliate_link_status = 'verified' in the query itself, so this
// can't be bypassed even if the form were submitted directly.
export async function updateDiscountAction(formData: FormData) {
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }

  const courseId = String(formData.get("course_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const compareAtPriceRaw = String(formData.get("compare_at_price") ?? "").trim();
  const compareAtPrice = compareAtPriceRaw ? Number(compareAtPriceRaw) : null;

  if (compareAtPriceRaw && Number.isNaN(compareAtPrice)) {
    redirect(
      `/owner/courses/${slug}/edit?error=${encodeURIComponent("Compare-at price must be a number.")}`
    );
  }

  const updated = await updateCourseDiscount({
    courseId,
    ownerId: session.user.id,
    compareAtPrice,
  });

  if (!updated) {
    redirect(
      `/owner/courses/${slug}/edit?error=${encodeURIComponent("Discounts require a verified affiliate link.")}`
    );
  }

  revalidatePath(`/courses/${slug}`);
  revalidatePath("/courses");
  revalidatePath(`/owner/courses/${slug}/edit`);

  redirect(`/owner/courses/${slug}/edit?updated=discount`);
}

export async function addCourseSectionAction(formData: FormData) {
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }

  const courseId = String(formData.get("course_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const sectionType = String(formData.get("section_type") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
  const videoUrl = String(formData.get("video_url") ?? "").trim() || null;

  if (!sectionType || !content) {
    redirect(
      `/owner/courses/${slug}/edit?error=${encodeURIComponent("Choose a section type and add content.")}`
    );
  }

  const result = await addCourseSection({
    courseId,
    ownerId: session.user.id,
    sectionType,
    content,
    imageUrl,
    videoUrl,
  });
  if (!result.ok) {
    redirect(`/owner/courses/${slug}/edit?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath(`/courses/${slug}`);
  revalidatePath(`/owner/courses/${slug}/edit`);

  redirect(`/owner/courses/${slug}/edit`);
}

export async function deleteCourseSectionAction(formData: FormData) {
  const session = await ownerAuth();
  if (!session?.user?.id) {
    redirect("/owner/signin");
  }

  const sectionId = String(formData.get("section_id") ?? "");
  const slug = String(formData.get("slug") ?? "");

  await deleteCourseSection(sectionId, session.user.id);

  revalidatePath(`/courses/${slug}`);
  revalidatePath(`/owner/courses/${slug}/edit`);

  redirect(`/owner/courses/${slug}/edit`);
}
