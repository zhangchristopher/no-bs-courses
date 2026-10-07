import { createHash } from "node:crypto";
import sql from "@/lib/db";

// The one place an outreach recipient opts out, used by the visible
// unsubscribe button and by the RFC 8058 one-click endpoint. Suppression is
// by address, not by outreach row, so it holds if the same address turns up
// under another creator name. A database trigger then moves every outreach
// row for that address out of the sendable states.
export async function unsubscribeByToken(token: string): Promise<boolean> {
  if (!token || token.length > 200) return false;
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const [row] = await sql<{ id: string; contact_email: string | null }[]>`
    SELECT id, contact_email FROM creator_outreach WHERE unsubscribe_token_hash = ${tokenHash}
  `;
  if (!row?.contact_email) return false;

  await sql`
    INSERT INTO outreach_suppressions (email, reason)
    VALUES (${row.contact_email.toLowerCase()}, 'unsubscribe')
    ON CONFLICT (email) DO NOTHING
  `;
  await sql`
    INSERT INTO outreach_events (outreach_id, event_type) VALUES (${row.id}, 'unsubscribed')
    ON CONFLICT (outreach_id, event_type) DO NOTHING
  `;
  return true;
}
