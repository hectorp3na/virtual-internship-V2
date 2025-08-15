"use client";

import { useEffect, useState } from "react";
import { auth, app } from "../../firebase";
import type { User as FirebaseUser } from "firebase/auth";
import {
  getFirestore,
  doc,
  onSnapshot,
  type DocumentData,
  type DocumentSnapshot,
  type FirestoreError,
} from "firebase/firestore";

type MembershipState = {
  isPremium: boolean;
  loading: boolean;
  error?: string;
};

type BasicUser = Pick<FirebaseUser, "uid">;

type UserDoc = {
  isSubscribed?: boolean | null;
  subscription?: { status?: string | null } | null;
  plan?: string | null;
  role?: string | null;
} & Record<string, unknown>;

const db = getFirestore(app);

function isUserLike(u: unknown): u is BasicUser {
  return !!u && typeof (u as { uid?: unknown }).uid === "string";
}

function toPremium(uData: unknown): boolean {
  if (!uData || typeof uData !== "object") return false;
  const d = uData as UserDoc;
  return (
    d.isSubscribed === true ||
    d.subscription?.status === "active" ||
    d.plan === "premium" ||
    d.role === "premium"
  );
}

export function useMembership(user?: BasicUser | null) {
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
      (snap: DocumentSnapshot<DocumentData>) => {
        const data = (snap.data() ?? {}) as UserDoc;
        const isPremium = toPremium(data);
        setState({ isPremium, loading: false });
      },
      (err: FirestoreError) => {
        setState({ isPremium: false, loading: false, error: err.message });
      }
    );

    return () => unsub();
  }, [user]);

  return state;
}
