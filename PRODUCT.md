# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: prospective course buyers researching an online course before paying — arriving skeptical of marketing copy, trying to tell a genuinely good course from a well-marketed mediocre one. Secondary: course owners/creators (individuals or registered businesses) who list, claim, and manage course listings, and who can pay to become verified and respond to reviews.

## Product Purpose

No BS Courses aggregates and reviews online courses (from providers like MIT, Harvard, Stanford, and paid platforms) so buyers can find out which courses are actually worth taking before they pay, based on evidence-backed reviews rather than marketing.

## Positioning

Reviews carry real weight because reviewers can submit purchase evidence for admin verification, and course listings carry blunt, unambiguous status badges (Verified Creator, Unclaimed, Flagged) that expose which listings are unproven or suspect. A generic course-aggregator site cannot truthfully make this claim — its reviews and listings are not gated by verification.

## Operating Context

- Learners browse courses by category, read reviews, and can add a course listing themselves (goes through admin content review before going public).
- Course owners go through a tiered ladder: submit a free course listing → get business paperwork verified (free) → activate a bundled paid subscription (unlocks editing control and the ability to claim/manage more than one course) → sign a per-course contract to become "Verified" (unlocks the course's badge, affiliate-link redirect, and the ability to respond to reviews on that course).
- Learners on the free plan get a monthly cap of paid-course unlocks; a $5/mo plan removes the cap. A verified-purchase review on a course auto-unlocks it and earns a bonus unlock credit.
- Two parallel auth systems exist: one for learners, one for owners.

## Capabilities and Constraints

- Stack: Next.js (App Router), PostgreSQL, dual NextAuth v5 setups (learner + owner), Stripe (subscriptions + one-time payments), Resend for transactional email. Deployed on Vercel.
- Real course/category/provider data model already exists in the codebase (categories, providers such as MIT/Harvard/Stanford-style institutions, price, duration, syllabus, prerequisites) — design work must represent this structure accurately, not invent a different content model or fabricate example institutions/courses beyond what's already used as placeholder content in the codebase.
- Admin review gates: new course listings, business paperwork, and purchase-verification evidence all require admin approval before taking effect.

## Brand Commitments

- Name: "No BS Courses" — fixed, not open for reinvention.
- Logo mark: existing wordmark with bold black lettering and a hand-drawn-style red strikethrough — fixed, not open for reinvention.
- Voice: direct, confident, no-nonsense — a brand that tells hard truths about course quality rather than a generic SaaS platform. Confirmed this session: bold high-contrast headline typography (no italics/script), a black/white base palette with the logo's red used sparingly as a deliberate accent (not scattered decoratively), sharper corners over pill-shaped soft UI, solid confident buttons over thin outlined ones, blunt badge/microcopy language over soft euphemisms.

## Evidence on Hand

- Real logo assets in `public/` (light and dark variants).
- Real course category structure and provider-style placeholder content already used throughout the codebase (do not invent a competing content model).
- No real customer testimonials, press mentions, or usage benchmarks exist yet — do not fabricate any for design work.

## Product Principles

1. Evidence over claims — every trust signal (badge, verification, score) must map to a real gated process, not decorative styling.
2. Buyer skepticism is the default emotional state to design for, not enthusiasm — the design should read as credible to someone who expects to be sold to.
3. Status is blunt, not soft — a listing is Verified, Unclaimed, or Flagged; no euphemistic middle ground in copy or visual treatment.
4. Owner incentives are tiered and visible — free listing, paperwork verification, paid subscription, and per-course contract are each a distinct, legible state, not collapsed into one generic "verified" idea.
