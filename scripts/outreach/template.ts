// Email 1. A fixed template, so every first email says the same true things
// and the only per-recipient parts are the greeting and the course. Nothing
// here is invented personalization. The goal of this email is to get the
// owner to claim a listing for free; the paid plan gets one short paragraph.
import { OFFER } from "./offer";
import { SITE_TOKEN } from "./lib";

export const MAX_WORDS = 170;

export function renderFirstEmail(params: { greetingName: string | null; courseTitle: string; slug: string }) {
  const { greetingName, courseTitle, slug } = params;
  const f = OFFER.paidPlan.founding;
  const s = OFFER.paidPlan.standard;

  const body = [
    `Hi ${greetingName ?? "there"},`,
    `Your course already has a listing on No BS Courses, a site where people read independent reviews before they buy. ${courseTitle} is currently marked Unclaimed: ${SITE_TOKEN}/courses/${slug}`,
    `Claiming it is free, and so is the business verification that comes with it (we review your business registration details). Once verified, the listing carries the Registered Business badge. ${OFFER.integrityNote}`,
    `Separately, there's an optional plan for managing the listing yourself, such as editing its details and claiming more courses. Before launch it's ${f.monthly}, or ${f.annual}, with ${f.setupFee}; ${f.locked}. After launch it's ${s.monthly}.`,
    `To claim your listing, start here: ${SITE_TOKEN}/owner/signup`,
  ].join("\n\n");

  const short = `Claim your listing: ${courseTitle}`;
  const subject = short.length <= 60 ? short : "Claim your listing on No BS Courses";
  return { subject, body };
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
