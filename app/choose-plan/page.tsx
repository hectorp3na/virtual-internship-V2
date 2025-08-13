"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

import { app } from "../../firebase";
import Footer from "components/Footer";
import PlanHeader from "../../components/PlanHeader";
import PlanFeatures from "../../components/PlanFeatures";
import PlanFAQs from "../../components/PlanFAQs";

const FUNCTIONS_REGION = "us-central1";
const FUNCTION_NAME = "createCheckoutSessionV2";


const monthlyPriceId = "price_1RtNU9LaXqGfXK4JikVfj19M";
const yearlyPriceId  = "price_1RtNT9LaXqGfXK4JpjOyFOQA";

export default function ChoosePlanPage() {
  const router = useRouter();

  const [isVisible,] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");
  const [submitting, setSubmitting] = useState(false);

  const handlePlanSubmit = async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      router.push("?auth=login", { scroll: false });
      return;
    }

    const selectedPriceId = selectedPlan === "monthly" ? monthlyPriceId : yearlyPriceId;

    try {
      setSubmitting(true);

      const functions = getFunctions(app, FUNCTIONS_REGION);
      const createCheckoutSession = httpsCallable<
        { priceId: string },
        { url?: string; sessionId: string }
      >(functions, FUNCTION_NAME);

      const { data } = await createCheckoutSession({ priceId: selectedPriceId });

      if (!data?.url) {
        throw new Error("No Checkout URL returned");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative flex flex-col items-center justify-center w-full transition-all">
        <div
          className={`fixed top-0 left-0 w-full h-full bg-[#3a4649] transition-opacity duration-400 ease-linear z-10 ${
            isVisible ? "opacity-65 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        ></div>

        <div className="w-full">
          <PlanHeader />

          <div className="max-w-[1070px] w-full mx-auto px-6 py-10">
            <PlanFeatures />

            <div className="text-[24px] md:text-[32px] text-[#032b41] text-center mb-8 font-bold">
              Choose the plan that fits you
            </div>

            <div className="flex flex-col gap-4 items-center justify-center">
              {/* Yearly Plan */}
              <div
                onClick={() => setSelectedPlan("yearly")}
                className={`flex gap-6 p-6 bg-[#f1f6f4] border-[4px] rounded cursor-pointer max-w-[680px] w-full transition-colors duration-200 ${
                  selectedPlan === "yearly" ? "border-[#2be080]" : "border-[#bac8ce]"
                }`}
              >
                <div className="relative w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
                  {selectedPlan === "yearly" && (
                    <div className="absolute w-[6px] h-[6px] bg-black rounded-full" />
                  )}
                </div>
                <div className="plan__card--content">
                  <div className="text-[16px] md:text-[18px] font-semibold text-[#032b41] mb-2">
                    Premium Plus Yearly
                  </div>
                  <div className="text-[20px] md:text-[24px] font-bold text-[#032b41] mb-2">
                    $99.99/year
                  </div>
                  <div className="text-[12px] md:text-[14px] text-[#6b757b]">
                    7-day free trial included
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="text-[14px] text-[#6b757b] flex items-center gap-2 max-w-[240px] my-6 mx-auto w-full">
                <div className="flex-1 border-t border-[#ddd]" />
                <div className="plan__separator px-2">or</div>
                <div className="flex-1 border-t border-[#ddd]" />
              </div>

              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedPlan("monthly")}
                className={`flex gap-6 p-6 bg-[#f1f6f4] border-[4px] rounded cursor-pointer max-w-[680px] w-full transition-colors duration-200 ${
                  selectedPlan === "monthly" ? "border-[#2be080]" : "border-[#bac8ce]"
                }`}
              >
                <div className="relative w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
                  {selectedPlan === "monthly" && (
                    <div className="absolute w-[6px] h-[6px] bg-black rounded-full" />
                  )}
                </div>
                <div className="plan__card--content">
                  <div className="text-[16px] md:text-[18px] font-semibold text-[#032b41] mb-2">
                    Premium Monthly
                  </div>
                  <div className="text-[20px] md:text-[24px] font-bold text-[#032b41] mb-2">
                    $9.99/month
                  </div>
                  <div className="text-[12px] md:text-[14px] text-[#6b757b]">
                    No trial included
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="trial-cta-container">
                <span className="btn--wrapper">
                  <button
                    className="trial-button"
                    onClick={handlePlanSubmit}
                    disabled={submitting}
                    aria-busy={submitting}
                  >
                    <span>
                      {selectedPlan === "monthly"
                        ? "Start your first month"
                        : "Start your free 7-day trial"}
                    </span>
                  </button>
                </span>
                <div className="text-[12px] text-[#6b757b] text-center">
                  {selectedPlan === "monthly"
                    ? "30-day money back guarantee, no questions asked."
                    : "Cancel your trial at any time before it ends, and you won’t be charged."}
                </div>
              </div>
            </div>

            <PlanFAQs />
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
}
