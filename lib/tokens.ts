import { randomBytes, createHash } from "node:crypto";
import sql from "@/lib/db";

export type TokenPurpose = "verify_email" | "reset_password";
export type AccountType = "user" | "owner";

const TOKEN_TTL_MS: Record<TokenPurpose, number> = {
  verify_email: 24 * 60 * 60 * 1000, // 24 hours
  reset_password: 60 * 60 * 1000, // 1 hour
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// The raw token is only ever returned here, once, to be put in the email
// link — only its hash is persisted, so a database leak can't be used to
// forge or replay tokens (same trust model as password hashing).
export async function issueToken(
  purpose: TokenPurpose,
  accountType: AccountType,
  accountId: string
): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS[purpose]);

  await sql`
    INSERT INTO account_tokens (purpose, account_type, account_id, token_hash, expires_at)
    VALUES (${purpose}, ${accountType}, ${accountId}, ${hashToken(token)}, ${expiresAt})
  `;

  return token;
}

export type ConsumeTokenResult =
  | { ok: true; accountType: AccountType; accountId: string }
  | { ok: false; error: "invalid" | "expired" | "used" };

// Single-use: the UPDATE that marks a token used only succeeds if it's
// still unused, so two concurrent requests with the same token can't both
// go through.
export async function consumeToken(purpose: TokenPurpose, rawToken: string): Promise<ConsumeTokenResult> {
  if (!rawToken) return { ok: false, error: "invalid" };

  const tokenHash = hashToken(rawToken);

  const [row] = await sql<
    { account_type: AccountType; account_id: string; expires_at: string; used_at: string | null }[]
  >`
    SELECT account_type, account_id, expires_at, used_at
    FROM account_tokens
    WHERE purpose = ${purpose} AND token_hash = ${tokenHash}
    LIMIT 1
  `;

  if (!row) return { ok: false, error: "invalid" };
  if (row.used_at) return { ok: false, error: "used" };
  if (new Date(row.expires_at).getTime() < Date.now()) return { ok: false, error: "expired" };

  const [claimed] = await sql<{ token_hash: string }[]>`
    UPDATE account_tokens SET used_at = now()
    WHERE purpose = ${purpose} AND token_hash = ${tokenHash} AND used_at IS NULL
    RETURNING token_hash
  `;
  if (!claimed) return { ok: false, error: "used" };

  return { ok: true, accountType: row.account_type, accountId: row.account_id };
}
