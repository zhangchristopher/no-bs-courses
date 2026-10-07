// Database side of the follow-up sequence: gathers the facts the pure stop
// rules in followups.ts need, and stops a sequence everywhere it has to stop.
import { sql, recordEvent, isSuppressed, type OutreachRow } from "./lib";
import { followUpVerdict, mustStopReason, type SequenceInput } from "./followups";

export async function stopSequence(outreachId: string, reason: string): Promise<void> {
  await sql`
    UPDATE creator_outreach SET sequence_stopped_at = COALESCE(sequence_stopped_at, now()),
      sequence_stopped_reason = COALESCE(sequence_stopped_reason, ${reason}), updated_at = now()
    WHERE id = ${outreachId}
  `;
  await sql`
    UPDATE outreach_followups SET status = 'cancelled', cancelled_at = now(), cancel_reason = ${reason}
    WHERE outreach_id = ${outreachId} AND status IN ('drafted', 'approved')
  `;
  await recordEvent(outreachId, "sequence_stopped", reason);
}

type Facts = Omit<SequenceInput, "step" | "alreadySentSteps" | "previousStepSentAt">;

export async function gatherFacts(row: OutreachRow, now = new Date()): Promise<Facts & { alreadySentSteps: number[]; previousStepSentAt: Date | null }> {
  const [replies] = await sql<{ n: number }[]>`SELECT count(*)::int AS n FROM outreach_replies WHERE outreach_id = ${row.id}`;
  const events = await sql<{ event_type: string }[]>`SELECT event_type FROM outreach_events WHERE outreach_id = ${row.id}`;
  const has = (t: string) => events.some((e) => e.event_type === t);

  const courses = await sql<{ verification_status: string; business_verification_status: string | null }[]>`
    SELECT c.verification_status, o.business_verification_status
    FROM courses c LEFT JOIN owners o ON o.id = c.verified_owner_id
    WHERE c.id = ANY(${row.course_ids})
  `;
  const claimState = courses.some((c) => c.verification_status === "verified")
    ? "verified"
    : courses.some((c) => c.verification_status === "pending") ? "pending" : "unclaimed";

  const sent = await sql<{ step: number; sent_at: Date }[]>`
    SELECT step, sent_at FROM outreach_followups WHERE outreach_id = ${row.id} AND status = 'sent' ORDER BY step
  `;
  const [invitation] = await sql<{ claim_started_at: Date | null }[]>`
    SELECT min(claim_started_at) AS claim_started_at FROM claim_invitations WHERE outreach_id = ${row.id}
  `;

  return {
    now,
    status: row.status,
    emailSentAt: row.sent_at,
    alreadySentSteps: sent.map((s) => s.step),
    previousStepSentAt: sent.find((s) => s.step === 1)?.sent_at ?? null,
    stoppedReason: (await sql<{ r: string | null }[]>`SELECT sequence_stopped_reason AS r FROM creator_outreach WHERE id = ${row.id}`)[0]?.r ?? null,
    hasReply: replies.n > 0 || has("reply") || has("positive_reply") || has("not_interested") || has("wrong_person"),
    suppressed: await isSuppressed(row.contact_email),
    bounced: has("bounced") || row.status === "bounced",
    complained: has("complaint"),
    claimState: invitation?.claim_started_at && claimState === "unclaimed" ? "pending" : claimState,
    businessVerified: courses.some((c) => c.business_verification_status === "verified" && c.verification_status !== "unclaimed"),
    mismatched: row.status === "wrong_person",
  };
}

// Cancels every running sequence that must stop. Deterministic: the only
// inputs are database facts. Returns what it stopped.
export async function sweepSequences(): Promise<{ id: string; name: string; reason: string }[]> {
  const rows = await sql<OutreachRow[]>`
    SELECT * FROM creator_outreach WHERE sent_at IS NOT NULL AND sequence_stopped_at IS NULL
  `;
  const stopped: { id: string; name: string; reason: string }[] = [];
  for (const row of rows) {
    const facts = await gatherFacts(row);
    const reason = mustStopReason(facts);
    if (reason) {
      await stopSequence(row.id, reason);
      stopped.push({ id: row.id, name: row.creator_name, reason });
    }
  }
  return stopped;
}

export async function verdictFor(row: OutreachRow, step: 1 | 2) {
  const facts = await gatherFacts(row);
  return { facts, verdict: followUpVerdict({ ...facts, step }) };
}
