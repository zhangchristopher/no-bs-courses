---
name: creator-outreach
description: Research public business contacts for course creators with unclaimed No BS Courses listings, and prepare their first email, which invites them to claim their listing for free. Use when asked to run, continue, or do a batch of creator outreach, contact research, or outreach drafts.
---

# Creator outreach

Invite the independent creators behind unclaimed listings to **claim their existing listing for free**. This skill covers the two steps that need judgment, **research** and **drafting**, done in-session with WebSearch/WebFetch. It never sends email, never approves a recipient, never messages Instagram, and never touches `OFFER.confirmed`. A person runs `outreach:approve` and `outreach:send`.

## The product rules (do not drift from these)

- Claiming an existing listing is **free**. Business verification is **free** and earns the Verified Business badge.
- The paid subscription is only a **management layer** (editing the listing, claiming more courses, owner tools). It never buys verification, a badge, a rating, a ranking, or review treatment. A free verified owner owns the listing and receives genuine reviews.
- Email 1 exists to get the owner to claim for free. The paid plan is one short, secondary paragraph.
- Pricing comes only from `lib/pricing.ts` (via `scripts/outreach/offer.ts`). Never describe the founding price as "$12 forever": $12 is the first annual term only. No countdowns or deadlines; the founding offer ends when `FOUNDING_OFFER_OPEN` is switched off.

## Pipeline

State lives in `creator_outreach.status`:

`unresearched` → `contact_found` | `no_contact` | `manual_review` → `ready_for_review` → (human) `approved_for_outreach` → `sent` → `replied` / `owner_confirmed` → `claim_started` → `claimed` → `free_owner` | `founding_subscriber` → `activated`

Terminal or excluded: `wrong_person`, `not_interested`, `unsubscribed`, `bounced`, `do_not_contact`, `send_failed`. Never contact a record in any of these, or one that is already claimed.

Commands (all in `scripts/outreach/`):

- `npm run -s outreach:next -- --stage research --limit N` / `--stage draft` prints work as JSON
- `npm run -s outreach:save -- <file.json>` validates and saves (prints why an entry was rejected)
- `npm run -s outreach:status`, `outreach:metrics`, `outreach:preflight` report; read-only except for syncing milestones
- Human-only: `outreach:approve`, `outreach:send`, `outreach:mark`

Work in batches of 10-20. Write results to a JSON file in the scratchpad, save it, then report the batch.

## Research

Goal: one publicly listed business email per creator, plus the URL of the page it's published on, plus **what ties it to this specific course**.

Rules:
- Only use an address the creator (or their company) publishes for contact: their own site's contact/about page, a "business inquiries" address in a public bio or link-in-bio page, a podcast/newsletter site they run, a press or partnerships page.
- Never construct or guess an address. Never use people-search or lead-gen sites (RocketReach, Apollo, ZoomInfo, Hunter, ContactOut, SignalHire, Lusha, Snov); pass them as `blocked_domains`.
- Don't scrape skool.com or whop.com pages; their ToS forbid it (see commit c195e45). Block them too.
- **Tie the address to this creator and this course.** The strongest tie is the creator's own page linking the exact community URL in the batch. A matching brand name is weaker. A search-engine summary is not a source: open the page. If you can't tie it firmly, report `low` or no email. Common names are ambiguous.
- Prefer a business/partnerships address over a personal one, and a named person over a generic support desk.
- If there's no email but their own site has a contact form, record `contact_form_url`.
- Collect nothing else about the person: no phone numbers, home addresses, or personal social accounts. The one exception is the business Instagram under Channel below.
- **Suppressed addresses are final.** Never propose, retry, or re-research an address on the suppression list; `save` refuses it and the database blocks it. No judgment call overrides that.

Confidence: `high` means the creator's own page lists the address and links or names this exact course/community. `medium` means it's clearly their business but the tie to this course rests on the name only. `low` means plausible but not firmly tied; `save` sends it to `manual_review` and it is not queued. `none` means nothing found. In `notes`, say in one or two sentences who this is and exactly what ties the contact to the course.

```json
{ "id": "<row id>", "research": { "email": "", "source_url": "", "contact_form_url": "", "confidence": "none", "notes": "" } }
```

## Channel

Every researched creator also gets a `channel`: `email` (a high or medium confidence email), `instagram` (no usable email, and the course runs under a brand account that promotes it publicly), or `other` (contact form only, LinkedIn only, or a poor fit). Record `instagram_handle` only for the account the creator uses for this business, with the page showing it as `instagram_source_url`; a search result alone isn't enough. Instagram messages are sent by hand by the founder; never send one.

```json
{ "id": "<row id>", "channel": { "preferred": "instagram", "instagram_handle": "", "instagram_source_url": "" } }
```

## Drafting

Email 1 comes from the fixed template in `scripts/outreach/template.ts`, run with `npm run -s outreach:draft -- "<creator>" [--greeting "<name>"]`. It mints a **course-specific claim link** (`{{site}}/claim/<code>`) for that creator and that listing, renders the email, validates it, and saves it as `ready_for_review`. Don't improvise a different pitch, and never point a first email at the generic sign-up page. Plain text, well under 170 words, no hype, flattery, exclamation marks or invented urgency, and no invented personalization.

- The email is about claiming. It says the **first** course listing is free to claim, business verification is free, and payment never affects reviews, scores, verification, or ranking. Never say "claim all your listings".
- The paid plan gets one sentence, generated from `lib/pricing.ts`: the Founding Owner plan. Detailed pricing lives on the checkout and pricing pages.
- The free status is called **Verified Business**; the paid plan is **Founding Owner**. Never use "Registered Business" and never suggest paying makes anyone more verified, trusted or recommended. No endorsement of the course, no claim that affiliate status proves quality or profit.
- Greeting: a first name only if the creator field is clearly one person, otherwise "Hi there".
- Creators with more than one unclaimed listing are refused by `outreach:draft` (only the first claim is free); draft those by hand.
- The signature, one-click unsubscribe, unsubscribe line and postal address are added automatically at send time.

A claim link only names a listing. It never skips business verification or admin review. `save`/`draft` reject any draft that breaks these rules. A saved draft is `ready_for_review`; redrafting clears any earlier approval. Show the user each batch together with, per creator: the listing, the contact source, what ties the person to the course, the match confidence, the claim URL, and any ambiguity.
