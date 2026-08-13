"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ownerAuth } from "@/owner-auth";
import { createCourse } from "@/lib/ownerCourses";
import { wordCount } from "@/lib/text";
import { isLikelyBot } from "@/lib/botCheck";

const FREE_DESCRIPTION_WORD_LIMIT = 500;

export async function submitNewCourseAction(formData: FormData) {
  if (isLikelyBot(formData)) {
    redirect("/courses/new");
  }

  const userSession = await auth();
  const ownerSession = await ownerAuth();

  const submitterUserId = userSession?.user?.id ?? null;
  const submitterOwnerId = ownerSession?.user?.id ?? null;

  if (!submitterUserId && !submitterOwnerId) {
    redirect("/signin?callbackUrl=/courses/new");
  }

  const title = String(formData.get("title") ?? "").trim();
  const providerName = String(formData.get("provider_name") ?? "").trim();
  const platformUrl = String(formData.get("platform_url") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const syllabus = String(formData.get("syllabus") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const durationRaw = String(formData.get("duration_hours") ?? "").trim();
  const prerequisites = String(formData.get("prerequisites") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnail_url") ?? "").trim();

  if (!title || !providerName || !platformUrl) {
    redirect(
      `/courses/new?error=${encodeURIComponent("Title, provider name, and platform URL are required.")}`
    );
  }

  if (wordCount(description) > FREE_DESCRIPTION_WORD_LIMIT) {
    redirect(
      `/courses/new?error=${encodeURIComponent(`Description must be ${FREE_DESCRIPTION_WORD_LIMIT} words or fewer.`)}`
    );
  }

  const price = priceRaw ? Number(priceRaw) : null;
  const durationHours = durationRaw ? Number(durationRaw) : null;
  if ((priceRaw && Number.isNaN(price)) || (durationRaw && Number.isNaN(durationHours))) {
    redirect(`/courses/new?error=${encodeURIComponent("Price and duration must be numbers.")}`);
  }

  const course = await createCourse({
    title,
    providerName,
    platformUrl,
    category: category || null,
    description: description || null,
    syllabus: syllabus || null,
    price,
    durationHours,
    prerequisites: prerequisites || null,
    thumbnailUrl: thumbnailUrl || null,
    addedByUserId: submitterUserId,
    addedByOwnerId: submitterOwnerId,
  });

  redirect(`/courses/new?submitted=${course.slug}`);
}
