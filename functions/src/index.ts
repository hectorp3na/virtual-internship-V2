
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();

/**
 * Set with:
 *   firebase functions:config:set \
 *   stripe.secret="sk_test_..." \
 *   stripe.webhook_secret="whsec_..."
 */
const stripe = new Stripe(functions.config().stripe.secret, {
  // apiVersion: "2024-06-20",
});


type RawReq = functions.https.Request & { rawBody: Buffer };

export const createCheckoutSession = functions.https.onCall(
  async (request: functions.https.CallableRequest<{ priceId: string }>) => {
    const uid = request.auth?.uid;
    const email = request.auth?.token?.email as string | undefined;

    if (!uid || !email) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Login required to create a checkout session."
      );
    }

    const {priceId} = request.data || {};
    if (!priceId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing priceId."
      );
    }

    // Swap for prod domain when deploying.
    const baseUrl = "http://localhost:3000";
    const successUrl = `${baseUrl}/for-you?checkout=success`;
    const cancelUrl = `${baseUrl}/for-you?checkout=canceled`;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{price: priceId, quantity: 1}],
        customer_email: email,
        metadata: {
          firebaseUID: uid,
          selectedPriceId: priceId,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      });

      return {sessionId: session.id, url: session.url};
    } catch (err: unknown) {
      const e = err as Error;
      console.error("Stripe error:", e.message);
      throw new functions.https.HttpsError("internal", e.message);
    }
  }
);


export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = functions.config().stripe.webhook_secret;

  if (!sig || !webhookSecret) {
    res.status(400).send("Missing signature or webhook secret");
    return;
  }

  let event: Stripe.Event;

  try {
    const rawReq = req as RawReq;
    event = stripe.webhooks.constructEvent(rawReq.rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const e = err as Error;
    console.error("Bad signature:", e.message);
    res.status(400).send(`Webhook Error: ${e.message}`);
    return;
  }

  try {
    switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid = session.metadata?.firebaseUID;
      if (!uid) break;

      const subscriptionId = session.subscription as string | undefined;

      let plan = "premium";

      if (subscriptionId) {
        const sub = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as unknown as Stripe.Subscription;


        const periodEnd =
            (sub as unknown as { current_period_end?: number | null })
              .current_period_end;

        const firstItem = sub.items?.data?.[0];
        const price = firstItem?.price;
        plan = (price?.nickname || price?.id) ?? "premium";

    
        if (session.customer) {
          try {
            await stripe.customers.update(session.customer as string, {
              metadata: {firebaseUID: uid},
            });
          } catch (e) {
            console.warn("Could not set customer.metadata.firebaseUID");
          }
        }

        await admin
          .firestore()
          .collection("users")
          .doc(uid)
          .set(
            {
              subscriptionStatus: "premium",
              subscriptionPlan: plan,
              stripeCustomerId: (session.customer as string) ?? null,
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd: periodEnd ?
                admin.firestore.Timestamp.fromMillis(periodEnd * 1000) :
                admin.firestore.FieldValue.delete(),
              subscriptionUpdatedAt:
                  admin.firestore.FieldValue.serverTimestamp(),
            },
            {merge: true}
          );
      } else {
        await admin
          .firestore()
          .collection("users")
          .doc(uid)
          .set(
            {
              subscriptionStatus: "premium",
              subscriptionPlan: plan,
              stripeCustomerId: (session.customer as string) ?? null,
              subscriptionUpdatedAt:
                  admin.firestore.FieldValue.serverTimestamp(),
            },
            {merge: true}
          );
      }

      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused": {
      const sub = event.data.object as Stripe.Subscription;


      const periodEnd =
          (sub as unknown as { current_period_end?: number | null })
            .current_period_end;

      const customerId = sub.customer as string;

      let uid: string | undefined;
      try {
        const customerObj = await stripe.customers.retrieve(customerId);
        if (!customerObj.deleted) {
          const cust = customerObj as Stripe.Customer;
          uid =
              typeof cust.metadata?.firebaseUID === "string" ?
                cust.metadata.firebaseUID :
                undefined;
        }
      } catch {
       
      }
      if (!uid) break;

      const isActive = sub.status === "active" || sub.status === "trialing";

      const firstItem = sub.items?.data?.[0];
      const price = firstItem?.price;
      const plan = (price?.nickname || price?.id) ?? null;

      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .set(
          {
            subscriptionStatus: isActive ? "premium" : "free",
            subscriptionPlan: plan,
            currentPeriodEnd: periodEnd ?
              admin.firestore.Timestamp.fromMillis(periodEnd * 1000) :
              admin.firestore.FieldValue.delete(),
            subscriptionUpdatedAt:
                admin.firestore.FieldValue.serverTimestamp(),
          },
          {merge: true}
        );
      break;
    }

    default:
     
      break;
    }

    res.json({received: true});
    return;
  } catch (err: unknown) {
    const e = err as Error;
    console.error("Webhook handler error:", e);
    res.status(500).send("Webhook handler failed");
    return;
  }
});
