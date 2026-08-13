import sql from "@/lib/db";

// Postgres-backed rather than an in-memory counter — an in-memory Map would
// silently give zero real protection once this is deployed to serverless
// (each instance/invocation gets its own memory), so the shared DB is the
// only correct place to count hits across instances.
export async function checkRateLimit(params: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<{ allowed: boolean }> {
  const windowStart = new Date(Date.now() - params.windowSeconds * 1000);

  const [{ count }] = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM rate_limit_hits
    WHERE key = ${params.key} AND created_at >= ${windowStart}
  `;

  if (count >= params.limit) {
    return { allowed: false };
  }

  await sql`INSERT INTO rate_limit_hits (key) VALUES (${params.key})`;

  // Opportunistic cleanup (1-in-50 calls) so the table doesn't grow forever
  // without needing a separate cron job.
  if (Math.random() < 0.02) {
    await sql`DELETE FROM rate_limit_hits WHERE created_at < now() - interval '1 day'`;
  }

  return { allowed: true };
}
