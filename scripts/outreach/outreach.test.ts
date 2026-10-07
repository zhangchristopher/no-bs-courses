// Tests for the pure outreach modules: reply classification and policy, fixed
// response templates, independence principles, follow-up templates and stop
// rules, and prospect scoring. No database.
//
//   npm run outreach:test
import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyReply, pipelineEffect, renderTemplate, CATEGORIES, TEMPLATES, type TemplateName } from "./replies";
import { copyViolations } from "./principles";
import { renderFollowUp, followUpVerdict, mustStopReason, type SequenceInput } from "./followups";
import { scoreProspect } from "./scoring";
import { renderFirstEmail, wordCount } from "./template";
import { OFFER } from "./offer";

// ---------- reply classification ----------

const CASES: [string, string][] = [
  ["Please unsubscribe me", "UNSUBSCRIBE"],
  ["Take me off your list", "UNSUBSCRIBE"],
  ["My lawyer will be in touch about this", "LEGAL_CONCERN"],
  ["This is a scam and how dare you email me", "ANGRY"],
  ["You have the wrong person", "WRONG_PERSON"],
  ["I'm not the owner of that community anymore", "NOT_OWNER"],
  ["That course is no longer running", "COURSE_INACTIVE"],
  ["I already claimed it last week", "ALREADY_CLAIMED"],
  ["Not interested, thanks", "NOT_INTERESTED"],
  ["Can you resend the claim link?", "CLAIM_LINK_REQUEST"],
  ["How do I claim it?", "HOW_DO_I_CLAIM"],
  ["How much does it cost?", "PRICE_QUESTION"],
  ["How does verification work, do I need an LLC?", "HOW_VERIFICATION_WORKS"],
  ["Can paying owners delete negative reviews?", "REVIEW_QUESTION"],
  ["What does the Founding Owner plan include?", "FOUNDING_PLAN_QUESTION"],
  ["Do you pay affiliate commissions?", "AFFILIATE_QUESTION"],
  ["I'd love to partner and collaborate with you", "PARTNERSHIP_INTEREST"],
  ["Yes that's my course, I'm the owner", "OWNER_CONFIRMED"],
];

for (const [text, expected] of CASES) {
  test(`classifies "${text}" as ${expected}`, () => {
    assert.equal(classifyReply(text).classification, expected);
  });
}

test("every classification carries confidence, action and the two flags", () => {
  for (const [text] of CASES) {
    const c = classifyReply(text);
    assert.ok(c.confidence > 0 && c.confidence <= 1);
    assert.ok(c.recommendedAction.length > 5);
    assert.equal(typeof c.autoResponsePermitted, "boolean");
    assert.equal(typeof c.humanReviewRequired, "boolean");
  }
});

test("low-confidence and unclear replies always go to a human, never auto", () => {
  for (const text of ["ok", "Sounds interesting", "hmm maybe later", "Out of office until Monday", "", "Thanks for the note about my situation here"]) {
    const c = classifyReply(text);
    assert.equal(c.humanReviewRequired, true, text);
    assert.equal(c.autoResponsePermitted, false, text);
  }
});

test("mixed signals with different answers go to a human", () => {
  const c = classifyReply("How much does it cost and can you tell me about the affiliate commission?");
  assert.equal(c.humanReviewRequired, true);
  assert.equal(c.autoResponsePermitted, false);
});

test("'that's mine, how do I claim' is one answer, so it can be automatic", () => {
  const c = classifyReply("Yes that's my course, how do I claim it?");
  assert.equal(c.humanReviewRequired, false);
  assert.equal(c.autoResponsePermitted, true);
  assert.ok(c.template);
});

test("quoted history and our own words are ignored", () => {
  const reply = "Thanks\n\nOn Tue, Oct 6, 2026 at 9:00 AM Christopher wrote:\n> Claiming is free. Payment never affects reviews. Unsubscribe here.";
  assert.notEqual(classifyReply(reply).classification, "UNSUBSCRIBE");
  assert.equal(classifyReply(reply).humanReviewRequired, true);
});

test("an unsubscribe is honored even when it comes with anger, and a person also reads it", () => {
  const c = classifyReply("Remove me from your list, this is spam");
  assert.equal(c.classification, "UNSUBSCRIBE");
  assert.equal(c.humanReviewRequired, true);
  assert.equal(pipelineEffect("UNSUBSCRIBE").suppress !== null, true);
});

test("sensitive categories are never automatic", () => {
  for (const cat of ["UNSUBSCRIBE", "ANGRY", "LEGAL_CONCERN", "AFFILIATE_QUESTION", "PARTNERSHIP_INTEREST", "ALREADY_CLAIMED", "AMBIGUOUS", "HUMAN_REQUIRED", "NOT_INTERESTED", "COURSE_INACTIVE"] as const) {
    const sample = CASES.find(([, c]) => c === cat)?.[0];
    if (sample) assert.equal(classifyReply(sample).autoResponsePermitted, false, cat);
  }
});

test("all required categories exist", () => {
  for (const c of ["OWNER_CONFIRMED", "CLAIM_LINK_REQUEST", "INTERESTED", "HOW_DO_I_CLAIM", "PRICE_QUESTION", "HOW_VERIFICATION_WORKS", "REVIEW_QUESTION", "FOUNDING_PLAN_QUESTION", "AFFILIATE_QUESTION", "PARTNERSHIP_INTEREST", "WRONG_PERSON", "NOT_OWNER", "COURSE_INACTIVE", "ALREADY_CLAIMED", "NOT_INTERESTED", "UNSUBSCRIBE", "ANGRY", "LEGAL_CONCERN", "AMBIGUOUS", "HUMAN_REQUIRED"]) {
    assert.ok((CATEGORIES as readonly string[]).includes(c), c);
  }
});

// ---------- deterministic pipeline effects ----------

test("an unsubscribe suppresses, stops the sequence and logs the event", () => {
  const e = pipelineEffect("UNSUBSCRIBE");
  assert.ok(e.suppress);
  assert.ok(e.stopSequence);
  assert.ok(e.events.includes("unsubscribed"));
  assert.equal(e.status, "unsubscribed");
});

test("wrong person, not interested, angry and legal all stop the sequence and suppress", () => {
  for (const c of ["WRONG_PERSON", "NOT_OWNER", "NOT_INTERESTED", "ANGRY", "LEGAL_CONCERN"] as const) {
    const e = pipelineEffect(c);
    assert.ok(e.suppress, c);
    assert.ok(e.stopSequence, c);
  }
});

test("every reply stops the sequence", () => {
  for (const c of CATEGORIES) assert.ok(pipelineEffect(c).stopSequence, c);
});

// ---------- fixed response templates ----------

const CTX = { name: "Adam", title: "Podcasting Business School", claimUrl: "https://example.test/claim/ABCDEFGHIJKLMNOP" };

test("every template renders and breaks no independence principle", () => {
  for (const name of Object.keys(TEMPLATES) as TemplateName[]) {
    const text = renderTemplate(name, CTX);
    assert.deepEqual(copyViolations(text), [], name);
    assert.ok(!/forever/i.test(text), name);
  }
});

test("the price answer states the Founding Owner pricing exactly and from lib/pricing.ts", () => {
  const text = renderTemplate("PRICE", CTX);
  assert.match(text, /\$1\/mo for 12 months, then \$25\/mo/);
  assert.match(text, /\$12 for the first year, then \$240\/yr/);
  assert.match(text, /no setup fee/i);
  assert.match(text, /never affects reviews, scores, verification, or ranking/);
  for (const amount of text.match(/\$\d[\d,]*/g) ?? []) assert.ok(OFFER.allowedAmounts.has(amount), amount);
});

test("claim answers say the first listing is free, verification is free, and the link doesn't skip verification", () => {
  const text = renderTemplate("CLAIM_EXPLAIN", CTX);
  assert.match(text, /first course listing for free/);
  assert.match(text, /verification is free/);
  assert.match(text, /doesn't skip verification/);
  assert.match(text, /optional Founding Owner plan/);
});

test("the review answer says payment can't improve scores or remove legitimate negative reviews", () => {
  const text = renderTemplate("REVIEWS", CTX);
  assert.match(text, /independent/);
  assert.match(text, /can't remove a legitimate review because it's negative/);
});

test("the wrong-person answer asks once and promises no follow-up", () => {
  const text = renderTemplate("WRONG_PERSON", CTX);
  assert.match(text, /won't follow up/);
});

// ---------- independence principles ----------

test("copy that implies affiliate, advertising, payment or revenue prove quality is rejected", () => {
  for (const bad of [
    "Our affiliate partners are more trusted",
    "Our affiliate program proves quality",
    "Paying owners get a better rating",
    "Subscribers get stronger verification",
    "This verified business is a good course",
    "Advertisers are recommended courses",
    "Revenue of $50k means it is profitable",
    "The $12 price is forever",
    "Act now, this ends soon",
    "We endorse your course",
  ]) assert.ok(copyViolations(bad).length > 0, bad);
});

test("the honest sentences are not rejected", () => {
  for (const ok of [
    "Payment never affects reviews, scores, verification, or ranking.",
    "A paying owner can't remove a legitimate review because it's negative.",
    "Business ownership is verified and purchaser reviews are independently verified.",
    "It's $1/month for the first 12 months, then discounted founder pricing.",
  ]) assert.deepEqual(copyViolations(ok), [], ok);
});

test("the real first email and both follow-ups pass the principles and the content rules", () => {
  const first = renderFirstEmail({ greetingName: "Adam", courseTitle: "Podcasting Business School", claimCode: "ABCDEFGHIJKLMNOPQRSTUV" });
  const f1 = renderFollowUp(1, { greetingName: "Adam", courseTitle: "Podcasting Business School", claimCode: "ABCDEFGHIJKLMNOPQRSTUV" });
  const f2 = renderFollowUp(2, { greetingName: "Adam", courseTitle: "Podcasting Business School", claimCode: "ABCDEFGHIJKLMNOPQRSTUV" });
  for (const m of [first, f1, f2]) {
    assert.deepEqual(copyViolations(`${m.subject}\n${m.body}`), []);
    assert.ok(m.subject.length <= 60);
    assert.ok(wordCount(m.body) <= 170);
    assert.match(m.body, /\{\{site\}\}\/claim\/[A-Za-z0-9_-]{16,}/);
    assert.match(m.body, /first course listing/);
    assert.match(m.body, /never affects reviews, scores, verification, or ranking/);
    assert.ok(!/!/.test(m.body));
  }
  assert.ok(wordCount(f1.body) < wordCount(first.body), "follow-up 1 stays very short");
});

// ---------- follow-up stop rules ----------

const DAY = 86_400_000;
const NOW = new Date("2026-10-20T12:00:00Z");
const base = (over: Partial<SequenceInput> = {}): SequenceInput => ({
  step: 1,
  now: NOW,
  status: "sent",
  emailSentAt: new Date(NOW.getTime() - 4 * DAY),
  previousStepSentAt: null,
  alreadySentSteps: [],
  stoppedReason: null,
  hasReply: false,
  suppressed: false,
  bounced: false,
  complained: false,
  claimState: "unclaimed",
  businessVerified: false,
  mismatched: false,
  ...over,
});

test("follow-up 1 is due about 3-4 days after Email 1", () => {
  assert.equal(followUpVerdict(base()).due, true);
  assert.equal(followUpVerdict(base({ emailSentAt: new Date(NOW.getTime() - 2 * DAY) })).due, false);
  assert.equal(followUpVerdict(base({ emailSentAt: new Date(NOW.getTime() - 2 * DAY) })).eligible, true);
});

test("follow-up 2 needs follow-up 1 first, about 7 days after Email 1 and 3 after follow-up 1", () => {
  const at = (d: number) => new Date(NOW.getTime() - d * DAY);
  assert.equal(followUpVerdict(base({ step: 2 })).eligible, false);
  assert.equal(followUpVerdict(base({ step: 2, emailSentAt: at(8), alreadySentSteps: [1], previousStepSentAt: at(5) })).due, true);
  assert.equal(followUpVerdict(base({ step: 2, emailSentAt: at(8), alreadySentSteps: [1], previousStepSentAt: at(1) })).due, false);
});

test("there is no step 3: the sequence stops after two", () => {
  assert.equal(followUpVerdict(base({ step: 3 as 1 })).eligible, false);
});

const STOPS: [string, Partial<SequenceInput>][] = [
  ["a reply", { hasReply: true }],
  ["a suppressed address", { suppressed: true }],
  ["a bounce", { bounced: true }],
  ["a complaint", { complained: true }],
  ["a claim in progress", { claimState: "pending" }],
  ["a completed claim", { claimState: "verified" }],
  ["a verified business", { businessVerified: true }],
  ["a mismatched listing", { mismatched: true }],
  ["do-not-contact status", { status: "do_not_contact" }],
  ["an unsubscribe", { status: "unsubscribed" }],
  ["a negative reply status", { status: "not_interested" }],
  ["a wrong-person status", { status: "wrong_person" }],
  ["a sequence already stopped", { stoppedReason: "recipient replied" }],
  ["step already sent", { alreadySentSteps: [1] }],
];
for (const [name, over] of STOPS) {
  test(`${name} blocks the follow-up`, () => {
    const v = followUpVerdict(base(over));
    assert.equal(v.eligible, false);
    assert.equal(v.due, false);
    assert.ok(v.reasons.length > 0);
  });
}

test("mustStopReason is deterministic and names the reason", () => {
  const { step: _s, alreadySentSteps: _a, previousStepSentAt: _p, ...clean } = base();
  void _s; void _a; void _p;
  assert.equal(mustStopReason(clean), null);
  assert.equal(mustStopReason({ ...clean, hasReply: true }), "recipient replied");
  assert.equal(mustStopReason({ ...clean, suppressed: true }), "address is suppressed");
  assert.equal(mustStopReason({ ...clean, bounced: true }), "hard bounce");
  assert.equal(mustStopReason({ ...clean, complained: true }), "complaint");
  assert.equal(mustStopReason({ ...clean, claimState: "pending" }), "claim started");
  assert.equal(mustStopReason({ ...clean, claimState: "verified" }), "listing claimed");
  assert.equal(mustStopReason({ ...clean, businessVerified: true }), "business verified");
  assert.equal(mustStopReason({ ...clean, mismatched: true }), "listing/owner mismatch");
  assert.ok(mustStopReason({ ...clean, status: "do_not_contact" }));
});

// ---------- scoring ----------

test("a best-case prospect scores 100 and the weights add up", () => {
  const r = scoreProspect({ match: "high", contactSource: "own_site", activity: "active", business: "registered_entity", commercial: "strong", fit: "strong" });
  assert.equal(r.score, 100);
});

test("a weak owner match caps the score whatever else looks good", () => {
  const best = { contactSource: "own_site", activity: "active", business: "registered_entity", commercial: "strong", fit: "strong" } as const;
  assert.ok(scoreProspect({ ...best, match: "low" }).score <= 45);
  assert.ok(scoreProspect({ ...best, match: "none" }).score <= 25);
});

test("a generic support inbox scores lower than a named address, all else equal", () => {
  const input = { match: "high", contactSource: "own_site", activity: "active", business: "registered_entity", commercial: "strong", fit: "strong" } as const;
  assert.equal(scoreProspect({ ...input, addressKind: "named_person" }).score, 100);
  assert.equal(scoreProspect({ ...input, addressKind: "generic_support" }).score, 95);
});

test("affiliate participation is not an input to the score", () => {
  const r = scoreProspect({ match: "medium", contactSource: "own_site", activity: "active", business: "operating_business_site", commercial: "some", fit: "some" });
  assert.deepEqual(Object.keys(r.breakdown).sort(), ["activity", "business", "commercial", "contactSource", "fit", "match"]);
  assert.ok(!Object.keys(r.breakdown).some((k) => /affiliate|sponsor|advert/i.test(k)));
});
