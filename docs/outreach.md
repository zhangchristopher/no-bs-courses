# Creator outreach: how it works and what has to be true before it sends

This is the operating guide for the founding-owner outreach system in `scripts/outreach/`. Nothing here sends email by itself: a person approves each recipient and runs the send.

## What the first email is for

Getting a legitimate owner to claim their existing listing for free. In this order:

1. Your course already has a listing, currently unclaimed.
2. Your **first** course listing is free to claim.
3. Business verification is free.
4. Payment never affects reviews, scores, verification, or ranking.
5. Here is the claim link for your specific listing.
6. The Founding Owner plan is an optional management plan (one sentence).

The free status is **Verified Business**. The paid plan is **Founding Owner** (called Owner Plan after the founding offer closes). Pricing comes only from `lib/pricing.ts`.

## Independence principles (enforced in code)

`scripts/outreach/principles.ts` rejects any outreach copy that breaks these, and the draft validator, the reply templates and the follow-ups all call it:

- An affiliate relationship is not an endorsement and not proof of profitability.
- A registered business is not a high-quality course.
- A paying subscriber gets no better rating and no stronger factual verification.
- An advertiser is not a recommended course.
- Revenue evidence is not profit unless profit is actually verified.

## Authentication status (recorded)

Confirmed by the founder on 2026-10-07 from an internal test message sent through the outreach SMTP path (Gmail "Show original"). Stored in `scripts/outreach/auth-status.json` and read by `npm run outreach:preflight`.

| Check | Result |
|---|---|
| SPF | PASS |
| DKIM | PASS, signing domain `nobscourses.com` |
| DMARC | PASS, policy `p=none` (monitoring; not changed) |
| `List-Unsubscribe` header | present |
| `List-Unsubscribe-Post: List-Unsubscribe=One-Click` header | present |

Re-test after any DNS or mail-provider change: `npm run outreach:test-email -- <your other mailbox>`.

## Live-send blockers

Live sending (`npm run outreach:send -- --send`) refuses to run unless all of these hold:

- `OFFER.confirmed` is `true` in `scripts/outreach/offer.ts` (a person flips it after reading the drafts).
- `OUTREACH_MAILBOX_CONFIRMED=true` in `.env.local` (a person flips it once the public mailbox service is fully active). **Currently `false`.**
- `OUTREACH_POSTAL_ADDRESS` is a valid postal address (street number, state, ZIP).
- The recipient was individually approved (`npm run outreach:approve`).
- The address is not suppressed (rechecked immediately before each send, and enforced by database triggers).
- The listing is still unclaimed and the claim link is still a live invitation.

Previews, research, drafting, tests and the read-only gate keep working while the mailbox flag is `false`.

## Before launch checklist

1. Deploy the branch to production, then `npm run outreach:verify-prod` must pass every check.
2. `npm run outreach:preflight` shows no FAIL.
3. `npm run outreach:gate -- "<creator>" ...` passes for the people you intend to send to.
4. Set `OUTREACH_MAILBOX_CONFIRMED=true` when the mailbox is active.
5. Read the drafts, set `OFFER.confirmed`, approve recipients one by one, preview with `npm run outreach:send`, then send.

## Replies

`npm run outreach:reply -- "<creator>" --file reply.txt` classifies an inbound reply with fixed rules (`replies.ts`), applies the effects that must happen at once, stops the follow-up sequence, and stores a suggested response. It never sends anything.

- Twenty categories, each with a confidence score, a recommended action, an auto-response flag and a human-review flag.
- One threshold, **0.8**: below it a person always decides. Mixed signals with different answers also go to a person.
- Always a person: `AFFILIATE_QUESTION`, `PARTNERSHIP_INTEREST`, `LEGAL_CONCERN`, `ANGRY`, `ALREADY_CLAIMED`, `AMBIGUOUS`, `HUMAN_REQUIRED`.
- Template-eligible at high confidence: `OWNER_CONFIRMED`, `HOW_DO_I_CLAIM`, `CLAIM_LINK_REQUEST`, `PRICE_QUESTION`, `HOW_VERIFICATION_WORKS`, `REVIEW_QUESTION`, `FOUNDING_PLAN_QUESTION`, `WRONG_PERSON`/`NOT_OWNER` (asks once for the right contact).
- `UNSUBSCRIBE` suppresses the address globally and immediately and logs it. `NOT_INTERESTED`, `WRONG_PERSON`, `ANGRY` and `LEGAL_CONCERN` also suppress. No further promotional message follows.
- "Auto response permitted" is a policy flag only. No automatic reply sender exists.

## Follow-ups

Two, then stop. `npm run outreach:followup -- preview` shows the exact text.

- Follow-up 1: about 3 days after Email 1, a short reminder that the listing is unclaimed.
- Follow-up 2: about 7 days after Email 1 (and 3 after the first), why No BS Courses is different. It says it is the last email.
- Drafting and approval exist (`draft`, `approve`). **There is deliberately no follow-up send command yet.**

A running sequence stops automatically, deterministically (`followups.ts`, `sequence.ts`), when the recipient replies, the listing is claimed or a claim starts, the business is verified, the address unsubscribes or is suppressed, the address bounces, a complaint is logged, the record is marked do-not-contact, or the listing/owner is found to be mismatched. `npm run outreach:followup -- sweep` applies it, and `outreach:metrics` runs it every time.

## Analytics

`npm run outreach:metrics` shows the funnel (researched, qualified, drafted, approved, sent, delivered, replied, positive reply, claim started, claimed, business verified, free owner or Founding Owner, first and fifth purchase-verified review, activated) and the rates per delivered outreach. Open rate is deliberately not tracked.

`ACTIVATED` means a claimed listing with at least one purchase-verified review.

`npm run outreach:metrics -- --by <segment>` splits the same outcomes by category, platform, price band, creator size, contact source, channel, message variant, follow-up step, match confidence, testimonials visible, or whether the course appears active. This is recorded for later comparison; nothing changes strategy automatically.

## Prospect scoring (0 to 100)

`scoring.ts`: owner/course match 35, course activity 20, business evidence 15, quality of the contact source 15 (a generic support inbox loses 5), commercial activity 10, fit 5. A low match caps the score at 45 and no match at 25. Affiliate participation is not an input.

## Tests

`npm run outreach:test` runs the classifier, response-template, independence-principle, follow-up, stop-rule, scoring and footer tests.
