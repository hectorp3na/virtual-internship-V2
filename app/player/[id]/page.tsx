"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "../../../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { useMembership } from "@/hooks/useMembership";
import Sidebar from "../../../components/Sidebar";
import SearchBar from "../../../components/SearchBar";
import AudioPlayer from "components/AudioPlayer";
import LoginModal from "../../../components/LoginModal";
import SignUpModal from "../../../components/SignUpModal";
import Image from "next/image";

const fontSizes = {
  small: 16,
  medium: 18,
  large: 22,
  xlarge: 26,
};

type Book = {
  id: string;
  title: string;
  author: string;
  summary?: string;
  audioLink?: string;
  imageLink?: string;
  subscriptionRequired?: boolean | string | number;
};

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

function PlayerSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="animate-pulse"
    >
      <div
        className="bg-gray-200 rounded mb-3"
        style={{ width: "70%", height: 28 }}
      />
      <div
        className="bg-gray-100 rounded mb-6"
        style={{ width: "35%", height: 16 }}
      />
      <div className="space-y-3">
        <div
          className="bg-gray-200 rounded"
          style={{ width: "100%", height: 16 }}
        />
        <div
          className="bg-gray-200 rounded"
          style={{ width: "95%", height: 16 }}
        />
        <div
          className="bg-gray-200 rounded"
          style={{ width: "90%", height: 16 }}
        />
        <div
          className="bg-gray-200 rounded"
          style={{ width: "98%", height: 16 }}
        />
        <div
          className="bg-gray-200 rounded"
          style={{ width: "82%", height: 16 }}
        />
      </div>
      <span className="sr-only">Loading book…</span>
    </div>
  );
}

const toBool = (v: unknown): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "true" || v === "1";
  if (typeof v === "number") return v === 1;
  return false;
};

export default function PlayerPage() {
  const params = useParams();
  const id = params.id as string | undefined;
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSizeKey, setFontSizeKey] =
    useState<keyof typeof fontSizes>("small");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    isLoginModalOpen,
    isSignUpModalOpen,
    openLogin,
    openSignup,
    closeLogin,
    closeSignup,
  } = useAuthModals();

  const { user: currentUser } = useAuth();
  const { isPremium, loading: membershipLoading } = useMembership(currentUser);

  const isLocked = !currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
   
    } catch (error) {
      console.error("Logout error:", error);
    }
  };


  useEffect(() => {
    if (!id) return;
    let alive = true;

    (async () => {
      try {
        const response = await fetch(
          `https://us-central1-summaristt.cloudfunctions.net/getBook?id=${encodeURIComponent(
            id
          )}`
        );
        const data = await response.json();
        if (alive) setBook(data);
      } catch (error) {
        console.error("Failed to fetch book:", error);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!book) return;
    if (!currentUser) return;
    if (membershipLoading) return;

    const isPremiumBook = toBool(book.subscriptionRequired);
    if (isPremiumBook && !isPremium) {
      const returnTo = encodeURIComponent(`/player/${id}`);
      router.replace(`/choose-plan?returnTo=${returnTo}`);
    }
  }, [book, currentUser, isPremium, membershipLoading, id, router]);

  const showLoading = loading || (currentUser && membershipLoading);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="hidden md:block bg-white">
        <Sidebar
          activeSize={fontSizeKey}
          setActiveSize={setFontSizeKey}
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
              activeSize={fontSizeKey}
              setActiveSize={setFontSizeKey}
              isDrawer
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
      <main className="flex-1 px-8 pt-6 pb-[200px] ml-0 md:ml-[200px] overflow-y-auto">
        <div className="border-b border-[#e1e7ea] mb-6 w-full flex items-center justify-end">
          <div className="flex items-center gap-2">
            <SearchBar
              onSelect={(b) => {
                const href = `/book/${encodeURIComponent(b.id)}`;
                router.push(href);
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

        <div className="max-w-3xl mx-auto">
          {showLoading ? (
            <PlayerSkeleton />
          ) : !book ? (
            <div className="text-gray-400">Book not found.</div>
          ) : isLocked ? (
            <GatePrompt
              onLogin={openLogin}
              onSignup={openSignup}
              title={book.title}
            />
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[#032b41] border-b border-[#e1e7ea] mb-8 pb-4 leading-[1.5]">
                {book.title}
              </h1>

              <div
                className="text-base text-[#032b41] max-w-3xl leading-[1.4] whitespace-pre-line"
                style={{
                  fontSize: fontSizes[fontSizeKey],
                  lineHeight: 1.4,
                  transition: "font-size 0.18s cubic-bezier(.65,.05,.36,1)",
                }}
              >
                {book.summary || "No summary available."}
              </div>

              <div className="relative mt-8">
                <AudioPlayer
                  src={book.audioLink || ""}
                  cover={book.imageLink}
                  title={book.title}
                  author={book.author}
                />
             
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function GatePrompt({
  onLogin,
  onSignup,
  title,
}: {
  onLogin: () => void;
  onSignup: () => void;
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
            className="mx-auto my-10 w-[420px] max-w-full"
            width={420}
            height={280}
          />

          <h2 className="mx-auto max-w-[640px] text-[22px] md:text-[26px] font-extrabold text-[#03314b] leading-snug">
            Log in to your account to read and listen to the book
          </h2>

          <button
            onClick={onLogin}
            className="mt-6 inline-flex h-10 w-[180px] items-center justify-center rounded-[4px] !bg-[#2bd97c] text-[16px] font-semibold text-[#032b41] transition-opacity duration-200 hover:opacity-90"
          >
            Login
          </button>
       
        </div>
      </div>
    </div>
  );
}
