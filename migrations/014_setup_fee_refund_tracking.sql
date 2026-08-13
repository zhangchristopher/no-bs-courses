-- Refunds are processed manually in the Stripe dashboard (no automated
-- refund-triggering yet) — this just gives admin a place to record that the
-- $99 Registered Business setup fee was refunded, and a UI to see it.
ALTER TABLE owners ADD COLUMN IF NOT EXISTS business_setup_fee_refunded_at TIMESTAMPTZ;
