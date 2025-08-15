"use client";

import { useEffect, useState } from "react";
import { auth, app } from "../../firebase";
import type { User as FirebaseUser } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

type MembershipState = {
  isPremium: boolean;
  loading: boolean;
  error?: string;
};

const db = getFirestore(app);

function isUserLike(u: any): u is { uid: string } {
  return !!u && typeof u.uid === "string";
}

function toPremium(uData: any): boolean {
  return (
    uData?.isSubscribed === true ||
    uData?.subscription?.status === "active" ||
    uData?.plan === "premium" ||
    uData?.role === "premium"
  );
}

export function useMembership(user?: FirebaseUser | any) {
  const [state, setState] = useState<MembershipState>({
    isPremium: false,
    loading: true,
  });

  useEffect(() => {
    const fbUser = isUserLike(user) ? user : auth.currentUser;
    if (!fbUser) {
      setState({ isPremium: false, loading: false });
      return;
    }

    const ref = doc(db, "users", fbUser.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data() || {};
        const isPremium = toPremium(data);
        setState({ isPremium, loading: false });
      },
      (err) => setState({ isPremium: false, loading: false, error: err.message })
    );

    return () => unsub();
  }, [user]);

  return state;
}
