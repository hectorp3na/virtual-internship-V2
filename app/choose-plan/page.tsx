"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

import { app } from "../../firebase";
import Footer from "components/Footer";
import PlanHeader from "../../components/PlanHeader";
import PlanFeatures from "../../components/PlanFeatures";
import PlanFAQs from "../../components/PlanFAQs";

const FUNCTION_URL = "https://createcheckoutsessionv2-knryqcxbba-uc.a.run.app";

const monthlyPriceId = "price_1RtNU9LaXqGfXK4JikVfj19M";
const yearlyPriceId = "price_1RtNT9LaXqGfXK4JpjOyFOQA";

const PRICE_LABELS: Record<string, string> = {
  [monthlyPriceId]: "Premium Monthly",
  [yearlyPriceId]: "Premium Plus Yearly",
};

type UserDoc = {
  uid: string;
  role?: string | null;
  subscriptionStatus?: string | null;
  subscriptionPlanName?: string | null;
  subscriptionPlan?: string | null;
  priceId?: string | null;
  productId?: string | null;
};

function humanPlanName(u?: Partial<UserDoc>): string {
  if (!u) return "Free";
  const explicit = u.subscriptionPlanName;
  if (explicit && explicit.trim()) return explicit;

  const subPlan = u.subscriptionPlan;
  if (subPlan && !String(subPlan).startsWith("price_")) return String(subPlan);

  const fromPrice = u.priceId ? PRICE_LABELS[u.priceId] : undefined;
  if (fromPrice) return fromPrice;

  if (
    u.subscriptionStatus === "active" ||
    u.subscriptionStatus === "trialing" ||
    u.role === "premium"
  ) {
    return "Premium";
  }
  return "Free";
}

function activePriceId(u?: Partial<UserDoc>): string | null {
  if (!u) return null;
  const isActive =
    u.subscriptionStatus === "active" ||
    u.subscriptionStatus === "trialing" ||
    u.role === "premium";
  return isActive && u.priceId ? u.priceId : null;
}

export default function ChoosePlanPage() {
  const router = useRouter();
  const auth = useMemo(() => getAuth(app), []);
  const db = useMemo(() => getFirestore(app), []);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(
    auth.currentUser
  );
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [isVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">(
    "yearly"
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setFirebaseUser(u));
    return () => unsubAuth();
  }, [auth]);

  useEffect(() => {
    if (!firebaseUser) {
      setUserDoc(null);
      return;
    }
    const ref = doc(db, "users", firebaseUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() as UserDoc | undefined;
      setUserDoc(data ?? null);

      const active = activePriceId(data ?? undefined);
      if (active === monthlyPriceId) setSelectedPlan("monthly");
      if (active === yearlyPriceId) setSelectedPlan("yearly");
    });
    return () => unsub();
  }, [db, firebaseUser]);

  const currentPlanName = humanPlanName(userDoc ?? undefined);
  const currentActivePrice = activePriceId(userDoc ?? undefined);

  const handlePlanSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push("?auth=login", { scroll: false });
      return;
    }

    const selectedPriceId =
      selectedPlan === "monthly" ? monthlyPriceId : yearlyPriceId;

    try {
      setSubmitting(true);

      const idToken = await user.getIdToken();

      const resp = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ priceId: selectedPriceId }),
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        throw new Error(`Checkout HTTP ${resp.status} ${errText}`);
      }

      const data: { url?: string; sessionId?: string; error?: string } =
        await resp.json();

      if (!data?.url) {
        throw new Error(data?.error || "No Checkout URL returned");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const planCard = (
    key: "monthly" | "yearly",
    title: string,
    priceLabel: string,
    subtitle: string,
    priceId: string
  ) => {
    const isSelected = selectedPlan === key;
    const isCurrent = currentActivePrice === priceId;
    return (
      <div
        onClick={() => setSelectedPlan(key)}
        className={`flex gap-6 p-6 bg-[#f1f6f4] border-[4px] rounded cursor-pointer max-w-[680px] w-full transition-colors duration-200 ${
          isSelected ? "border-[#2be080]" : "border-[#bac8ce]"
        }`}
      >
        <div className="relative w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
          {isSelected && (
            <div className="absolute w-[6px] h-[6px] bg-black rounded-full" />
          )}
        </div>
        <div className="plan__card--content flex-1">
          <div className="text-[16px] md:text-[18px] font-semibold text-[#032b41] mb-2 flex items-center gap-2">
            <span>{title}</span>
            {isCurrent && (
              <span className="text-[11px] inline-block px-2 py-0.5 rounded-full bg-[#2be080] text-[#032b41] font-semibold">
                Current plan
              </span>
            )}
          </div>
          <div className="text-[20px] md:text-[24px] font-bold text-[#032b41] mb-2">
            {priceLabel}
          </div>
          <div className="text-[12px] md:text-[14px] text-[#6b757b]">
            {subtitle}
          </div>
        </div>
      </div>
    );
  };

  const ctaLabel = useMemo(() => {
    if (submitting) return "Starting checkout...";
    if (!firebaseUser) return "Sign in to continue";

    const selectedPriceId =
      selectedPlan === "monthly" ? monthlyPriceId : yearlyPriceId;
    const isCurrent = currentActivePrice === selectedPriceId;
    if (isCurrent) return "You already have this plan";

    return selectedPlan === "monthly"
      ? "Start your first month"
      : "Start your free 7-day trial";
  }, [submitting, firebaseUser, selectedPlan, currentActivePrice]);

  const ctaDisabled =
    submitting ||
    (!!firebaseUser &&
      currentActivePrice ===
        (selectedPlan === "monthly" ? monthlyPriceId : yearlyPriceId));

  return (
    <>
      <div className="relative flex flex-col items-center justify-center w-full transition-all">
        <div
          className={`fixed top-0 left-0 w-full h-full bg-[#3a4649] transition-opacity duration-400 ease-linear z-10 ${
            isVisible
              ? "opacity-65 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        ></div>

        <div className="w-full">
          <PlanHeader />

          <div className="max-w-[1070px] w-full mx-auto px-6 py-10">
            <PlanFeatures />

            {/* Current plan banner */}
            <div className="max-w-[680px] mx-auto w-full mb-6">
              <div className="w-full rounded-lg border border-[#dfe6e9] bg-white p-4 flex items-center justify-between">
                <div className="text-[14px] md:text-[16px] text-[#032b41]">
                  <span className="font-semibold">Current plan: </span>
                  <span>{currentPlanName}</span>
                </div>
                {firebaseUser ? (
                  <div className="text-[12px] text-[#6b757b]">
                    {userDoc?.subscriptionStatus ?? "free"}
                  </div>
                ) : (
                  <button
                    className="text-[12px] font-semibold underline"
                    onClick={() =>
                      router.push("?auth=login", { scroll: false })
                    }
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>

            <div className="text=[24px] md:text-[32px] text-[#032b41] text-center mb-8 font-bold">
              Choose the plan that fits you
            </div>

            <div className="flex flex-col gap-4 items-center justify-center">
              {planCard(
                "yearly",
                "Premium Plus Yearly",
                "$99.99/year",
                "7-day free trial included",
                yearlyPriceId
              )}

              {/* Separator */}
              <div className="text-[14px] text-[#6b757b] flex items-center gap-2 max-w-[240px] my-6 mx-auto w-full">
                <div className="flex-1 border-t border-[#ddd]" />
                <div className="plan__separator px-2">or</div>
                <div className="flex-1 border-t border-[#ddd]" />
              </div>

              {planCard(
                "monthly",
                "Premium Monthly",
                "$9.99/month",
                "No trial included",
                monthlyPriceId
              )}

              {/* CTA */}
              <div className="trial-cta-container mt-2">
                <span className="btn--wrapper">
                  <button
                    className="trial-button disabled:opacity-60 disabled:pointer-events-none"
                    onClick={handlePlanSubmit}
                    disabled={ctaDisabled}
                    aria-busy={submitting}
                  >
                    <span>{ctaLabel}</span>
                  </button>
                </span>
                <div className="text-[12px] text-[#6b757b] text-center mt-2">
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
