// Every outbound commercial outreach email must carry a non-empty, valid
// postal address, a visible unsubscribe link and the sender signature, and the
// address must come only from OUTREACH_POSTAL_ADDRESS.
//
//   npm run outreach:test
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { renderEmailText, renderFooter, postalAddress, postalAddressProblem, mailboxConfirmed } from "./footer";

// A made-up address: this file must never contain a real one.
const SAMPLE = "Example Co\\n1 Main St\\nSpringfield, IL 62701\\nUnited States";
const env = (extra: Record<string, string | undefined> = {}) => ({ OUTREACH_POSTAL_ADDRESS: SAMPLE, ...extra });
const BODY = "Hi there,\n\nClaim it here: https://example.test/claim/abc";

test("a valid multi-line address passes validation", () => {
  assert.equal(postalAddressProblem(postalAddress(env())), null);
});

test("a one-line comma address passes validation", () => {
  assert.equal(postalAddressProblem("Example Co, 1 Main St, Unit 5, Springfield, IL 62701, United States"), null);
});

test("empty, placeholder, and incomplete addresses are rejected", () => {
  assert.ok(postalAddressProblem(""));
  assert.ok(postalAddressProblem("REPLACE_ME"));
  assert.ok(postalAddressProblem("[postal address]"));
  assert.ok(postalAddressProblem("Springfield, IL"), "no street or ZIP");
  assert.ok(postalAddressProblem("Example Co, Springfield, IL 62701"), "no street number");
});

test("the rendered email contains the address, unsubscribe link and signature", () => {
  const text = renderEmailText(BODY, "https://example.test/unsubscribe?t=tok", "https://example.test", env());
  assert.ok(text.includes(postalAddress(env())), "postal address present");
  assert.ok(text.includes("https://example.test/unsubscribe?t=tok"), "visible unsubscribe link present");
  assert.ok(text.includes("Founder, No BS Courses"), "signature present");
  assert.ok(text.startsWith(BODY), "the approved body is unchanged");
});

test("building a footer without a valid address throws instead of sending without one", () => {
  for (const bad of [undefined, "", "REPLACE_ME", "no address here"]) {
    assert.throws(() => renderFooter("https://example.test/u", "https://example.test", env({ OUTREACH_POSTAL_ADDRESS: bad })), /footer/);
  }
});

test("live sending requires the mailbox to be confirmed", () => {
  assert.equal(mailboxConfirmed({}), false);
  assert.equal(mailboxConfirmed({ OUTREACH_MAILBOX_CONFIRMED: "false" }), false);
  assert.equal(mailboxConfirmed({ OUTREACH_MAILBOX_CONFIRMED: "true" }), true);
});

test("no outreach script builds its own footer or reads the address directly", () => {
  const dir = __dirname;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "footer.ts" && !f.endsWith(".test.ts"))) {
    const src = fs.readFileSync(path.join(dir, file), "utf8");
    assert.ok(!/process\.env\.OUTREACH_POSTAL_ADDRESS/.test(src), `${file} reads OUTREACH_POSTAL_ADDRESS directly; use footer.ts`);
  }
});

test("send.ts and testEmail.ts both build their text through renderEmailText", () => {
  for (const file of ["send.ts", "testEmail.ts"]) {
    const src = fs.readFileSync(path.join(__dirname, file), "utf8");
    assert.ok(src.includes("renderEmailText("), `${file} must use renderEmailText`);
  }
});
