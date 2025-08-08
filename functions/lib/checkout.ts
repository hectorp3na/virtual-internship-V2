
import { loadStripe } from "@stripe/stripe-js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

const stripePromise = loadStripe("pk_test_51RtLJQLaXqGfXK4J67ZQzxhu5CZRhVsCB8cfKMeJDJxiRqeZ7Vjc1AG3BuQ4HE09EAd0RXQcZUgm3rE8aShjoEc800wPHDcsPg");

export const redirectToStripeCheckout = async (
  priceId: string,
  email: string
) => {
  const functions = getFunctions(getApp());
  const createCheckoutSession = httpsCallable(functions, "createCheckoutSession");

  try {
    const result = await createCheckoutSession({ priceId, email });
    const sessionId = (result.data as any).sessionId;

    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId });
  } catch (error) {
    console.error("Stripe checkout error:", error);
  }
};
