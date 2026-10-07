// Tests the REAL production site, not a generic 200: it seeds a throwaway
// recipient, opts it out through the live one-click endpoint, and checks that
// the application actually suppressed it. Everything it creates is deleted.
//
//   npm run outreach:verify-prod
//
// Uses OUTREACH_SITE_URL (the public site) and the database in .env.local, so
// it only proves anything if production uses that same database.
import { sql, hashToken } from "./lib";

class Rollback extends Error {}
const results: string[] = [];
let failures = 0;
function check(ok: boolean, what: string, detail = "") {
  if (!ok) failures++;
  results.push(`${ok ? "PASS" : "FAIL"}  ${what}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  const site = (process.env.OUTREACH_SITE_URL ?? "").replace(/\/$/, "");
  if (!/^https:\/\//.test(site)) throw new Error("OUTREACH_SITE_URL must be the public https:// site");

  const token = `verify-prod-${Date.now()}`;
  const email = `verify-prod-${Date.now()}@example.invalid`;
  const code = `verifyprod${Date.now()}abcdef`;
  const slug = `zz-verify-prod-${Date.now()}`;

  const [course] = await sql`
    INSERT INTO courses (slug, title, provider_name, platform_url, platform, category, listing_status)
    VALUES (${slug}, 'ZZ Production Verification Course', 'Test', 'https://example.invalid/x', 'Skool', 'Business', 'published')
    RETURNING id`;
  await sql`INSERT INTO course_owner_fields (course_id) VALUES (${course.id}) ON CONFLICT DO NOTHING`;
  await sql`INSERT INTO claim_invitations (code, course_id) VALUES (${code}, ${course.id})`;
  const [row] = await sql`
    INSERT INTO creator_outreach (creator_name, course_ids, status, contact_email, unsubscribe_token_hash, sent_at)
    VALUES (${`__verify_prod_${Date.now()}`}, ARRAY[${course.id}]::uuid[], 'sent', ${email}, ${hashToken(token)}, now())
    RETURNING id`;

  try {
    // Pages exist and carry the new copy
    const unsub = await fetch(`${site}/unsubscribe?t=${token}`);
    const unsubHtml = await unsub.text();
    check(unsub.status === 200 && /Unsubscribe/.test(unsubHtml), "Unsubscribe page exists", `GET -> ${unsub.status}`);

    const claim = await fetch(`${site}/claim/${code}`);
    const claimHtml = await claim.text();
    check(claim.status === 200 && claimHtml.includes("ZZ Production Verification Course"), "Course-specific claim page shows the invited course", `GET -> ${claim.status}`);
    check(/first course listing/i.test(claimHtml), "Claim page says the FIRST course listing is free");

    const terms = await (await fetch(`${site}/terms`)).text();
    check(/Verified Business/.test(terms) && !/Registered Business/.test(terms), "Terms use Verified Business / Founding Owner naming");

    // A GET must never opt anyone out (mail scanners open links)
    const get = await fetch(`${site}/unsubscribe/one-click?t=${token}`);
    const [afterGet] = await sql`SELECT status FROM creator_outreach WHERE id = ${row.id}`;
    check(get.status === 405 && afterGet.status === "sent", "GET on the one-click URL does nothing", `-> ${get.status}, status still ${afterGet.status}`);

    // Invalid token: the application answers, not a generic page
    const bad = await fetch(`${site}/unsubscribe/one-click?t=not-a-real-token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "List-Unsubscribe=One-Click" });
    check(bad.status === 400 && (await bad.text()).trim() === "Unrecognized link", "One-click with an invalid token is rejected by the app", `-> ${bad.status}`);

    // Valid token: the real action must happen
    const ok = await fetch(`${site}/unsubscribe/one-click?t=${token}`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "List-Unsubscribe=One-Click" });
    const okBody = (await ok.text()).trim().slice(0, 40);
    const [after] = await sql`SELECT status FROM creator_outreach WHERE id = ${row.id}`;
    const [sup] = await sql`SELECT reason FROM outreach_suppressions WHERE email = ${email}`;
    const [ev] = await sql`SELECT 1 FROM outreach_events WHERE outreach_id = ${row.id} AND event_type = 'unsubscribed'`;
    check(ok.status === 200 && okBody === "Unsubscribed", "One-click POST returns the expected response", `-> ${ok.status} "${okBody}"`);
    check(Boolean(sup), "The address is now in the global suppression list", sup ? `reason ${sup.reason}` : "missing");
    check(after.status === "unsubscribed", "The contact moved to unsubscribed", `status ${after.status}`);
    check(Boolean(ev), "An unsubscribed event was recorded");

    // And it can no longer be approved or sent (database-level)
    try {
      await sql.begin(async (tx) => {
        try {
          await tx.savepoint(async (sp) => { await sp`UPDATE creator_outreach SET status = 'approved_for_outreach' WHERE id = ${row.id}`; });
          check(false, "A suppressed address cannot be approved for outreach", "it was allowed");
        } catch (e) {
          check(/suppression list/.test((e as Error).message), "A suppressed address cannot be approved for outreach");
        }
        throw new Rollback();
      });
    } catch (e) {
      if (!(e instanceof Rollback)) throw e;
    }
  } finally {
    await sql`DELETE FROM creator_outreach WHERE id = ${row.id}`;
    await sql`DELETE FROM outreach_suppressions WHERE email = ${email}`;
    await sql`DELETE FROM claim_invitations WHERE code = ${code}`;
    await sql`DELETE FROM course_owner_fields WHERE course_id = ${course.id}`;
    await sql`DELETE FROM courses WHERE id = ${course.id}`;
  }

  console.log(`Site: ${site}\n` + results.join("\n") + `\n\n${failures === 0 ? "All production checks passed." : `${failures} check(s) FAILED.`} (test data removed)`);
  if (failures) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
