import sql from "@/lib/db";
import { claimCourse, type ClaimResult } from "@/lib/ownerCourses";

// A claim invitation names one listing. It is never an authorization: every
// step that changes anything re-checks the owner, their verified business and
// the listing's state on the server.

export type ClaimInvitation = {
  id: string;
  course_id: string;
  owner_id: string | null;
  claim_started_at: string | null;
  slug: string;
  title: string;
  provider_name: string;
  platform: string | null;
  verification_status: string;
  listing_status: string;
};

// Codes are url-safe base64 of 16 random bytes (22 chars). Reject anything
// else before it reaches the database.
const CODE_RE = /^[A-Za-z0-9_-]{16,64}$/;

export async function getClaimInvitation(code: string): Promise<ClaimInvitation | null> {
  if (!CODE_RE.test(code)) return null;
  const [row] = await sql<ClaimInvitation[]>`
    SELECT i.id, i.course_id, i.owner_id, i.claim_started_at,
           c.slug, c.title, c.provider_name, c.platform, c.verification_status, c.listing_status
    FROM claim_invitations i
    JOIN courses c ON c.id = i.course_id
    WHERE i.code = ${code} AND i.revoked_at IS NULL AND i.expires_at > now()
    LIMIT 1
  `;
  return row ?? null;
}

export async function recordInvitationOpen(invitationId: string, ownerId: string | null): Promise<void> {
  await sql`
    UPDATE claim_invitations SET
      first_opened_at = COALESCE(first_opened_at, now()),
      last_opened_at = now(),
      open_count = open_count + 1,
      owner_id = COALESCE(owner_id, ${ownerId})
    WHERE id = ${invitationId}
  `;
}

// The listing comes from the invitation, never from the request. claimCourse
// still requires approved business verification, an unclaimed published
// listing and the free-claim limit.
export async function claimInvitedCourse(code: string, ownerId: string): Promise<ClaimResult & { slug?: string; title?: string }> {
  const invitation = await getClaimInvitation(code);
  if (!invitation) return { ok: false, error: "This claim link is no longer valid." };

  const result = await claimCourse(ownerId, invitation.course_id);
  if (result.ok) {
    await sql`
      UPDATE claim_invitations SET owner_id = ${ownerId}, claim_started_at = COALESCE(claim_started_at, now())
      WHERE id = ${invitation.id}
    `;
  }
  return { ...result, slug: invitation.slug, title: invitation.title };
}

// Unfinished invitations for the dashboard: the owner opened the link while
// signed in, and the listing is still unclaimed.
export async function getPendingInvitationsForOwner(ownerId: string) {
  return sql<{ code: string; title: string }[]>`
    SELECT i.code, c.title
    FROM claim_invitations i
    JOIN courses c ON c.id = i.course_id
    WHERE i.owner_id = ${ownerId} AND i.claim_started_at IS NULL
      AND i.revoked_at IS NULL AND i.expires_at > now()
      AND c.verification_status = 'unclaimed' AND c.listing_status = 'published'
    ORDER BY i.last_opened_at DESC
    LIMIT 3
  `;
}
