// The follow-up sequence: two short emails after Email 1, then stop. Pure
// module (no database) so the templates and every stop rule are testable.
//
// Nothing here sends. These are drafts that need the same per-recipient human
// approval as Email 1, and there is intentionally no follow-up send path yet.
import { OFFER } from "./offer";
import { SITE_TOKEN } from "./lib-constants";

export const MAX_STEP = 2;
// Days after Email 1 before each step is due. Step 2 is also kept at least
// MIN_GAP_DAYS after step 1.
export const DUE_DAYS: Record<1 | 2, number> = { 1: 3, 2: 7 };
export const MIN_GAP_DAYS = 3;

export function renderFollowUp(step: 1 | 2, p: { greetingName: string | null; courseTitle: string; claimCode: string }) {
  const hi = `Hi ${p.greetingName ?? "there"},`;
  const link = `${SITE_TOKEN}/claim/${p.claimCode}`;
  if (step === 1) {
    return {
      subject: `Your ${p.courseTitle} listing is still unclaimed`.length <= 60
        ? `Your ${p.courseTitle} listing is still unclaimed`
        : "Your listing on No BS Courses is still unclaimed",
      body: [
        hi,
        `A quick reminder that ${p.courseTitle} still has an unclaimed listing on No BS Courses. You can claim your first course listing for free, and business verification is free too. ${OFFER.integrityNote}`,
        `Claim it here: ${link}`,
        `If I have the wrong person, or you'd rather not hear from me, just reply and say so.`,
      ].join("\n\n"),
    };
  }
  return {
    subject: "Why No BS Courses, in three lines",
    body: [
      hi,
      `This is my last email about ${p.courseTitle}. No BS Courses works differently from most course sites in three ways: business ownership is verified, purchaser reviews are independently verified, and ${OFFER.integrityNote.charAt(0).toLowerCase()}${OFFER.integrityNote.slice(1)}`,
      `If you'd like to be the verified owner, claiming your first course listing is free: ${link}`,
      `If it isn't for you, no reply is needed. I won't email again unless you ask.`,
    ].join("\n\n"),
  };
}

// ---- Deterministic stop rules ----

export type SequenceInput = {
  step: 1 | 2;
  now: Date;
  status: string; // creator_outreach.status
  emailSentAt: Date | null; // Email 1
  previousStepSentAt: Date | null; // step 1's send time, when evaluating step 2
  alreadySentSteps: number[];
  stoppedReason: string | null;
  hasReply: boolean;
  suppressed: boolean;
  bounced: boolean;
  complained: boolean;
  claimState: "unclaimed" | "pending" | "verified"; // best state across their listings
  businessVerified: boolean;
  mismatched: boolean; // listing/owner mismatch discovered
};

export type SequenceVerdict = { eligible: boolean; due: boolean; reasons: string[] };

// Statuses in which a cold follow-up can never go out.
const STOP_STATUSES = new Set([
  "replied", "owner_confirmed", "claim_started", "claimed", "business_verified", "free_owner",
  "founding_subscriber", "activated", "wrong_person", "not_interested", "unsubscribed", "bounced",
  "do_not_contact", "manual_review", "send_failed",
]);

function daysBetween(a: Date, b: Date): number {
  return (a.getTime() - b.getTime()) / 86_400_000;
}

export function followUpVerdict(i: SequenceInput): SequenceVerdict {
  const reasons: string[] = [];
  if (i.step > MAX_STEP) reasons.push(`the sequence ends after step ${MAX_STEP}`);
  if (i.stoppedReason) reasons.push(`sequence already stopped: ${i.stoppedReason}`);
  if (i.status !== "sent") reasons.push(`status is ${i.status}, not sent`);
  if (STOP_STATUSES.has(i.status)) reasons.push(`status ${i.status} ends cold follow-up`);
  if (i.hasReply) reasons.push("recipient replied");
  if (i.suppressed) reasons.push("address is suppressed");
  if (i.bounced) reasons.push("bounced");
  if (i.complained) reasons.push("complaint on record");
  if (i.claimState !== "unclaimed") reasons.push(`listing is ${i.claimState === "pending" ? "being claimed" : "claimed"}`);
  if (i.businessVerified) reasons.push("business is verified");
  if (i.mismatched) reasons.push("listing/owner mismatch");
  if (i.alreadySentSteps.includes(i.step)) reasons.push(`step ${i.step} already sent`);
  if (i.step === 2 && !i.alreadySentSteps.includes(1)) reasons.push("step 1 hasn't been sent");

  let due = false;
  if (!i.emailSentAt) reasons.push("Email 1 was never sent");
  else {
    due = daysBetween(i.now, i.emailSentAt) >= DUE_DAYS[i.step];
    if (i.step === 2 && i.previousStepSentAt && daysBetween(i.now, i.previousStepSentAt) < MIN_GAP_DAYS) due = false;
  }
  return { eligible: reasons.length === 0, due: reasons.length === 0 && due, reasons };
}

// First reason a running sequence must be cancelled right now, or null. Stricter
// than "not eligible": it ignores timing and step bookkeeping.
export function mustStopReason(i: Omit<SequenceInput, "step" | "alreadySentSteps" | "previousStepSentAt"> & { step?: 1 | 2 }): string | null {
  if (i.hasReply) return "recipient replied";
  if (i.suppressed) return "address is suppressed";
  if (i.bounced) return "hard bounce";
  if (i.complained) return "complaint";
  if (i.claimState !== "unclaimed") return i.claimState === "pending" ? "claim started" : "listing claimed";
  if (i.businessVerified) return "business verified";
  if (i.mismatched) return "listing/owner mismatch";
  if (STOP_STATUSES.has(i.status) && i.status !== "send_failed") return `status ${i.status}`;
  return null;
}
