// Email 1. A fixed template, so every first email says the same true things
// and the only per-recipient parts are the greeting, the course and the claim
// link. Nothing here is invented personalization. The goal of this email is to
// get the owner to claim their listing for free; the paid plan gets one
// sentence.
import { OFFER } from "./offer";
import { SITE_TOKEN } from "./lib";

export const MAX_WORDS = 170;

export function renderFirstEmail(params: { greetingName: string | null; courseTitle: string; claimCode: string }) {
  const { greetingName, courseTitle, claimCode } = params;

  const body = [
    `Hi ${greetingName ?? "there"},`,
    `${courseTitle} already has a listing on No BS Courses, a site where people read independent reviews before they buy, and it's currently marked Unclaimed. You can claim your first course listing for free, and verifying your business is free too (we check your business registration details). ${OFFER.integrityNote}`,
    `Claim it here: ${SITE_TOKEN}/claim/${claimCode}`,
    `There's also an optional ${OFFER.paidPlan.name} plan with listing-management tools. It's ${OFFER.paidPlan.short}.`,
  ].join("\n\n");

  const short = `Claim your listing: ${courseTitle}`;
  const subject = short.length <= 60 ? short : "Claim your listing on No BS Courses";
  return { subject, body };
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
