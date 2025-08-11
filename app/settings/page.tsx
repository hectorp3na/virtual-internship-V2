"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/SearchBar";
import LoginModal from "../../components/LoginModal";
import SignUpModal from "../../components/SignUpModal";

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const { loading, isPremium, planName } = useSubscription(currentUser?.uid ?? null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const openLogin = () => { setIsSignUpModalOpen(false); setIsLoginModalOpen(true); };
  const openSignup = () => { setIsLoginModalOpen(false); setIsSignUpModalOpen(true); };
  const closeLogin = () => setIsLoginModalOpen(false);
  const closeSignup = () => setIsSignUpModalOpen(false);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) { console.error("Logout error:", e); }
  
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
          <div className="fixed inset-0 bg-transparent bg-opacity-40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 h-full w-[375px] max-w-full bg-[#f6f7fb] flex flex-col shadow-2xl"
                 style={{ minWidth: 320 }}>
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
            <SearchBar />
            <button
              className="block md:hidden ml-3 p-2 mb-6"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg width="32" height="32" fill="none" stroke="#032b41" strokeWidth="2" viewBox="0 0 24 24">
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
              <h1 className="text-[28px] md:text-[32px] font-bold text-[#03314b]">Settings</h1>
              <div className="mt-2 h-px w-full bg-[#e1e7ea]" />

              {/* Subscription */}
              <section className="py-6 border-b border-[#e1e7ea]">
                <div className="text-[#032b41] font-semibold mb-1">Your Subscription plan</div>
                {loading ? (
                  <div className="text-[#032b41]">Checking your plan…</div>
                ) : isPremium ? (
                  <div className="text-[#032b41]">{planName || "premium-plus"}</div>
                ) : (
                  <>
                    <div className="text-[#032b41] mb-3">Basic</div>
                    <a
                      href="/choose-plan"
                      className="inline-flex items-center rounded-md !bg-[#22c55e] px-4 py-2 text-md font-medium text-{#032b41} hover:brightness-95 active:translate-y-[1px] transition"
                    >
                      Upgrade to Premium
                    </a>
                  </>
                )}
              </section>

              {/* Email */}
              <section className="py-6 border-b border-[#e1e7ea]">
                <div className="text-[#032b41] font-semibold mb-1">Email</div>
                <div className="text-[#032b41]">{currentUser?.email ?? "—"}</div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function GatePrompt({ onLogin, title }: { onLogin: () => void; title?: string }) {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-[720px] px-4">
       
        <h1 className="text-[24px] md:text-[32px] font-bold text-[#03314b] text-left">
          {title || "This book"}
        </h1>
        <span className="block mt-2 h-[1px] w-full bg-[#e1e7ea]" />
        
        <div className="text-center">
          <img
            src="https://summarist.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogin.e313e580.png&w=1080&q=75"
            alt="Login required"
            className="mx-auto my-10 w-[420px] max-w-full"
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
