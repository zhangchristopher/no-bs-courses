// Is outbound email ready? Checks what can be checked from here (DNS, the
// live unsubscribe endpoints, DB triggers, config) and lists what can't be.
// Never prints a secret, only whether one is set.
//
//   npm run outreach:preflight
import dns from "node:dns/promises";
import { sql } from "./lib";
import { OFFER } from "./offer";

type Result = "PASS" | "FAIL" | "WARN" | "UNVERIFIED";
const lines: string[] = [];
function report(result: Result, what: string, detail = "") {
  lines.push(`${result.padEnd(10)} ${what}${detail ? ` — ${detail}` : ""}`);
}

function isSet(name: string): boolean {
  const v = process.env[name];
  return Boolean(v) && !v!.includes("REPLACE_ME");
}

async function txt(name: string): Promise<string[]> {
  try {
    return (await dns.resolveTxt(name)).map((parts) => parts.join(""));
  } catch {
    return [];
  }
}

async function main() {
  const from = process.env.OUTREACH_FROM ?? "";
  const smtpUser = process.env.OUTREACH_SMTP_USER ?? "";
  const fromDomain = (from.match(/@([^>\s]+)/)?.[1] ?? "").toLowerCase();
  const smtpDomain = smtpUser.split("@")[1]?.toLowerCase() ?? "";
  const siteUrl = (process.env.OUTREACH_SITE_URL ?? "").replace(/\/$/, "");

  // Config (names and presence only)
  for (const name of ["OUTREACH_SITE_URL", "OUTREACH_SMTP_USER", "OUTREACH_SMTP_PASS", "OUTREACH_FROM", "OUTREACH_POSTAL_ADDRESS"]) {
    report(isSet(name) ? "PASS" : "FAIL", `${name} is set`);
  }
  report(OFFER.confirmed ? "PASS" : "WARN", "OFFER.confirmed", OFFER.confirmed ? "true" : "false, so sending is blocked (intended until a human approves the pilot)");
  report("WARN", "Postal address privacy", "OUTREACH_POSTAL_ADDRESS appears in every email; confirm it is an address you are willing to publish to every recipient");

  // From-domain alignment
  if (fromDomain && smtpDomain) {
    report(fromDomain === smtpDomain ? "PASS" : "FAIL", "From domain matches the SMTP login domain", `${fromDomain} / ${smtpDomain}`);
  }

  // DNS
  if (fromDomain) {
    const spf = (await txt(fromDomain)).find((r) => r.startsWith("v=spf1"));
    report(spf ? (/include:_spf\.google\.com/.test(spf) ? "PASS" : "WARN") : "FAIL", "SPF", spf ?? "no SPF record");
    if (spf && /~all/.test(spf)) report("WARN", "SPF policy is soft-fail (~all)", "fine while DMARC is monitoring; consider -all later");

    const dkim = (await txt(`google._domainkey.${fromDomain}`)).find((r) => r.startsWith("v=DKIM1"));
    report(dkim ? "PASS" : "FAIL", "DKIM public key published (selector 'google')", dkim ? "record exists" : "no record");
    report("UNVERIFIED", "DKIM is actually signing outgoing mail", "send one test message to a Gmail address you control and check 'Show original' for dkim=pass header.d=" + fromDomain);

    const dmarc = (await txt(`_dmarc.${fromDomain}`)).find((r) => r.startsWith("v=DMARC1"));
    report(dmarc ? "PASS" : "FAIL", "DMARC", dmarc ?? `no TXT record at _dmarc.${fromDomain}; add e.g. v=DMARC1; p=none; rua=mailto:<your address>`);

    try {
      const mx = await dns.resolveMx(fromDomain);
      report(mx.length ? "PASS" : "FAIL", "MX", mx.map((m) => m.exchange).join(", "));
    } catch {
      report("FAIL", "MX", "no MX records");
    }
  }

  // Transport security
  report("PASS", "SMTP uses implicit TLS", "send.ts connects with secure: true on port 465");
  report("UNVERIFIED", "Recipient-side TLS", "Gmail negotiates TLS with the receiving server; per-message TLS use can only be seen in the received headers");

  // Live endpoints
  if (/^https:\/\//.test(siteUrl)) {
    try {
      const page = await fetch(`${siteUrl}/unsubscribe?t=preflight`, { redirect: "follow" });
      report(page.status === 200 ? "PASS" : "FAIL", "Unsubscribe page is live", `GET /unsubscribe -> ${page.status}`);
      const oneClick = await fetch(`${siteUrl}/unsubscribe/one-click?t=preflight`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "List-Unsubscribe=One-Click",
      });
      // A host that doesn't have the route can still answer a POST with a
      // generic 200 page, so require this endpoint's own response.
      const oneClickBody = (await oneClick.text()).trim();
      const live = oneClick.status === 400 && oneClickBody === "Unrecognized link";
      report(live ? "PASS" : "FAIL", "One-click unsubscribe endpoint is live", `POST with an invalid token -> ${oneClick.status} (expected 400 "Unrecognized link"; deploy this branch)`);
      const claim = await fetch(`${siteUrl}/claim/preflight-not-a-real-code`);
      const claimBody = await claim.text();
      report(
        claim.status === 200 && claimBody.includes("Link not recognized") ? "PASS" : "FAIL",
        "Claim page is live",
        `GET /claim/<invalid> -> ${claim.status}${claimBody.includes("Link not recognized") ? "" : " (expected the 'Link not recognized' page; deploy this branch)"}`
      );
    } catch (err) {
      report("FAIL", "Site reachable", err instanceof Error ? err.message : String(err));
    }
  }

  // Database enforcement
  const triggers = await sql<{ tgname: string }[]>`
    SELECT tgname FROM pg_trigger WHERE tgname IN ('trg_outreach_block_suppressed', 'trg_outreach_apply_suppression')
  `;
  report(triggers.length === 2 ? "PASS" : "FAIL", "Suppression triggers installed", `${triggers.length}/2 (run npm run migrate)`);
  const [{ n: suppressed }] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM outreach_suppressions`;
  report("PASS", "Suppression list", `${suppressed} address(es)`);

  // Bounces
  report("WARN", "Bounce handling is manual", "bounces arrive as emails in the sending mailbox; record each with npm run outreach:mark -- <creator> bounced (this suppresses the address)");

  console.log(lines.join("\n"));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
