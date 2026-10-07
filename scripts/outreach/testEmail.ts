// Sends ONE internal authentication test through the same SMTP transport and
// headers the real outreach uses, so you can open it in Gmail and check
// "Show original" for SPF, DKIM and DMARC.
//
//   npm run outreach:test-email -- you@gmail.com
//
// Refuses to send to the sending mailbox itself or to any address that is a
// creator contact or on the suppression list: this can never reach a prospect.
import nodemailer from "nodemailer";
import { sql } from "./lib";
import { renderEmailText } from "./footer";

async function main() {
  const to = (process.argv[2] ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("usage: outreach:test-email -- <your other mailbox>");

  const user = process.env.OUTREACH_SMTP_USER ?? "";
  if (!user || !process.env.OUTREACH_SMTP_PASS) throw new Error("OUTREACH_SMTP_USER / OUTREACH_SMTP_PASS are not set");
  if (to === user.toLowerCase()) throw new Error("the recipient must be a different mailbox from the sender");

  const [prospect] = await sql`SELECT 1 FROM creator_outreach WHERE lower(contact_email) = ${to}`;
  const [suppressed] = await sql`SELECT 1 FROM outreach_suppressions WHERE lower(email) = ${to}`;
  if (prospect || suppressed) throw new Error("that address belongs to a creator contact or the suppression list; refusing");

  const site = (process.env.OUTREACH_SITE_URL ?? "").replace(/\/$/, "");
  // Same transport settings as scripts/outreach/send.ts
  const transport = nodemailer.createTransport({
    host: process.env.OUTREACH_SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.OUTREACH_SMTP_PORT ?? 465),
    secure: true,
    auth: { user, pass: process.env.OUTREACH_SMTP_PASS },
  });
  const stamp = new Date().toISOString();
  const info = await transport.sendMail({
    from: process.env.OUTREACH_FROM,
    to,
    subject: `INTERNAL AUTH TEST ${stamp}`,
    // Same footer as real outreach, so the postal address can be checked here.
    text: renderEmailText(
      "Internal authentication test from the No BS Courses outreach setup.\nNot outreach. No prospect received this.",
      `${site}/unsubscribe?t=internal-test`,
      site
    ),
    headers: {
      "List-Unsubscribe": `<${site}/unsubscribe/one-click?t=internal-test>, <mailto:${user}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  console.log(`sent to ${to}: accepted=${info.accepted.length} rejected=${info.rejected.length}\nSubject: INTERNAL AUTH TEST ${stamp}`);
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
