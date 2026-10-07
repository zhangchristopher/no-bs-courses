import path from "node:path";
import { createHash } from "node:crypto";
import dotenv from "dotenv";
import postgres from "postgres";

// Same reason as scripts/importExcelCourses.ts: lib/db.ts connects at import
// time, before this file's dotenv.config() has loaded .env.local.
dotenv.config({ path: path.join(__dirname, "..", "..", ".env.local"), quiet: true });

export const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

// Drafts are written with "{{site}}" in place of the domain and send.ts
// substitutes the public URL, so a draft made while NEXT_PUBLIC_SITE_URL is
// localhost can't go out with localhost links.
export const SITE_TOKEN = "{{site}}";

// Institutions and large orgs won't join a startup's founding program, and
// freeCodeCamp alone is 78 of the listings. "Unknown" has no one to contact.
const EXCLUDED_PLATFORMS = ["Coursera", "Harvard", "HubSpot Academy", "Khan Academy", "Google/Kaggle", "The Odin Project"];
const EXCLUDED_CREATOR_PATTERNS = ["freeCodeCamp%", "Harvard%", "Unknown"];

// Pipeline states; the list mirrors the CHECK in migrations/021.
export const STATES = [
  "unresearched", "researching", "owner_matched", "contact_found", "no_contact",
  "ready_for_review", "approved_for_outreach", "sent", "send_failed", "replied",
  "wrong_person", "owner_confirmed", "claim_started", "claimed", "business_verified",
  "free_owner", "founding_subscriber", "activated", "not_interested", "unsubscribed",
  "bounced", "do_not_contact", "manual_review",
] as const;
export type State = (typeof STATES)[number];

// Never contacted again, whatever any other step says.
export const NEVER_CONTACT: State[] = [
  "claim_started", "claimed", "business_verified", "free_owner", "founding_subscriber", "activated",
  "wrong_person", "not_interested", "unsubscribed", "bounced", "do_not_contact",
];
// Already emailed or out of the funnel: research and drafting leave these alone.
export const ALREADY_CONTACTED: State[] = ["sent", "send_failed", "replied", "owner_confirmed", ...NEVER_CONTACT];

export type EventType =
  | "sent" | "reply" | "positive_reply" | "link_click"
  | "claim_started" | "claim_completed" | "business_verified" | "free_verified_owner"
  | "founding_subscription" | "first_verified_review" | "five_verified_reviews" | "activated"
  | "wrong_person" | "not_interested" | "unsubscribed" | "bounced" | "complaint";

export type OutreachRow = {
  id: string;
  creator_name: string;
  course_ids: string[];
  status: State;
  contact_email: string | null;
  contact_source_url: string | null;
  contact_form_url: string | null;
  contact_confidence: string | null;
  research_notes: string | null;
  preferred_channel: string | null;
  instagram_handle: string | null;
  instagram_source_url: string | null;
  email_subject: string | null;
  email_body: string | null;
  approved_at: Date | null;
  approved_by: string | null;
  sent_at: Date | null;
};

export type CreatorCourse = { id: string; title: string; slug: string; platform: string; platform_url: string; total_reviews: number };

// Upserts one outreach row per independent creator with an unclaimed,
// published listing. Existing rows keep their status and research; only the
// course list is refreshed.
export async function syncCreators(): Promise<number> {
  const rows = await sql`
    INSERT INTO creator_outreach (creator_name, course_ids)
    SELECT c.provider_name, array_agg(c.id ORDER BY c.title)
    FROM courses c
    WHERE c.verification_status = 'unclaimed'
      AND c.verified_owner_id IS NULL
      AND c.listing_status = 'published'
      AND c.platform <> ALL(${EXCLUDED_PLATFORMS})
      AND NOT (c.provider_name ILIKE ANY(${EXCLUDED_CREATOR_PATTERNS}))
    GROUP BY c.provider_name
    ON CONFLICT (creator_name) DO UPDATE
      SET course_ids = CASE
        WHEN creator_outreach.sent_at IS NOT NULL
          THEN ARRAY(SELECT DISTINCT x FROM unnest(creator_outreach.course_ids || EXCLUDED.course_ids) AS x)
        ELSE EXCLUDED.course_ids
      END,
      updated_at = now()
    RETURNING id
  `;
  return rows.length;
}

export async function coursesFor(row: Pick<OutreachRow, "course_ids">): Promise<CreatorCourse[]> {
  return sql<CreatorCourse[]>`
    SELECT c.id, c.title, c.slug, c.platform, c.platform_url, COALESCE(s.total_reviews, 0)::int AS total_reviews
    FROM courses c LEFT JOIN course_scores s ON s.course_id = c.id
    WHERE c.id = ANY(${row.course_ids}) ORDER BY c.title
  `;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// The suppression list is the last word. Nothing, including a research or
// drafting decision, may route around it; the database also enforces it.
export async function isSuppressed(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const [row] = await sql`SELECT 1 FROM outreach_suppressions WHERE lower(email) = ${normalizeEmail(email)}`;
  return Boolean(row);
}

export async function suppress(email: string, reason: string): Promise<void> {
  await sql`
    INSERT INTO outreach_suppressions (email, reason) VALUES (${normalizeEmail(email)}, ${reason})
    ON CONFLICT (email) DO NOTHING
  `;
}

// One event of each kind per recipient; repeats are ignored.
export async function recordEvent(outreachId: string, type: EventType, detail?: string, at?: Date): Promise<boolean> {
  const rows = await sql`
    INSERT INTO outreach_events (outreach_id, event_type, detail, occurred_at)
    VALUES (${outreachId}, ${type}, ${detail ?? null}, ${at ?? new Date()})
    ON CONFLICT (outreach_id, event_type) DO NOTHING
    RETURNING id
  `;
  return rows.length > 0;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}

export function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

// An id, an exact creator name, or a contact address.
export async function findRow(ref: string): Promise<OutreachRow | undefined> {
  const [row] = await sql<OutreachRow[]>`
    SELECT * FROM creator_outreach
    WHERE id::text = ${ref} OR lower(creator_name) = lower(${ref}) OR lower(contact_email) = lower(${ref})
    LIMIT 1
  `;
  return row;
}
