"use client";

import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/SearchBar";
import LoginModal from "../../components/LoginModal";

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const handleLoginClick = () => setIsLoginModalOpen(true);

  // Derive a simple plan label – adjust to your user model if needed
  const subscriptionPlan =
    (currentUser as any)?.isSubscribed ? "premium" : "free";

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="hidden md:block bg-white">
        <Sidebar
          activeSize={"small"}
          setActiveSize={() => {}}
          onLogoutClick={handleLogout}
          onLoginClick={handleLoginClick}
          currentUser={currentUser}
        />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-transparent bg-opacity-40 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="relative z-50 h-full w-[375px] max-w-full bg-[#f6f7fb] flex flex-col shadow-2xl animate-slide-in-left"
            style={{ minWidth: 320 }}
          >
            <Sidebar
              isDrawer
              activeSize={"small"}
              setActiveSize={() => {}}
              onLogoutClick={handleLogout}
              onLoginClick={handleLoginClick}
              currentUser={currentUser}
            />
          </aside>
        </div>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 py-6 px-4 ml-0 md:ml-[200px] overflow-y-auto">
        {/* Top header row with search */}
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
            <GatePrompt onLogin={handleLoginClick} title="Settings" />
          ) : (
            <>
              {/* Title */}
              <h1 className="text-[28px] md:text-[32px] font-bold text-[#03314b]">
                Settings
              </h1>
              <div className="mt-2 h-px w-full bg-[#e1e7ea]" />

              {/* Subscription section */}
              <section className="py-6 border-b border-[#e1e7ea]">
                <div className="text-[#032b41] font-semibold mb-1">
                  Your Subscription plan
                </div>
                <div className="text-[#032b41]">{
                  subscriptionPlan /* shows "premium" like screenshot if isSubscribed=true */
                }</div>
              </section>

              {/* Email section */}
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

/** GatePrompt reused with your styling */
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
        {/* Title aligned left */}
        <h1 className="text-[24px] md:text-[32px] font-bold text-[#03314b] text-left">
          {title || "This book"}
        </h1>
        <span className="block mt-2 h-[1px] w-full bg-[#e1e7ea]" />

        {/* Illustration & text centered */}
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
            className="mt-6 inline-flex h-10 w-[180px] items-center justify-center rounded-[4px] !bg-[#2bd97c] text-[16px] font-semibold text-[#032b41] transition-colors duration-200 hover:opacity-90"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
