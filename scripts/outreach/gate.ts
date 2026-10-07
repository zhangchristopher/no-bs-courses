// Final per-recipient compliance gate. Read-only: it changes nothing and sends
// nothing. Run before approving anyone.
//
//   npm run outreach:gate -- "Adam Schaeuble" "Angel Hernandez" ...
import fs from "node:fs";
import path from "node:path";
import { sql, findRow, isSuppressed, coursesFor } from "./lib";
import { lintDraft } from "./drafts";
import { renderEmailText, postalAddress, postalAddressProblem, mailboxConfirmed } from "./footer";

const SEND_SRC = fs.readFileSync(path.join(__dirname, "send.ts"), "utf8");
const FOOTER_SRC = fs.readFileSync(path.join(__dirname, "footer.ts"), "utf8");
const site = (process.env.OUTREACH_SITE_URL ?? "").replace(/\/$/, "");

async function main() {
  const names = process.argv.slice(2);
  if (names.length === 0) throw new Error('usage: outreach:gate -- "<creator>" [...]');
  let blocked = 0;

  // Properties of the send pipeline itself (the same for every recipient).
  const pipeline: [boolean, string][] = [
    [/Don't want to hear from us again\? \$\{unsubscribeUrl\}/.test(FOOTER_SRC) && /renderEmailText\(/.test(SEND_SRC), "visible unsubscribe URL is appended to every sent email"],
    [/"List-Unsubscribe": `<\$\{oneClickUrl\}>/.test(SEND_SRC), "List-Unsubscribe header is set"],
    [/"List-Unsubscribe-Post": "List-Unsubscribe=One-Click"/.test(SEND_SRC), "one-click List-Unsubscribe-Post header is set"],
    [/blockedState\(row\)/.test(SEND_SRC) && /isSuppressed\(row\.contact_email\)/.test(SEND_SRC), "suppression is rechecked immediately before each send"],
    [/status = 'approved_for_outreach'/.test(SEND_SRC), "only approved rows are sent"],
    [postalAddressProblem(postalAddress()) === null, "postal address configured and valid (single source: OUTREACH_POSTAL_ADDRESS)"],
  ];
  console.log("Pipeline");
  for (const [ok, what] of pipeline) { console.log(`  ${ok ? "PASS" : "FAIL"}  ${what}`); if (!ok) blocked++; }

  for (const name of names) {
    const row = await findRow(name);
    console.log(`\n${name}`);
    if (!row) { console.log("  FAIL  not found"); blocked++; continue; }
    const problems: string[] = [];
    const ok = (cond: boolean, what: string) => { console.log(`  ${cond ? "PASS" : "FAIL"}  ${what}`); if (!cond) problems.push(what); };

    ok(row.status === "ready_for_review" || row.status === "approved_for_outreach", `status is ${row.status} (not manual_review, sent or closed)`);
    ok(Boolean(row.contact_email && row.contact_source_url), "contact address has a recorded published source (not guessed)");
    ok(["high", "medium"].includes(row.contact_confidence ?? ""), `match confidence ${row.contact_confidence}`);
    ok(!(await isSuppressed(row.contact_email)), "not suppressed");
    const [ev] = await sql<{ n: number }[]>`
      SELECT count(*)::int AS n FROM outreach_events WHERE outreach_id = ${row.id} AND event_type IN ('bounced', 'unsubscribed', 'wrong_person', 'complaint')`;
    ok(ev.n === 0, "no bounce, unsubscribe, wrong-person or complaint on record");

    const courses = await coursesFor(row);
    ok(courses.length === 1, `exactly one listing (${courses.length}); only the first claim is free`);
    const [state] = await sql<{ verification_status: string; listing_status: string; verified_owner_id: string | null }[]>`
      SELECT verification_status, listing_status, verified_owner_id FROM courses WHERE id = ${row.course_ids[0]}`;
    ok(state?.listing_status === "published", "listing still exists and is published");
    ok(state?.verification_status === "unclaimed" && !state?.verified_owner_id, `listing is unclaimed (${state?.verification_status})`);

    const code = row.email_body?.match(/\/claim\/([A-Za-z0-9_-]{16,})/)?.[1];
    const [inv] = code
      ? await sql<{ slug: string; ok: boolean }[]>`
          SELECT c.slug, (i.revoked_at IS NULL AND i.expires_at > now() AND i.outreach_id = ${row.id} AND i.course_id = ${row.course_ids[0]}) AS ok
          FROM claim_invitations i JOIN courses c ON c.id = i.course_id WHERE i.code = ${code}`
      : [];
    ok(Boolean(inv?.ok), `claim link maps to this creator's own listing (${inv?.slug ?? "none"})`);
    if (site && code) {
      const res = await fetch(`${site}/claim/${code}`).catch(() => null);
      const html = res ? await res.text() : "";
      ok(Boolean(res && res.status === 200 && courses[0] && html.includes(courses[0].title.replace(/&/g, "&amp;")) ), `claim URL resolves on production to the right course (HTTP ${res?.status})`);
    }

    const lint = lintDraft(row.email_subject ?? "", row.email_body ?? "");
    ok(lint === null, lint ? `draft rules: ${lint}` : "draft passes every content rule (free first claim, integrity line, prices from lib/pricing.ts, no urgency, no endorsement)");
    ok(!/\b(i saw|i noticed|loved your|your recent)\b/i.test(row.email_body ?? ""), "no unsupported personalization");
    // The exact text that would be sent, including the footer.
    let rendered = "";
    try {
      rendered = renderEmailText((row.email_body ?? "").replaceAll("{{site}}", site), `${site}/unsubscribe?t=preview`, site);
    } catch {
      /* reported below */
    }
    const addr = postalAddress();
    ok(Boolean(rendered) && Boolean(addr) && rendered.includes(addr), "rendered email contains the postal-address footer");
    ok(rendered.includes("/unsubscribe?t="), "rendered email contains the visible unsubscribe link");
    if (problems.length) blocked++;
  }
  console.log(`\nCompliance: ${blocked === 0 ? "PASSED" : `FAILED (${blocked} item(s)); do not approve or send`}`);
  // Separate from compliance: a human-confirmed condition for any live send.
  console.log(
    mailboxConfirmed()
      ? "Live send: mailbox confirmed"
      : "Live send: BLOCKED. OUTREACH_MAILBOX_CONFIRMED is not true (public mailbox not yet confirmed active)"
  );
  if (blocked) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
