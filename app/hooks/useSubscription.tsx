"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export function useSubscription(uid?: string | null) {
  const [loading, setLoading] = useState(!!uid);
  const [isPremium, setIsPremium] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      setIsPremium(false);
      setPlanName(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        const raw = snap.exists() ? snap.data()?.plan : undefined;
        const plan = typeof raw === "string" ? raw.trim().toLowerCase() : undefined;

        if (!cancelled) {
          const premiumSet = new Set(["premium", "premium-plus"]);
          setIsPremium(!!plan && premiumSet.has(plan));
          setPlanName(plan ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          console.warn("useSubscription:", e);
          setIsPremium(false);
          setPlanName(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [uid]);

  return { loading, isPremium, planName };
}
