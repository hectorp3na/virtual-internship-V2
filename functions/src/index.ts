/* eslint-disable require-jsdoc, valid-jsdoc, max-len */
import {onRequest} from "firebase-functions/v2/https";
import {defineSecret, defineString} from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import type {Request, Response} from "express";

const STRIPE_SECRET = defineSecret("STRIPE_SECRET");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const APP_BASE_URL = defineString("APP_BASE_URL");

admin.initializeApp();

let stripeSingleton: Stripe | undefined;

function getStripe(): Stripe {
  const secret = STRIPE_SECRET.value();
  if (!secret) throw new Error("Missing STRIPE_SECRET.");
  if (!stripeSingleton) {
    stripeSingleton = new (Stripe as unknown as typeof Stripe)(secret, {
      // apiVersion: "2024-06-20",
    });
  }
  return stripeSingleton as Stripe;
}

type RawReq = Request & { rawBody: Buffer };

async function getAuthFromRequest(req: Request): Promise<{ uid: string; email?: string } | null> {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== "string") return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  try {
    const decoded = await admin.auth().verifyIdToken(parts[1]);
    return {uid: decoded.uid, email: decoded.email ?? undefined};
  } catch (e) {
    logger.warn("Invalid Firebase ID token", e as Error);
    return null;
  }
}

/**
 * Get or create a Stripe customer and persist the ID to Firestore.
 * @param uid
 * @param email
 * @return Stripe customer ID
 */
async function getOrCreateCustomer(uid: string, email?: string) {
  const ref = admin.firestore().collection("users").doc(uid);
  const snap = await ref.get();
  const existing = snap.get("stripeCustomerId") as string | undefined;
  if (existing) return existing;

  const customer = await getStripe().customers.create({
    email,
    metadata: {firebaseUID: uid},
  });
  await ref.set({stripeCustomerId: customer.id}, {merge: true});
  return customer.id;
}

/**
 * === CHANGED: HTTPS onRequest with built-in CORS (Option 1) ===
 * Requires Authorization: Bearer <Firebase ID token>
 */
export const createCheckoutSessionV2 = onRequest(
  {
    region: "us-central1",
    cors: ["http://localhost:3000", "http://127.0.0.1:3000", "https://your-prod-domain.com"], // <-- add your prod origin
    secrets: [STRIPE_SECRET],
  },
  async (req: Request, res: Response) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    logger.info("createCheckoutSessionV2 start", {
      hasStripeSecret: Boolean(STRIPE_SECRET.value()),
      baseUrl: APP_BASE_URL.value() || "http://localhost:3000",
      origin: req.headers.origin,
    });

    // Verify Firebase auth (since onRequest has no request.auth)
    const auth = await getAuthFromRequest(req);
    if (!auth?.uid || !auth.email) {
      res.status(401).json({error: "Login required to create a checkout session."});
      return;
    }

    const {priceId} = (req.body ?? {}) as { priceId?: string };
    if (!priceId) {
      res.status(400).json({error: "Missing priceId."});
      return;
    }

    const baseUrl = APP_BASE_URL.value() || "http://localhost:3000";
    const successUrl = `${baseUrl}/for-you?checkout=success`;
    const cancelUrl = `${baseUrl}/for-you?checkout=canceled`;

    try {
      const customerId = await getOrCreateCustomer(auth.uid, auth.email);
      const session = await getStripe().checkout.sessions.create({
        mode: "subscription",
        line_items: [{price: priceId, quantity: 1}],
        customer: customerId,
        metadata: {firebaseUID: auth.uid, selectedPriceId: priceId},
        subscription_data: {metadata: {firebaseUID: auth.uid}},
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      });

      res.status(200).json({sessionId: session.id, url: session.url as string});
    } catch (err: unknown) {
      const e = err as Error;
      logger.error("Stripe error creating session", {message: e.message});
      res.status(500).json({error: "Internal"});
    }
  }
);

export const stripeWebhook = onRequest(
  {
    region: "us-central1",
    secrets: [STRIPE_SECRET, STRIPE_WEBHOOK_SECRET],
  },
  async (req: Request, res: Response) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const sig = req.headers["stripe-signature"] as string | undefined;
    const webhookSecret = STRIPE_WEBHOOK_SECRET.value();
    if (!sig || !webhookSecret) {
      res.status(400).send("Missing signature or webhook secret");
      return;
    }

    let event: Stripe.Event;
    try {
      const rawReq = req as RawReq;
      event = getStripe().webhooks.constructEvent(rawReq.rawBody, sig, webhookSecret);
    } catch (err: unknown) {
      const e = err as Error;
      logger.error("Bad Stripe signature", {message: e.message});
      res.status(400).send(`Webhook Error: ${e.message}`);
      return;
    }

    try {
      switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.firebaseUID;
        if (!uid) break;

        const subId = session.subscription as string | undefined;
        let plan = "premium";

        if (subId) {
          const sub = await getStripe().subscriptions.retrieve(subId);
          const s = sub as unknown as Stripe.Subscription;
          const periodEnd = (s as unknown as { current_period_end?: number | null }).current_period_end;

          const firstItem = s.items?.data?.[0];
          const price = firstItem?.price;
          plan = (price?.nickname || price?.id) ?? "premium";

          if (session.customer) {
            try {
              await getStripe().customers.update(session.customer as string, {
                metadata: {firebaseUID: uid},
              });
            } catch {
              logger.warn("Could not set customer metadata");
            }
          }

          const status = s.status;
          const isActive = status === "active" || status === "trialing";
          const priceId = price?.id ?? null;
          const productId = (price?.product as string) ?? null;

          await admin.firestore().collection("users").doc(uid).set(
            {
              role: isActive ? "premium" : "free",
              subscriptionStatus: status,
              subscriptionPlan: price?.nickname ?? priceId,
              priceId,
              productId,
              stripeCustomerId: (session.customer as string) ?? null,
              stripeSubscriptionId: subId,
              currentPeriodEnd: periodEnd ?
                admin.firestore.Timestamp.fromMillis(periodEnd * 1000) :
                admin.firestore.FieldValue.delete(),
              subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            {merge: true}
          );
        } else {
          await admin.firestore().collection("users").doc(uid).set(
            {
              subscriptionPlan: plan,
              stripeCustomerId: (session.customer as string) ?? null,
              subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            {merge: true}
          );
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused": {
        const s = event.data.object as Stripe.Subscription;
        const periodEnd = (s as unknown as { current_period_end?: number | null }).current_period_end;

        const customerId = s.customer as string;

        let uid: string | undefined;
        try {
          const c = await getStripe().customers.retrieve(customerId);
          if (!c.deleted) {
            const cust = c as Stripe.Customer;
            uid = typeof cust.metadata?.firebaseUID === "string" ? cust.metadata.firebaseUID : undefined;
          }
        } catch (e) {
          logger.warn("Retrieve customer failed", e as Error);
        }
        if (!uid) break;

        const isActive = s.status === "active" || s.status === "trialing";
        const firstItem = s.items?.data?.[0];
        const price = firstItem?.price;
        const plan = (price?.nickname || price?.id) ?? null;
        const priceId = price?.id ?? null;
        const productId = (price?.product as string) ?? null;

        await admin.firestore().collection("users").doc(uid).set(
          {
            role: isActive ? "premium" : "free",
            subscriptionStatus: s.status,
            subscriptionPlan: plan,
            priceId,
            productId,
            currentPeriodEnd: periodEnd ?
              admin.firestore.Timestamp.fromMillis(periodEnd * 1000) :
              admin.firestore.FieldValue.delete(),
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          {merge: true}
        );
        break;
      }

      default:
        break;
      }

      res.json({received: true});
    } catch (err: unknown) {
      const e = err as Error;
      logger.error("Webhook handler error", {message: e.message});
      res.status(500).send("Webhook handler failed");
    }
  }
);
