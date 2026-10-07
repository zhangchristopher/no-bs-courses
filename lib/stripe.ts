import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Whether this deployment talks to Stripe's live mode (sk_live_/rk_live_)
// or test mode. The webhook uses it to refuse events from the other mode.
export const stripeKeyIsLive = /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY);

export default stripe;
