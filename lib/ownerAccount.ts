import sql from "@/lib/db";

// This is the owner's account display name — shown only to No BS Courses
// admins in review queues, never to the public. Free to be an alias; the
// real legal identity lives separately in owners.business_name, captured
// (and kept private) during business paperwork verification.
export async function updateOwnerPublicName(ownerId: string, name: string): Promise<void> {
  await sql`UPDATE owners SET name = ${name || null} WHERE id = ${ownerId}`;
}

export async function getOwnerPublicName(ownerId: string): Promise<string | null> {
  const [row] = await sql<{ name: string | null }[]>`
    SELECT name FROM owners WHERE id = ${ownerId} LIMIT 1
  `;
  return row?.name ?? null;
}
