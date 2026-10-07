// The one place a commercial outreach email's footer is built. The postal
// address has exactly one source: OUTREACH_POSTAL_ADDRESS. Nothing else in the
// repository may contain a copy of it. No imports from ./lib on purpose: this
// file must stay free of database side effects so tests can load it.
import { OFFER } from "./offer";

type Env = Record<string, string | undefined>;

// Multi-line addresses are stored with "\n" in the env value.
export function postalAddress(env: Env = process.env): string {
  return (env.OUTREACH_POSTAL_ADDRESS ?? "").replace(/\\n/g, "\n").trim();
}

// CAN-SPAM needs a valid physical postal address in every commercial email: a
// street line with a number, a city, a two-letter state and a ZIP. Returns the
// problem, or null if it looks valid.
export function postalAddressProblem(address: string): string | null {
  if (!address) return "OUTREACH_POSTAL_ADDRESS is empty";
  if (/REPLACE_ME|\[postal address\]|example\./i.test(address)) return "OUTREACH_POSTAL_ADDRESS is a placeholder";
  const segments = address.split(/\n|,/).map((s) => s.trim());
  if (!segments.some((s) => /^\d+\S*\s+\S/.test(s))) return "no street line with a number found";
  if (!/\b[A-Za-z]{2}\s+\d{5}(-\d{4})?\b/.test(address)) return "needs a state and 5-digit ZIP";
  if (address.replace(/\s/g, "").length < 15) return "too short to be a postal address";
  return null;
}

// Mailbox activation is confirmed by a person, in one place, and gates live
// sending. Previews and drafting are unaffected.
export function mailboxConfirmed(env: Env = process.env): boolean {
  return env.OUTREACH_MAILBOX_CONFIRMED === "true";
}

export function renderFooter(unsubscribeUrl: string, siteUrl: string, env: Env = process.env): string {
  const address = postalAddress(env);
  const problem = postalAddressProblem(address);
  if (problem) throw new Error(`Cannot build a commercial email footer: ${problem}`);
  return [
    "",
    OFFER.signature.name,
    OFFER.signature.title,
    siteUrl,
    "",
    "--",
    "You're getting this because your course is listed on No BS Courses.",
    `Don't want to hear from us again? ${unsubscribeUrl}`,
    address,
  ].join("\n");
}

// The complete plain-text body that is sent: the approved body plus the footer.
export function renderEmailText(body: string, unsubscribeUrl: string, siteUrl: string, env: Env = process.env): string {
  return `${body}\n${renderFooter(unsubscribeUrl, siteUrl, env)}`;
}
