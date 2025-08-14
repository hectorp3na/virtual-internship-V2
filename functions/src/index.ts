/* eslint-disable require-jsdoc, valid-jsdoc, max-len, object-curly-spacing, indent, operator-linebreak */
import { onRequest, onCall } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import type { Request, Response } from "express";

const STRIPE_SECRET = defineSecret("STRIPE_SECRET");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const APP_BASE_URL = defineString("APP_BASE_URL");

admin.initializeApp();

let stripeSingleton: Stripe | undefined;
function getStripe(): Stripe {
  const secret = STRIPE_SECRET.value();
  if (!secret) throw new Error("Missing STRIPE_SECRET.");
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(secret, {
      // apiVersion: "2024-06-20",
    });
  }
  return stripeSingleton as Stripe;
}

type RawReq = Request & { rawBody: Buffer };

function getSubscriptionIdFromInvoice(inv: Stripe.Invoice): string | null {
  const v = (inv as any).subscription;
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && typeof v.id === "string") return v.id;
  return null;
}

function getCustomerIdFromInvoice(inv: Stripe.Invoice): string | null {
  const v = inv.customer;
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && typeof (v as any).id === "string")
    return (v as any).id;
  return null;
}

function getInvoiceIdFromPaymentIntent(
  pi: Stripe.PaymentIntent
): string | null {
  const v = (pi as any).invoice;
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && typeof (v as any).id === "string")
    return (v as any).id;
  return null;
}

function getCustomerIdFromPaymentIntent(
  pi: Stripe.PaymentIntent
): string | null {
  const v = pi.customer;
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && typeof (v as any).id === "string")
    return (v as any).id;
  return null;
}

function getPeriodEndFromSubscription(sub: Stripe.Subscription): number | null {
  const v = (sub as any).current_period_end;
  return typeof v === "number" ? v : null;
}

function getSubscriptionIdFromSession(
  s: Stripe.Checkout.Session
): string | null {
  const v = s.subscription as unknown;
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && typeof (v as any).id === "string")
    return (v as any).id;
  return null;
}

async function computePlanDisplayName(
  price?: Stripe.Price | null
): Promise<string | null> {
  if (!price) return null;
  if (price.nickname) return price.nickname;
  const productId = price.product as string | undefined;
  if (productId) {
    try {
      const product = await getStripe().products.retrieve(productId);
      return (product as Stripe.Product).name ?? null;
    } catch (e) {
      logger.warn("[planName] Failed to retrieve product", {
        productId,
        error: (e as Error)?.message,
      });
    }
  }
  return null;
}

async function resolveUidFromStripe(opts: {
  subscriptionId?: string | null;
  customerId?: string | null;
}): Promise<string | null> {
  const { subscriptionId, customerId } = opts;

  if (subscriptionId) {
    try {
      const sub = await getStripe().subscriptions.retrieve(subscriptionId);
      const uidFromSub = (sub as any)?.metadata?.firebaseUID;
      if (typeof uidFromSub === "string" && uidFromSub) return uidFromSub;
    } catch (e) {
      logger.warn("[resolveUid] Failed to retrieve subscription", {
        subscriptionId,
        error: (e as Error)?.message,
      });
    }
  }

  if (customerId) {
    try {
      const c = await getStripe().customers.retrieve(customerId);
      if (!("deleted" in c) || (c as any).deleted === false) {
        const uidFromCust = (c as any)?.metadata?.firebaseUID;
        if (typeof uidFromCust === "string" && uidFromCust) return uidFromCust;
      }
    } catch (e) {
      logger.warn("[resolveUid] Failed to retrieve customer", {
        customerId,
        error: (e as Error)?.message,
      });
    }
  }

  if (customerId) {
    try {
      const snap = await admin
        .firestore()
        .collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();
      if (!snap.empty) return snap.docs[0].id;
    } catch (e) {
      logger.warn("[resolveUid] Firestore lookup failed", {
        customerId,
        error: (e as Error)?.message,
      });
    }
  }

  return null;
}

async function getOrCreateCustomer(uid: string, email?: string) {
  const ref = admin.firestore().collection("users").doc(uid);
  const snap = await ref.get();
  const existing = snap.get("stripeCustomerId") as string | undefined;
  if (existing) return existing;

  const customer = await getStripe().customers.create({
    email,
    metadata: { firebaseUID: uid },
  });
  await ref.set({ stripeCustomerId: customer.id }, { merge: true });
  return customer.id;
}

async function createCheckoutCore(params: {
  uid: string;
  email?: string;
  priceId: string;
}) {
  const { uid, email, priceId } = params;

  const baseUrl = APP_BASE_URL.value() || "http://localhost:3000";
  const successUrl = `${baseUrl}/for-you?checkout=success`;
  const cancelUrl = `${baseUrl}/for-you?checkout=canceled`;

  const customerId = await getOrCreateCustomer(uid, email);
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    metadata: { firebaseUID: uid, selectedPriceId: priceId },
    subscription_data: { metadata: { firebaseUID: uid } },
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return { sessionId: session.id, url: session.url as string };
}

export const createCheckoutSessionV2 = onRequest(
  {
    region: "us-central1",
    invoker: "public",
    cors: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://your-prod-domain.com", // TODO: set real prod origin when you deploy
      // e.g. "https://summarist.vercel.app"
    ],
    secrets: [STRIPE_SECRET],
  },
  async (req: Request, res: Response) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const authHeader =
      req.headers.authorization || (req.headers as any).Authorization;
    if (!authHeader || typeof authHeader !== "string") {
      res.status(401).json({ error: "Missing Authorization header" });
      return;
    }
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({ error: "Invalid Authorization header" });
      return;
    }

    let uid: string | undefined;
    let email: string | undefined;
    try {
      const decoded = await admin.auth().verifyIdToken(parts[1]);
      uid = decoded.uid;
      email = decoded.email ?? undefined;
    } catch (e) {
      logger.warn(
        "[createCheckoutSessionV2] Invalid Firebase ID token",
        e as Error
      );
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const { priceId } = (req.body ?? {}) as { priceId?: string };
    if (!priceId || !uid) {
      res.status(400).json({ error: "Missing priceId or auth" });
      return;
    }

    try {
      const out = await createCheckoutCore({ uid, email, priceId });
      logger.info("[createCheckoutSessionV2] Created session", {
        uid,
        priceId,
      });
      res.status(200).json(out);
    } catch (err: unknown) {
      const e = err as Error;
      logger.error("[createCheckoutSessionV2] Stripe error", {
        message: e.message,
      });
      res.status(500).json({ error: "Internal" });
    }
  }
);

export const createCheckoutSession = onCall(
  {
    region: "us-central1",
    secrets: [STRIPE_SECRET],
  },
  async (request) => {
    const uid = request.auth?.uid;
    const email =
      (request.auth?.token?.email as string | undefined) ?? undefined;
    const priceId = (request.data?.priceId as string | undefined) ?? undefined;

    if (!uid || !priceId) {
      throw new Error("Missing auth or priceId");
    }

    try {
      const out = await createCheckoutCore({ uid, email, priceId });
      logger.info("[createCheckoutSession(callable)] Created session", {
        uid,
        priceId,
      });
      return out;
    } catch (err: unknown) {
      const e = err as Error;
      logger.error("[createCheckoutSession(callable)] Stripe error", {
        message: e.message,
      });
      throw new Error("Internal");
    }
  }
);

export const stripeWebhook = onRequest(
  {
    region: "us-central1",
    invoker: "public",
    secrets: [STRIPE_SECRET, STRIPE_WEBHOOK_SECRET],
  },
  async (req: Request, res: Response) => {
    const t0 = Date.now();
    const log = (msg: string, extra: Record<string, unknown> = {}) =>
      logger.info(`[stripeWebhook] ${msg}`, extra);

    if (req.method !== "POST") {
      log("Non-POST request rejected", { method: req.method });
      res.status(405).send("Method Not Allowed");
      return;
    }

    const sig = req.headers["stripe-signature"] as string | undefined;
    const webhookSecret = STRIPE_WEBHOOK_SECRET.value();
    log("Incoming request", {
      hasSignatureHeader: Boolean(sig),
      rawBodyBytes: (req as RawReq).rawBody?.length ?? 0,
    });

    if (!sig || !webhookSecret) {
      logger.error("[stripeWebhook] Missing signature or webhook secret");
      res.status(400).send("Missing signature or webhook secret");
      return;
    }

    let event: Stripe.Event;
    try {
      const rawReq = req as RawReq;
      event = getStripe().webhooks.constructEvent(
        rawReq.rawBody,
        sig,
        webhookSecret
      );
      log("Signature verified", {
        eventId: event.id,
        type: event.type,
        created: event.created,
        livemode: event.livemode,
      });
    } catch (err: unknown) {
      const e = err as Error;
      logger.error("[stripeWebhook] Bad Stripe signature", {
        message: e.message,
      });
      res.status(400).send(`Webhook Error: ${e.message}`);
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const uid = session.metadata?.firebaseUID ?? null;
          const customerId =
            (typeof session.customer === "string"
              ? session.customer
              : (session.customer as any)?.id) ?? null;
          const subId = getSubscriptionIdFromSession(session);

          log("checkout.session.completed", {
            sessionId: session.id,
            uid,
            customerId,
            subscriptionId: subId ?? null,
          });

          if (!uid) {
            logger.warn(
              "[webhook] Missing uid in session.metadata.firebaseUID"
            );
            break;
          }

          if (!subId) {
            await admin
              .firestore()
              .collection("users")
              .doc(uid)
              .set(
                {
                  subscriptionPlan: "Premium",
                  subscriptionPlanName: "Premium",
                  stripeCustomerId: customerId ?? null,
                  subscriptionUpdatedAt:
                    admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true }
              );
            log("Wrote minimal linkage (no subscription on session)", { uid });
            break;
          }

          let sub: Stripe.Subscription | null = null;
          try {
            sub = (await getStripe().subscriptions.retrieve(
              subId
            )) as Stripe.Subscription;
          } catch (e) {
            logger.warn("[webhook] subscriptions.retrieve failed", {
              subscriptionId: subId,
              error: (e as Error)?.message,
            });

            await admin
              .firestore()
              .collection("users")
              .doc(uid)
              .set(
                {
                  stripeCustomerId: customerId ?? null,
                  stripeSubscriptionId: subId,
                  subscriptionUpdatedAt:
                    admin.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true }
              );
            break;
          }

          const firstItem = sub.items?.data?.[0];
          const price = firstItem?.price;
          const status = sub.status;
          const periodEnd = getPeriodEndFromSubscription(sub);
          const isActive = status === "active" || status === "trialing";
          const priceId = price?.id ?? null;
          const productId = (price?.product as string) ?? null;
          const planDisplayName = await computePlanDisplayName(price);
          const planNicknameOrId = price?.nickname ?? price?.id ?? "Premium";

          if (customerId) {
            try {
              await getStripe().customers.update(customerId, {
                metadata: { firebaseUID: uid },
              });
            } catch (e) {
              logger.warn("[webhook] customers.update failed", {
                customerId,
                error: (e as Error)?.message,
              });
            }
          }

          await admin
            .firestore()
            .collection("users")
            .doc(uid)
            .set(
              {
                role: isActive ? "premium" : "free",
                subscriptionStatus: status,
                subscriptionPlan: planDisplayName ?? planNicknameOrId,
                subscriptionPlanName: planDisplayName ?? null,
                priceId,
                productId,
                stripeCustomerId: customerId ?? null,
                stripeSubscriptionId: sub.id,
                currentPeriodEnd: periodEnd
                  ? admin.firestore.Timestamp.fromMillis(periodEnd * 1000)
                  : admin.firestore.FieldValue.delete(),
                subscriptionUpdatedAt:
                  admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          log("Firestore write complete (checkout+sub)", { uid });
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const customerId = sub.customer as string;
          const status = sub.status;
          const firstItem = sub.items?.data?.[0];
          const price = firstItem?.price;
          const priceId = price?.id ?? null;
          const productId = (price?.product as string) ?? null;
          const periodEnd = getPeriodEndFromSubscription(sub);
          const planDisplayName = await computePlanDisplayName(price);

          log("Subscription lifecycle event", {
            type: event.type,
            subscriptionId: sub.id,
            customerId,
            status,
            priceId,
            productId,
            currentPeriodEnd_unix: periodEnd,
            hasUidInMetadata: Boolean((sub as any)?.metadata?.firebaseUID),
            planDisplayName,
          });

          let uid: string | null =
            ((sub as any)?.metadata?.firebaseUID as string | undefined) ?? null;
          if (!uid) {
            uid = await resolveUidFromStripe({
              subscriptionId: sub.id,
              customerId,
            });
          }

          if (!uid) {
            logger.error("[subscription] Could not determine uid", {
              customerId,
              subscriptionId: sub.id,
            });
            break;
          }

          try {
            await getStripe().customers.update(customerId, {
              metadata: { firebaseUID: uid },
            });
          } catch (e) {
            logger.warn("[subscription] Failed to backfill customer metadata", {
              customerId,
              error: (e as Error)?.message,
            });
          }

          const isActive = status === "active" || status === "trialing";
          const planNicknameOrId = price?.nickname ?? price?.id ?? null;

          await admin
            .firestore()
            .collection("users")
            .doc(uid)
            .set(
              {
                role: isActive ? "premium" : "free",
                subscriptionStatus: status,
                subscriptionPlan: planDisplayName ?? planNicknameOrId,
                subscriptionPlanName: planDisplayName ?? null,
                priceId,
                productId,
                currentPeriodEnd: periodEnd
                  ? admin.firestore.Timestamp.fromMillis(periodEnd * 1000)
                  : admin.firestore.FieldValue.delete(),
                subscriptionUpdatedAt:
                  admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );
          log("Firestore write complete (sub lifecycle)", { uid });
          break;
        }

        case "payment_intent.succeeded": {
          const pi = event.data.object as Stripe.PaymentIntent;
          const customerId = getCustomerIdFromPaymentIntent(pi);
          const invoiceId = getInvoiceIdFromPaymentIntent(pi);

          log("PaymentIntent succeeded", {
            paymentIntent: pi.id,
            customerId,
            invoiceId,
          });

          let subscriptionId: string | null = null;
          if (invoiceId) {
            try {
              const inv = await getStripe().invoices.retrieve(invoiceId);
              subscriptionId = getSubscriptionIdFromInvoice(
                inv as Stripe.Invoice
              );
            } catch (e) {
              logger.warn("[pi.succeeded] Failed to retrieve invoice", {
                invoiceId,
                error: (e as Error)?.message,
              });
            }
          }

          const uid = await resolveUidFromStripe({
            subscriptionId,
            customerId,
          });
          if (!uid) {
            logger.error("[pi.succeeded] User not found", {
              paymentIntent: pi.id,
              customerId,
              subscriptionId,
            });
            break;
          }

          await admin.firestore().collection("users").doc(uid).set(
            {
              lastPaymentIntentId: pi.id,
              lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
              subscriptionUpdatedAt:
                admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          log("PI Firestore write complete", { uid, paymentIntent: pi.id });
          break;
        }

        case "invoice.paid":
        case "invoice.payment_succeeded":
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;

          const subscriptionId = getSubscriptionIdFromInvoice(invoice);
          const customerId = getCustomerIdFromInvoice(invoice);

          log("Invoice event", {
            type: event.type,
            invoiceId: invoice.id,
            subscriptionId,
            customerId,
            status: invoice.status,
          });

          const uid = await resolveUidFromStripe({
            subscriptionId,
            customerId,
          });

          let planDisplayName: string | null = null;
          let priceId: string | null = null;
          let productId: string | null = null;
          if (subscriptionId) {
            try {
              const sub = (await getStripe().subscriptions.retrieve(
                subscriptionId
              )) as Stripe.Subscription;
              const firstItem = sub.items?.data?.[0];
              const price = firstItem?.price;
              priceId = price?.id ?? null;
              productId = (price?.product as string) ?? null;
              planDisplayName = await computePlanDisplayName(price);
            } catch (e) {
              logger.warn("[invoice] Failed to retrieve sub for plan name", {
                subscriptionId,
                error: (e as Error)?.message,
              });
            }
          }

          if (!uid) {
            logger.error("[invoice] User not found", {
              invoiceId: invoice.id,
              subscriptionId,
              customerId,
            });
            break;
          }

          await admin
            .firestore()
            .collection("users")
            .doc(uid)
            .set(
              {
                lastInvoiceId: invoice.id,
                lastInvoiceStatus: invoice.status ?? null,
                lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
                subscriptionPlanName:
                  planDisplayName ?? admin.firestore.FieldValue.delete(),
                subscriptionPlan: planDisplayName ?? undefined,
                priceId: priceId ?? undefined,
                productId: productId ?? undefined,
                subscriptionUpdatedAt:
                  admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );

          log("Invoice Firestore write complete", {
            uid,
            invoiceId: invoice.id,
            planDisplayName,
          });
          break;
        }

        default: {
          log("Unhandled event type", { type: event.type });
        }
      }

      log("Success response", { ms: Date.now() - t0 });
      res.json({ received: true });
    } catch (err: unknown) {
      const e = err as Error;
      logger.error("[stripeWebhook] Handler error", {
        message: e.message,
        stack: e.stack,
      });
      res.status(500).send("Webhook handler failed");
    }
  }
);
