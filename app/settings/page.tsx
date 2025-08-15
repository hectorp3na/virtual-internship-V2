"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import { signOut } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { auth } from "../../firebase";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/SearchBar";
import LoginModal from "../../components/LoginModal";
import SignUpModal from "../../components/SignUpModal";
import Image from "next/image";

type UserDoc = {
  role?: string | null;
  subscriptionStatus?: string | null;
  subscriptionPlanName?: string | null;
  subscriptionPlan?: string | null;
  priceId?: string | null;
};

const PRICE_LABELS: Record<string, string> = {
  price_1RtNU9LaXqGfXK4JikVfj19M: "Premium Monthly",
  price_1RtNT9LaXqGfXK4JpjOyFOQA: "Premium Plus Yearly",
};

function computePlanName(user?: UserDoc, fallbackPremium?: boolean): string {
  if (user?.subscriptionPlanName?.trim()) return user.subscriptionPlanName!;
  if (
    user?.subscriptionPlan &&
    !String(user.subscriptionPlan).startsWith("price_")
  )
    return String(user.subscriptionPlan);
  if (user?.priceId && PRICE_LABELS[user.priceId])
    return PRICE_LABELS[user.priceId];
  return fallbackPremium ? "Premium" : "Basic";
}

export default function SettingsPage() {
   const router = useRouter();
  const { user: currentUser } = useAuth();
  const { loading, isPremium, planName } = useSubscription(
    currentUser?.uid ?? null
  );

  const db = useMemo(() => getFirestore(), []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);

  // Live Firestore subscription so UI updates right after webhook writes
  useEffect(() => {
    if (!currentUser?.uid) {
      setUserDoc(null);
      return;
    }
    const ref = doc(db, "users", currentUser.uid);
    const unsub = onSnapshot(ref, (snap) => {
      setUserDoc((snap.data() as UserDoc) ?? null);
    });
    return () => unsub();
  }, [db, currentUser?.uid]);

  // Derive premium from Firestore FIRST, then fall back to the hook
  const isPremiumFromDoc: boolean | undefined = userDoc
    ? userDoc.role === "premium" ||
      userDoc.subscriptionStatus === "active" ||
      userDoc.subscriptionStatus === "trialing"
    : undefined;

  const showPremium = (isPremiumFromDoc ?? isPremium) === true;

  // Prefer live Firestore name; fall back to hook’s planName; then generic
  const effectivePlanName =
    computePlanName(userDoc ?? undefined, showPremium) ||
    planName ||
    (showPremium ? "Premium" : "Basic");

  const openLogin = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };
  const openSignup = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };
  const closeLogin = () => setIsLoginModalOpen(false);
  const closeSignup = () => setIsSignUpModalOpen(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="hidden md:block bg-white">
        <Sidebar
          activeSize={"small"}
          setActiveSize={() => {}}
          onLogoutClick={handleLogout}
          onLoginClick={openLogin}
          currentUser={currentUser}
        />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-transparent bg-opacity-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="relative z-50 h-full w-[375px] max-w-full bg-[#f6f7fb] flex flex-col shadow-2xl"
            style={{ minWidth: 320 }}
          >
            <Sidebar
              isDrawer
              activeSize={"small"}
              setActiveSize={() => {}}
              onLogoutClick={handleLogout}
              onLoginClick={openLogin}
              currentUser={currentUser}
            />
          </aside>
        </div>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal onClose={closeLogin} onOpenSignup={openSignup} />
      )}

      {/* Sign Up Modal */}
      {isSignUpModalOpen && (
        <SignUpModal onClose={closeSignup} onOpenLogin={openLogin} />
      )}

      {/* Main */}
      <main className="flex-1 py-6 px-4 ml-0 md:ml-[200px] overflow-y-auto">
        <div className="border-b border-[#e1e7ea] mb-6 w-full flex items-center justify-end">
          <div className="flex items-center gap-2">
            <SearchBar
              onSelect={(b) => {
                const href = `/book/${encodeURIComponent(b.id)}`;
                if (
                  typeof window !== "undefined" &&
                  window.location.pathname === href
                ) {
                  router.replace(href);
                  router.refresh();
                } else {
                  router.push(href);
                }
              }}
            />
            <button
              className="block md:hidden ml-3 p-2 mb-6"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg
                width="32"
                height="32"
                fill="none"
                stroke="#032b41"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-[900px] px-6">
          {!currentUser ? (
            <GatePrompt onLogin={openLogin} title="Settings" />
          ) : (
            <>
              <h1 className="text-[28px] md:text-[32px] font-bold text-[#03314b]">
                Settings
              </h1>
              <div className="mt-2 h-px w-full bg-[#e1e7ea]" />

              {/* Subscription */}
              <section className="py-6 border-b border-[#e1e7ea]">
                <div className="text-[#032b41] font-semibold mb-1">
                  Your Subscription plan
                </div>

                {loading && userDoc === null ? (
                  <div className="text-[#032b41]">Checking your plan…</div>
                ) : showPremium ? (
                  <div className="flex items-center gap-2 text-[#032b41]">
                    <span className="font-semibold">{effectivePlanName}</span>
                    <span className="text-[11px] inline-block px-2 py-0.5 rounded-full bg-[#2be080] text-[#032b41] font-semibold">
                      {userDoc?.subscriptionStatus ?? "active"}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="text-[#032b41] mb-3">Basic</div>
                    <a
                      href="/choose-plan"
                      className="inline-flex items-center rounded-md !bg-[#22c55e] px-4 py-2 text-md font-medium text-[#032b41] hover:brightness-95 active:translate-y-[1px] transition"
                    >
                      Upgrade to Premium
                    </a>
                  </>
                )}
              </section>

              {/* Email */}
              <section className="py-6 border-b border-[#e1e7ea]">
                <div className="text-[#032b41] font-semibold mb-1">Email</div>
                <div className="text-[#032b41]">
                  {currentUser?.email ?? "—"}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function GatePrompt({
  onLogin,
  title,
}: {
  onLogin: () => void;
  title?: string;
}) {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-[720px] px-4">
        <h1 className="text-[24px] md:text-[32px] font-bold text-[#03314b] text-left">
          {title || "This book"}
        </h1>
        <span className="block mt-2 h-[1px] w-full bg-[#e1e7ea]" />

        <div className="text-center">
          <Image
            src="https://summarist.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogin.e313e580.png&w=1080&q=75"
            alt="Login required"
            width={420}
            height={420}
            className="mx-auto my-10 w-[420px] max-w-full"
            priority
          />

          <h2 className="mx-auto max-w-[640px] text-[22px] md:text-[26px] font-extrabold text-[#03314b] leading-snug">
            Log in to your account to see your details.
          </h2>

          <button
            onClick={onLogin}
            className="mt-6 inline-flex h-10 w-[180px] items-center justify-center rounded-[4px] !bg-[#2bd97c] text-[16px] font-semibold text-[#032b41] hover:opacity-90"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
