import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import stripe from "@/lib/stripe";
import sql from "@/lib/db";

export const runtime = "nodejs";

function mapSubscriptionStatus(status: Stripe.Subscription.Status): string {
  if (status === "active" || status === "trialing") return "active";
  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
    return "canceled";
  }
  return "past_due";
}

async function syncSubscriptionStatus(subscriptionId: string, status: string) {
  const [owner] = await sql<{ id: string }[]>`
    UPDATE owners SET business_subscription_status = ${status}
    WHERE stripe_subscription_id = ${subscriptionId}
    RETURNING id
  `;
  if (owner) return;

  await sql`
    UPDATE users SET plan_subscription_status = ${status}
    WHERE stripe_subscription_id = ${subscriptionId}
  `;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const kind = session.metadata?.kind;
        const customerId = typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null);
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null);

        if (kind === "business_subscription" && session.metadata?.owner_id) {
          await sql`
            UPDATE owners
            SET stripe_customer_id = ${customerId}, stripe_subscription_id = ${subscriptionId}, business_subscription_status = 'active'
            WHERE id = ${session.metadata.owner_id}
          `;
        } else if (kind === "customer_plan" && session.metadata?.user_id) {
          await sql`
            UPDATE users
            SET stripe_customer_id = ${customerId}, stripe_subscription_id = ${subscriptionId}, plan_subscription_status = 'active'
            WHERE id = ${session.metadata.user_id}
          `;
        } else if (kind === "course_unlock" && session.metadata?.user_id && session.metadata?.course_id) {
          await sql`
            INSERT INTO course_unlocks (user_id, course_id, source)
            VALUES (${session.metadata.user_id}, ${session.metadata.course_id}, 'one_time_payment')
            ON CONFLICT (user_id, course_id) DO NOTHING
          `;
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionStatus(subscription.id, mapSubscriptionStatus(subscription.status));
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionStatus(subscription.id, "canceled");
        break;
      }

      default:
        break;
    }
  } catch (error) {
    // Tagged explicitly (rather than relying only on automatic Route
    // Handler capture) because a silent failure here means a customer paid
    // and never got their subscription/unlock activated — that's worth
    // richer context than a bare stack trace. Re-thrown as a 500 so Stripe
    // retries the webhook instead of treating it as handled.
    Sentry.captureException(error, {
      tags: { stripe_event_type: event.type },
      extra: { stripe_event_id: event.id },
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
