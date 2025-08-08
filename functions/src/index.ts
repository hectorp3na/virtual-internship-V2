import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

admin.initializeApp();
const stripeSecret =
  "sk_test_51RtLJQLaXqGfXK4JaQSdykeIqUpmKSLqcDrOK4130f94y64l" +
  "fJtrM57B6kAapCl8YsHFmw7wrnXJUGq9flXxL8yK00ZgbcFQSC";

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2025-07-30.basil",
});

export const createCheckoutSession = functions.https.onCall(
  async (
    request: functions.https.CallableRequest<{
      priceId: string;
      email: string;
    }>,
  ) => {
    const {priceId, email} = request.data;

    const cancelUrl = "http://localhost:3000/for-you";
    const successUrl = "http://localhost:3000/for-you";


    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer_email: email,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return {
        sessionId: session.id,
      };
    } catch (error) {
      const err = error as Error;
      console.error("Stripe error:", err.message);
      throw new functions.https.HttpsError("internal", err.message);
    }
  },
);
