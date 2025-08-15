"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "../../components/SearchBar";
import Sidebar from "../../components/Sidebar";
import SelectedForYou from "../../components/SelectedForYou";
import RecommendedForYou from "../../components/RecommendedForYou";
import SuggestedBooks from "../../components/SuggestedBooks";
import LoginModal from "../../components/LoginModal";
import SignUpModal from "../../components/SignUpModal";
import { ClockIcon } from "@heroicons/react/24/outline";

/* ------------------ Duration helpers (MM:SS like screenshot) ------------------ */
function toSeconds(input?: number | string | null): number | null {
  if (input == null) return null;
  if (typeof input === "number" && Number.isFinite(input)) return input;

  if (typeof input === "string") {
    const trimmed = input.trim().toLowerCase();

    const parts = trimmed.split(":");
    if (parts.length === 2 || parts.length === 3) {
      const nums = parts.map((p) => Number(p));
      if (nums.every((n) => Number.isFinite(n))) {
        if (parts.length === 2) {
          const [mm, ss] = nums;
          return mm * 60 + ss;
        } else {
          const [hh, mm, ss] = nums;
          return hh * 3600 + mm * 60 + ss;
        }
      }
    }

    const minMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)$/);
    if (minMatch) return Math.round(parseFloat(minMatch[1]) * 60);

    if (!Number.isNaN(Number(trimmed))) {
      const n = Number(trimmed);
      return n >= 1000 ? n : Math.round(n * 60);
    }
  }
  return null;
}

function formatClock(secs?: number | null): string {
  if (secs == null || !Number.isFinite(secs) || secs <= 0) return "-";
  const total = Math.round(secs);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const pad2 = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}

export function DurationText({
  duration,
  className = "flex items-center gap-1 text-[#032b41] text-[14px] font-semibold",
}: {
  duration?: number | string | null;
  className?: string;
}) {
  const [label, setLabel] = useState<string>("-");
  useEffect(() => {
    const secs = toSeconds(duration);
    setLabel(formatClock(secs));
  }, [duration]);

  return (
    <span className={className}>
      <ClockIcon className="w-4 h-4" />
      <span>{label}</span>
    </span>
  );
}

export { toSeconds as toBookSeconds, formatClock as formatBookClock };
/* ----------------------------------------------------------------------------- */

function useAuthModals() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

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

  return {
    isLoginModalOpen,
    isSignUpModalOpen,
    openLogin,
    openSignup,
    closeLogin,
    closeSignup,
  };
}

export default function ForYouPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [activeSize, setActiveSize] = useState<
    "small" | "medium" | "large" | "xlarge"
  >("small");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    isLoginModalOpen,
    isSignUpModalOpen,
    openLogin,
    openSignup,
    closeLogin,
    closeSignup,
  } = useAuthModals();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:block bg-white">
        <Sidebar
          activeSize={activeSize}
          setActiveSize={setActiveSize}
          onLogoutClick={handleLogout}
          onLoginClick={openLogin}
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
              activeSize={activeSize}
              setActiveSize={setActiveSize}
              onLogoutClick={handleLogout}
              onLoginClick={openLogin}
              currentUser={currentUser}
            />
          </aside>
        </div>
      )}

      {/* Auth Modals */}
      {isLoginModalOpen && (
        <LoginModal onClose={closeLogin} onOpenSignup={openSignup} />
      )}
      {isSignUpModalOpen && (
        <SignUpModal onClose={closeSignup} onOpenLogin={openLogin} />
      )}

      {/* Main Content */}
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

        {/* You can now use <DurationText duration={book.duration} /> inside your lists */}
        <div className="mt-10">
          <SelectedForYou />
        </div>
        <div className="mt-10">
          <RecommendedForYou />
        </div>
        <div className="mt-10">
          <SuggestedBooks />
        </div>
      </main>
    </div>
  );
}
