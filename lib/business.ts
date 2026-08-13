import sql from "@/lib/db";

export type OwnerBusinessInfo = {
  business_name: string | null;
  business_registration_number: string | null;
  business_state: string | null;
  business_paperwork_url: string | null;
  business_verification_status: string;
  business_rejection_reason: string | null;
  business_subscription_status: string;
};

export type PendingBusinessVerification = {
  owner_id: string;
  owner_email: string;
  owner_name: string | null;
  business_name: string | null;
  business_registration_number: string | null;
  business_state: string | null;
  business_paperwork_url: string | null;
};

export type BusinessSubscriber = {
  owner_id: string;
  owner_email: string;
  owner_name: string | null;
  business_name: string | null;
  business_subscription_status: string;
  business_setup_fee_refunded_at: string | null;
};

// Only allowed from 'none' or 'rejected' — an owner can't resubmit while a
// review is already pending or after they've been approved.
export async function submitBusinessInfo(
  ownerId: string,
  fields: {
    businessName: string;
    businessRegistrationNumber: string;
    businessState: string;
    businessPaperworkUrl: string;
  }
): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    UPDATE owners
    SET
      business_name = ${fields.businessName},
      business_registration_number = ${fields.businessRegistrationNumber},
      business_state = ${fields.businessState},
      business_paperwork_url = ${fields.businessPaperworkUrl},
      business_verification_status = 'pending',
      business_rejection_reason = NULL
    WHERE id = ${ownerId} AND business_verification_status IN ('none', 'rejected')
    RETURNING id
  `;

  return rows.length > 0;
}

export async function getOwnerBusinessInfo(ownerId: string): Promise<OwnerBusinessInfo | null> {
  const rows = await sql<OwnerBusinessInfo[]>`
    SELECT
      business_name, business_registration_number, business_state, business_paperwork_url,
      business_verification_status, business_rejection_reason, business_subscription_status
    FROM owners
    WHERE id = ${ownerId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getPendingBusinessVerifications(): Promise<PendingBusinessVerification[]> {
  return sql<PendingBusinessVerification[]>`
    SELECT
      id AS owner_id, email AS owner_email, name AS owner_name,
      business_name, business_registration_number, business_state, business_paperwork_url
    FROM owners
    WHERE business_verification_status = 'pending'
    ORDER BY id
  `;
}

export async function approveBusinessVerification(ownerId: string): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    UPDATE owners
    SET business_verification_status = 'verified'
    WHERE id = ${ownerId} AND business_verification_status = 'pending'
    RETURNING id
  `;

  return rows.length > 0;
}

export async function rejectBusinessVerification(ownerId: string, reason: string): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    UPDATE owners
    SET business_verification_status = 'rejected', business_rejection_reason = ${reason || null}
    WHERE id = ${ownerId} AND business_verification_status = 'pending'
    RETURNING id
  `;

  return rows.length > 0;
}

// Owners who have ever paid the bundled Registered Business setup fee +
// subscription — i.e. a Stripe checkout has completed for them. Used by the
// admin panel to find who's eligible for a manual refund of the $99 setup
// fee (refunds themselves happen in the Stripe dashboard; this just records
// that it happened).
export async function getBusinessSubscribers(): Promise<BusinessSubscriber[]> {
  return sql<BusinessSubscriber[]>`
    SELECT
      id AS owner_id, email AS owner_email, name AS owner_name, business_name,
      business_subscription_status, business_setup_fee_refunded_at
    FROM owners
    WHERE stripe_subscription_id IS NOT NULL
    ORDER BY business_setup_fee_refunded_at IS NOT NULL, id
  `;
}

export async function markSetupFeeRefunded(ownerId: string): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    UPDATE owners
    SET business_setup_fee_refunded_at = now()
    WHERE id = ${ownerId} AND stripe_subscription_id IS NOT NULL AND business_setup_fee_refunded_at IS NULL
    RETURNING id
  `;

  return rows.length > 0;
}
