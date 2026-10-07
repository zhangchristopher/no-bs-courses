// Step 3: send approved emails.
//
//   npm run outreach:send                 # dry run: prints what would go out
//   npm run outreach:send -- --send       # actually sends
//   npm run outreach:send -- --send --max 5
//
// Only rows a human approved one by one (status approved_for_outreach, via
// npm run outreach:approve) are ever sent. Sends from your own mailbox over
// SMTP, not Resend: Resend's acceptable-use policy forbids cold email, and a
// complaint there would put the password-reset and verification emails at
// risk.
import { randomBytes } from "node:crypto";
import nodemailer from "nodemailer";
import { sql, SITE_TOKEN, hashToken, argValue, hasFlag, isSuppressed, recordEvent, type OutreachRow } from "./lib";
import { OFFER } from "./offer";
import { renderEmailText, postalAddress, postalAddressProblem, mailboxConfirmed } from "./footer";

// The public site, not NEXT_PUBLIC_SITE_URL, which is localhost in dev.
const SITE_URL = (process.env.OUTREACH_SITE_URL ?? "").replace(/\/$/, "");

function withSite(text: string): string {
  return text.replaceAll(SITE_TOKEN, SITE_URL || SITE_TOKEN);
}

// Volume only goes up when the pilot numbers say it should (npm run
// outreach:metrics): raise OUTREACH_DAILY_CAP deliberately. Spacing keeps it
// looking like a person, and well inside Gmail's own limits.
const DAILY_CAP = Number(process.env.OUTREACH_DAILY_CAP ?? 10);
const MIN_GAP_MS = 45_000;
const MAX_GAP_MS = 120_000;

// The footer (signature, unsubscribe line, postal address) is built in
// footer.ts, the single source for the postal address.

function isSet(name: string): boolean {
  const value = process.env[name];
  return Boolean(value) && !value!.includes("REPLACE_ME");
}

function requireSendConfig(): string[] {
  const problems: string[] = [];
  if (!OFFER.confirmed) problems.push("OFFER.confirmed is false in scripts/outreach/offer.ts");
  // CAN-SPAM requires a valid physical postal address in every commercial email.
  const addressProblem = postalAddressProblem(postalAddress());
  if (addressProblem) problems.push(addressProblem);
  // The public mailbox must be confirmed active by a person before any live send.
  if (!mailboxConfirmed()) problems.push("OUTREACH_MAILBOX_CONFIRMED is not true: the public mailbox has not been confirmed active");
  for (const name of ["OUTREACH_SMTP_USER", "OUTREACH_SMTP_PASS", "OUTREACH_FROM", "OUTREACH_SITE_URL"]) {
    if (!isSet(name)) problems.push(`${name} is not set`);
  }
  if (!/^https:\/\//.test(SITE_URL) || SITE_URL.includes("localhost")) {
    problems.push("OUTREACH_SITE_URL must be the public https:// address of the site");
  }
  return problems;
}

// Last look before sending. Returns the state the row should move to if it
// must not be sent, or null if it is clear.
async function blockedState(row: OutreachRow): Promise<string | null> {
  if (await isSuppressed(row.contact_email)) return "do_not_contact";
  // The claim link in the draft must still be a live invitation for one of
  // this creator's own listings.
  const code = row.email_body?.match(/\/claim\/([A-Za-z0-9_-]{16,})/)?.[1];
  const [invitation] = code
    ? await sql`
        SELECT 1 FROM claim_invitations
        WHERE code = ${code} AND outreach_id = ${row.id} AND revoked_at IS NULL AND expires_at > now()
      `
    : [];
  if (!invitation) return "manual_review";
  const [alreadySent] = await sql`
    SELECT 1 FROM creator_outreach
    WHERE lower(contact_email) = lower(${row.contact_email}) AND id <> ${row.id} AND sent_at IS NOT NULL
  `;
  if (alreadySent) return "do_not_contact";
  // Someone may have claimed the listing on their own since the draft.
  const [claim] = await sql<{ verification_status: string }[]>`
    SELECT verification_status FROM courses
    WHERE id = ANY(${row.course_ids}) AND verification_status <> 'unclaimed'
    ORDER BY verification_status DESC LIMIT 1
  `;
  if (claim) return claim.verification_status === "verified" ? "claimed" : "claim_started";
  return null;
}

async function main() {
  const send = hasFlag("--send");
  const includeLow = hasFlag("--include-low");
  const max = Number(argValue("--max") ?? DAILY_CAP);

  if (send) {
    const problems = requireSendConfig();
    if (problems.length > 0) {
      console.error("Not sending:\n" + problems.map((p) => `- ${p}`).join("\n"));
      process.exitCode = 1;
      return;
    }
  }

  const [{ count: sentToday }] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count FROM creator_outreach WHERE sent_at > now() - interval '24 hours'
  `;
  const budget = Math.max(0, Math.min(max, DAILY_CAP - sentToday));
  if (budget === 0) {
    console.log(`Daily cap reached (${sentToday}/${DAILY_CAP} in the last 24h).`);
    return;
  }

  const confidences = includeLow ? ["high", "medium", "low"] : ["high", "medium"];
  const rows = await sql<OutreachRow[]>`
    SELECT * FROM creator_outreach
    WHERE status = 'approved_for_outreach' AND approved_at IS NOT NULL
      AND contact_email IS NOT NULL AND contact_confidence = ANY(${confidences})
    ORDER BY approved_at LIMIT ${budget}
  `;
  if (rows.length === 0) {
    console.log("Nothing approved and ready to send.");
    return;
  }

  const transport = send
    ? nodemailer.createTransport({
        host: process.env.OUTREACH_SMTP_HOST ?? "smtp.gmail.com",
        port: Number(process.env.OUTREACH_SMTP_PORT ?? 465),
        secure: true,
        auth: { user: process.env.OUTREACH_SMTP_USER, pass: process.env.OUTREACH_SMTP_PASS },
      })
    : null;
  const from = process.env.OUTREACH_FROM ?? process.env.OUTREACH_SMTP_USER ?? "";

  for (const [i, row] of rows.entries()) {
    const blocked = await blockedState(row);
    if (blocked) {
      await sql`UPDATE creator_outreach SET status = ${blocked}, approved_at = NULL, approved_by = NULL, updated_at = now() WHERE id = ${row.id}`;
      console.log(`${row.creator_name}: ${blocked}, not sending`);
      continue;
    }

    if (!transport) {
      console.log(
        `\n=== [dry run] To: ${row.contact_email} (${row.creator_name}, ${row.contact_confidence}; found at ${row.contact_source_url})` +
          `\nSubject: ${row.email_subject}\n\n${renderEmailText(withSite(row.email_body!), `${SITE_URL || SITE_TOKEN}/unsubscribe?t=...`, SITE_URL)}\n`
      );
      continue;
    }

    // Claim the row before sending so two overlapping runs can't both send it.
    const token = randomBytes(32).toString("base64url");
    const [claimed] = await sql`
      UPDATE creator_outreach SET status = 'sent', sent_at = now(), unsubscribe_token_hash = ${hashToken(token)}, updated_at = now()
      WHERE id = ${row.id} AND status = 'approved_for_outreach'
      RETURNING id
    `;
    if (!claimed) continue;

    const unsubscribeUrl = `${SITE_URL}/unsubscribe?t=${token}`;
    const oneClickUrl = `${SITE_URL}/unsubscribe/one-click?t=${token}`;
    try {
      await transport.sendMail({
        from,
        to: row.contact_email!,
        subject: row.email_subject!,
        text: renderEmailText(withSite(row.email_body!), unsubscribeUrl, SITE_URL),
        headers: {
          // RFC 8058 one-click: the https URL takes a POST with no page.
          "List-Unsubscribe": `<${oneClickUrl}>, <mailto:${process.env.OUTREACH_SMTP_USER}?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      await recordEvent(row.id, "sent");
      console.log(`${row.creator_name}: sent to ${row.contact_email}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await sql`
        UPDATE creator_outreach SET status = 'send_failed', sent_at = NULL, send_error = ${message}, updated_at = now()
        WHERE id = ${row.id}
      `;
      console.error(`${row.creator_name}: send failed — ${message}`);
    }

    if (i < rows.length - 1) {
      await new Promise((r) => setTimeout(r, MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS)));
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
