# CourseVerdict — Development Summary

A full account of what's been built, in the order it was built. CourseVerdict is a Next.js (App Router) + PostgreSQL (Neon) + Tailwind CSS course-comparison and review platform, similar in spirit to sites like Class Central or G2, but for online courses, with a built-in affiliate/monetization layer for course providers.

---

## 1. Foundation

- Scaffolded with `create-next-app`: TypeScript, Tailwind CSS, App Router.
- `lib/db.ts` exports a single `sql` client from the `postgres` npm package — a tagged-template SQL client, **not an ORM**. Every query in the codebase is hand-written SQL via `sql\`...\``, which keeps query intent explicit and makes it easy to embed authorization checks directly in `WHERE`/`EXISTS` clauses (a pattern used consistently throughout — see "Security model" below).
- `schema.sql` holds the original table definitions and is never edited after the fact. All schema changes since then are additive migrations in `migrations/*.sql`, applied via `npm run migrate` (`scripts/migrate.ts`). This means the database's history is fully reconstructible from the migration files in order.
- `.env.local` holds `DATABASE_URL` (Neon Postgres, pooled connection) and is gitignored.

## 2. Course listing & browsing

- `lib/courses.ts` — all read queries for the public course catalog: `getCoursesByCategory` (grouped by category, optional search), `getCoursesForCategory`, `getCourseBySlug`, `getAllCategories`, `getAllCourseSlugs` (for sitemap generation).
- Course listing (`/courses`), category pages (`/courses/category/[category]`), and course detail pages (`/courses/[slug]`) are all Server Components — the entire site is server-rendered except one small client component (see below).
- SEO: dynamic `generateMetadata` on every page (titles, descriptions built from real data), a generated `sitemap.xml`, and breadcrumb navigation (`components/Breadcrumbs.tsx`) with matching structured breadcrumb data.
- **Search**: full-text-ish search across title, provider name, and category (`ILIKE` matching), available both from a dedicated search box on `/courses` and from a persistent search bar in the site header (added later — see §9).
- **Sorting** (added mid-session): a `sort` query param with five options — Featured, Highest rated, Verified first, Price low→high, Price high→low — implemented in `lib/courses.ts` via `sortCourseList()`. Choosing anything but "Featured" flattens the category-grouped view into one ranked grid, since ranking by price/rating across categories only makes sense as a single ordered list. "Verified first" ranks by the same tier ladder as the badge system (Verified Course > Registered Business > plain claimed). The same sort control appears on both `/courses` and individual category pages.

## 3. Authentication — two separate identity systems

This was an explicit, deliberate design decision: **learners and course owners are entirely separate accounts**, not roles on one account.

- `auth.ts` — NextAuth v5 (Auth.js), JWT sessions, credentials provider, cookie name `authjs.session-token`. Backs the `users` table (learners/reviewers).
- `owner-auth.ts` — a second, independent NextAuth instance, cookie name `owner-authjs.session-token`, backing the `owners` table (course providers). Different `basePath` (`/api/owner-auth`), different sign-in page, different session shape.
- A person can hold both a learner account and an owner account simultaneously, signed into both at once, because the cookies don't collide.
- Passwords hashed via `lib/password.ts` (bcrypt-style hashing, not reversible).

## 4. Reviews

- `lib/reviews.ts` — CRUD for reviews, tied to a `(course_id, user_id)` pair with a unique constraint (one review per learner per course, editable within a window rather than resubmittable).
- Course-level aggregate scoring (`course_scores` table: `overall_score`, `total_reviews`) recalculated whenever reviews change.
- **Purchase verification**: a reviewer can submit evidence (a link/description) that they actually bought the course; an admin approves or rejects it at `/admin/purchase-verifications`. Approval sets `verified_purchase = true` on the review, bumps the course's verified-review count (shown separately in analytics as "Purchase-verified" — see §8), and grants the reviewer **+1 bonus unlock credit** usable toward any other paid course.
- `components/ReviewSection.tsx` renders the review list, the reviewer's own edit form, a "verify your purchase" control on their own review, and — for Verified Course owners only — a response box.

## 5. Owner accounts, claiming, and the three-tier ladder

The core business model: courses can be **added by anyone**, but ownership and its privileges are gated behind an increasingly strict ladder.

| Tier | Requirement | Grants |
|---|---|---|
| **Unclaimed / Free listing** | Anyone (learner or owner account) submits a course via `/courses/new` | Listed publicly once an admin approves the content (`listing_status: pending → published`). No ownership implied. |
| **Verified Creator (claimed)** | Owner completes free business-paperwork submission (LLC/EIN, admin-approved) | Can claim the listing (`verification_status: verified`), capped at 1 claimed course unless subscribed |
| **Registered Business** | Active $99-now + $50/mo Stripe subscription (bundled into one Checkout session) | Editing control over the listing, claiming more than one course, "Registered Business" badge |
| **Verified Course** | Requires an active Registered Business subscription first. Owner signs a click-wrap contract and submits an affiliate link, which an **admin must separately approve** before it activates | "Verified Course" badge, `/go/[slug]` redirects through the real affiliate link instead of the plain platform URL, ability to respond to reviews on that course, full click/conversion analytics for that course |

Key files: `lib/ownerCourses.ts` (claiming, course CRUD, contract signing — all with the owning-check baked into the SQL `WHERE`), `lib/business.ts` (paperwork submission/admin review), `app/owner/business/`, `app/owner/courses/[slug]/verify/` (contract + affiliate link submission), `app/admin/businesses/`, `app/admin/affiliate-links/`, `app/admin/verifications/` (content moderation for new listings).

Cancelling the Registered Business subscription removes the badge and editing rights but does **not** revoke ownership of courses already claimed — only blocks claiming *new* ones beyond the free cap.

## 6. Payments (Stripe)

- One Checkout session type bundles a one-time $99 setup fee with a recurring $50/mo subscription in a single `mode: "subscription"` session (Stripe supports mixing one-time and recurring line items this way).
- Separate Checkout flows for: the customer $5/mo unlimited plan, and $0.99 one-time single-course unlocks.
- `app/api/webhooks/stripe/route.ts` dispatches on `session.metadata.kind` (`business_subscription` / `customer_plan` / `course_unlock`) rather than session mode alone, since two kinds share `mode: "subscription"`.
- All Stripe keys are placeholder test values (`sk_test_REPLACE_ME`) — payments fail gracefully in this environment by design, since real keys were never provided.

## 7. Customer paywall

- `lib/paywall.ts` — `checkCourseAccess()`: free courses are always fully visible; paid courses are locked unless the visitor has an active $5/mo subscription, has already unlocked that specific course (3 free unlocks/month, a $0.99 one-time unlock, a spent bonus credit, or their own verified-purchase review auto-unlocking it).
- Critically, locking happens **server-side in the JSX itself** — when locked, the real description/syllabus/price/reviews are never sent to the client at all (not CSS-hidden), and `generateMetadata` also returns a generic description so the real content doesn't leak via `<meta>` tags either (a gap I found and fixed via direct testing, not a user report).
- `/account` — the first user-facing account page: shows current plan, unlocks used this month, bonus credits, and the upgrade/unlock purchase actions.

## 8. Analytics (owner-facing)

`/owner/courses/[slug]/analytics`, gated to courses with `affiliate_link_status = 'verified'`:

- **Views, clicks, CTR, unique visitors, a 7-day click chart, top referrers, review stats** — all computed from real logged data (`lib/courseAnalytics.ts`).
- **Section-level conversion ("highest-converting sections")**: built by introducing a first-party `visitor_id` cookie (not cross-site tracking) that correlates an anonymous visitor's clicks into extra listing sections (Hosting Platform, Paid Testimonials, etc. — see §10) with their later "Go to course" click, even when they're not signed in. `components/TrackedSection.tsx` — the **only client component in the entire app** — fires a tracking POST when a visitor clicks into a section; `/api/track/section-click` and `/go/[slug]` both read/write the same `visitor_id` cookie so the two events can be joined later by SQL.
- **Deliberately not fabricated**: conversion rate (CVR) is disclosed in the UI itself as "not tracked" — there's no purchase-confirmation webhook from third-party course platforms, so no real signal exists for actual sales, and I refused to invent a plausible-looking number for it.

## 9. Extra listing content

- Verified/Business owners can add up to 5 "extra sections" per course from a fixed catalog (Hosting Platform, Paid Testimonials, Success Stories, Community Events, Instructor Bio, Refund Policy, FAQs, Awards & Recognition, Alumni Outcomes, Free Preview/Trial), each with optional image and video links. One of each type max.
- Base description is capped at 500 words for free listings, 1000 for Registered Business.
- Images use plain `<img>` (not `next/image`) since section image URLs are arbitrary and can't be pre-registered in `next.config.ts`'s domain allowlist. Videos are rendered as an external "Watch video" link rather than an embedded `<video>` tag, since embedding only works for direct file URLs and silently fails for YouTube/Vimeo links.
- **Discounts** (`compare_at_price`, shown crossed-out next to the real price) were originally settable by any Registered Business owner, then **restricted to Verified Course (affiliate-verified) owners only** — enforced in the SQL `WHERE` clause of `updateCourseDiscount()`, not just hidden in the UI, and removed entirely from the open `/courses/new` submission form.

## 10. Site-wide redesign (most recent work)

This was a large, explicitly requested visual overhaul, done in a few passes:

**Branding**
- Renamed the product from "CourseReviews" to **CourseVerdict** everywhere (`lib/site.ts`, page titles, homepage copy).
- Built a code-based wordmark (`components/Logo.tsx`) — "course" + a green checkmark standing in for the "V" + "erdict" — rendered as text + inline SVG rather than a flattened image. This was a deliberate choice over trying to reproduce the pasted reference images pixel-for-pixel (which I didn't have file-system access to): as markup, it's inherently transparent, needs no separate light/dark exports, and its text color already follows the site's theme automatically. Spacing between the checkmark and "erdict" was tuned twice based on actual DOM measurements (`getBoundingClientRect`), since I couldn't render a screenshot in this environment.
- `app/icon.svg` — a standalone green checkmark favicon on a transparent background, picked up automatically by Next.js's file-based favicon convention.

**Typography**
- Replaced Vercel's Geist font with **Inter**, as the closest freely-licensed match to Claude's own clean interface typography (Anthropic's actual product font isn't redistributable). Also fixed a real, pre-existing bug in the process: `body` had a hardcoded `font-family: Arial, Helvetica, sans-serif` that silently overrode the font variable entirely — the site had never actually been rendering in Geist, despite that font being loaded.

**Dark mode**
- The site already followed the OS/browser's light/dark preference automatically (Tailwind's `dark:` variant is media-query-based here, not a manual toggle) — nothing needed there.
- What did need fixing: dark mode was near-black (`#0a0a0a` page background, `#18181b` cards — Tailwind's default `zinc-900`/`950`). Overrode the `zinc` color scale specifically inside the `prefers-color-scheme: dark` media query in `app/globals.css`, so every existing `dark:bg-zinc-900` / `dark:border-zinc-800` / `dark:text-zinc-400` class site-wide picked up a warmer, lighter charcoal palette (`#262624` page background, `#302f2b` cards) without touching a single component file, and without affecting light mode at all (confirmed via computed-style checks in both modes).

**Header & navigation**
- Rebuilt as a sticky, blurred header with the new logo, a pill-shaped search bar (a proper SVG magnifying-glass icon, not the 🔍 emoji it started as), and a pill "Sign up" CTA.
- "Add a course" moved out of the nav bar entirely into a **floating pill button** (`components/AddCourseFab.tsx`), fixed bottom-right, server-rendered based on session state: signed in (learner *or* owner) → straight to `/courses/new`; signed out → `/signin`.
- That signed-out path exposed a real, pre-existing bug: `callbackUrl` was accepted in the URL but silently ignored by both sign-in and sign-up, always redirecting to a hardcoded page after auth. Fixed end-to-end (`lib/safeRedirect.ts` validates it's a same-origin relative path first, to prevent it being used as an open redirect) across `/signin`, `/signup`, `/owner/signin`, and `/owner/signup`, and verified live: FAB → sign in → sign up as a new Business account → landed directly back on "Add a course".

**Sign-up flow**
- Added a Personal/Business pill toggle (`components/AccountTypeToggle.tsx`) at the top of both sign-up pages, switching between the learner and owner registration forms while preserving `callbackUrl` through every hop.

**Badges**
- Originally a three-tier badge system (Verified Creator / Registered Business / Verified Course) shown as colored pill chips with an Instagram-style circular checkmark icon.
- Simplified per explicit feedback to exactly two: **Registered Business** (grey shield icon) and **Verified Course** (green checkmark, matching the new logo's mark) — "Verified Creator" removed entirely from both the course card and the detail page.
- Removed the pill/background container on both — they're now just an icon plus colored text inline, no fill (confirmed via computed styles: `background-color: transparent`, `padding: 0`).

**Business name / confidentiality**
- Found and corrected a real discrepancy: the owner sign-up form told owners to "use your real business name, not a handle," claiming it would be shown publicly ("owned by [name]") — but that public display was never actually built. In truth, `owners.name` is only ever shown to CourseVerdict admins in internal review queues.
- Rewrote the sign-up copy to say so honestly, and built a new `/owner/profile` page so an owner can set or change that display name — alias or real, their choice — at any time after sign-up, separately from the actual legal business name (still captured privately during business-paperwork verification and never relaxed, since that one has to stay real for the verification to mean anything).
- Along the way, fixed a session-staleness bug this surfaced: the owner's displayed name was cached in the JWT at sign-in and wouldn't reflect a later change until they signed out and back in. `owner-auth.ts`'s `session` callback now re-reads the name from the database on every request instead.

---

## Engineering conventions used throughout

- **Authorization is enforced in the SQL, not just the UI.** Every gated write (claiming a course, editing listing fields, setting a discount, signing a contract) embeds the ownership/status check directly in the query's `WHERE`/`EXISTS` clause, so a bypassed or buggy UI check can't leak a privileged write through.
- **No fabricated data.** Anywhere a metric couldn't be honestly computed from real signals (conversion rate, for instance), the product discloses that gap directly in its own UI rather than showing an invented number.
- **Server Components by default.** `components/TrackedSection.tsx` is the only client component in the app; everything else — including all the badge, header, and form logic — is server-rendered.
- **Migrations are additive and numbered**, never rewriting `schema.sql` directly, so the database's history stays reconstructible.
- Every change in this session was verified in an actual running browser (Turbopack dev server) before being called done — including checking server logs for runtime errors, not just relying on `tsc`/`eslint` passing.
