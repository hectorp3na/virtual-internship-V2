import { loadStripe, Stripe } from "@stripe/stripe-js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

type CreateCheckoutSessionResponse = { sessionId: string };

const stripePromise: Promise<Stripe | null> = (() => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {

    const msg = "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY";
    if (process.env.NODE_ENV !== "production") console.error(msg);
    throw new Error(msg);
  }
  return loadStripe(key);
})();

export const redirectToStripeCheckout = async (priceId: string, email: string) => {
  const functions = getFunctions(getApp());
  const createCheckoutSession = httpsCallable<
    { priceId: string; email: string },
    CreateCheckoutSessionResponse
  >(functions, "createCheckoutSession");

  const { data } = await createCheckoutSession({ priceId, email });
  const stripe = await stripePromise;
  if (!stripe) throw new Error("Stripe failed to initialize");

  const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
  if (error) throw error;
};
