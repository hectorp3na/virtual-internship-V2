"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import LoginModal from "../../../components/LoginModal";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "../../../components/Sidebar";
import SearchBar from "../../../components/SearchBar";
import SignUpModal from "../../../components/SignUpModal";
import {
  ClockIcon,
  StarIcon,
  MicrophoneIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useMembership } from "@/hooks/useMembership";

type Book = {
  id: string;
  title: string;
  author: string;
  subTitle?: string;
  imageLink?: string;
  img?: string;
  duration?: string | number | null;
  totalRating?: number;
  averageRating?: number;
  keyIdeas?: number;
  type?: string;
  status?: string;
  summary?: string;
  tags?: string[];
  bookDescription?: string;
  authorDescription?: string;
  subscriptionRequired?: boolean | string | number;
  audioLink?: string;
};

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

function useAudioDuration(src?: string) {
  const [secs, setSecs] = useState<number | null>(null);

  useEffect(() => {
    if (!src) { setSecs(null); return; }

    const a = new Audio();
    a.preload = "metadata";
    a.src = src;

    const onLoaded = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) setSecs(a.duration);
    };
    const onError = () => setSecs(null);

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("error", onError);
    a.load?.();

    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("error", onError);
      a.src = "";
    };
  }, [src]);

  return secs;
}

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

  return { isLoginModalOpen, isSignUpModalOpen, openLogin, openSignup, closeLogin, closeSignup };
}

const toBool = (v: any) => v === true || v === "true" || v === 1 || v === "1";

export default function BookPage() {
 
  const params = useParams();
  const id = params.id as string | undefined;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const { user: currentUser } = useAuth();
  const { isPremium, loading: membershipLoading } = useMembership(currentUser);
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSize, setActiveSize] = useState<"small" | "medium" | "large" | "xlarge">("small");

  const {
    isLoginModalOpen,
    isSignUpModalOpen,
    openLogin,
    openSignup,
    closeLogin,
    closeSignup,
  } = useAuthModals();


  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(
          `https://us-central1-summaristt.cloudfunctions.net/getBook?id=${id}`
        );
        const data = await res.json();
        setBook(data);
      } catch (e) {
        console.error("Failed to fetch book:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleReadOrListen = (_type: "read" | "listen") => {
    if (!currentUser) {
      openLogin();
      return;
    }
    if (membershipLoading) return;

    const isPremiumBook = toBool(book?.subscriptionRequired);

    if (isPremiumBook && !isPremium) {
      router.push("/choose-plan");
      return;
    }

    router.push(`/player/${book!.id}`);
  };

  const handleAddToLibrary = () => {
    if (!currentUser) {
      openLogin();
      return;
    }
    alert("Added to library!");
  };

  const audioSecs = useAudioDuration(book?.audioLink);
  const secondsFromApi = toSeconds(book?.duration);
  const durationClock = formatClock(secondsFromApi ?? audioSecs);

  return (
    <div className="flex min-h-screen bg-white">
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
      <main className="flex-1 px-8 py-6 ml-0 md:ml-[200px]">
        <div className="border-b border-[#e1e7ea] mb-6 w-full flex items-center justify-end">
          <div className="flex items-center gap-2">
            <SearchBar
              onSelect={(b) => {
                const href = `/book/${encodeURIComponent(b.id)}`;
                router.push(href);
              }}
            />
            {/* Burger menu for mobile */}
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

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row pt-6 gap-8">
          <div className="flex-1 min-w-0 order-2 lg:order-1">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 w-3/4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 w-2/3 bg-gray-100 rounded mb-4"></div>
                <div className="border-t border-b border-[#e1e7ea] py-4 mb-6">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                    ))}
                  </div>
                </div>
                <div className="h-11 w-28 bg-gray-200 rounded mb-3"></div>
                <div className="h-11 w-28 bg-gray-100 rounded mb-3"></div>
                <div className="h-6 w-1/2 bg-gray-100 rounded mb-5"></div>
                <div className="h-8 w-40 bg-gray-100 rounded mb-2"></div>
                <div className="h-32 w-full bg-gray-50 rounded"></div>
              </div>
            ) : book ? (
              <>
                <h1 className="text-[32px] font-bold text-[#03314b] leading-tight mb-3">
                  {book.title}
                </h1>
                <div className="font-semibold text-[16px] text-gray-800 mb-3">
                  {book.author}
                </div>
                <div className="text-[#032b41] text-xl mb-4">
                  {book.subTitle}
                </div>

                {/* Book stats */}
                <div className="border-t border-b border-[#e1e7ea] py-4 mb-6">
                  <div className="grid grid-cols-2 gap-y-2 text-[#032b41] text-[15px] font-semibold">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-5 h-5 mr-1" />
                      <span>
                        {book.averageRating?.toFixed(1) || "-"}{" "}
                        <span className="font-normal text-[#032b41]">
                          ({book.totalRating || 0} ratings)
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-5 h-5 mr-1" />
                      <span>{durationClock}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MicrophoneIcon className="w-5 h-5 mr-1" />
                      Audio & Text
                    </div>
                    <div className="flex items-center gap-1">
                      <SparklesIcon className="w-5 h-5 mr-1" />
                      {book.keyIdeas || 0} Key ideas
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => handleReadOrListen("read")}
                    disabled={membershipLoading}
                    aria-disabled={membershipLoading}
                    className="flex items-center justify-center w-[144px] h-[48px] !bg-[#032b41] text-white text-[18px] rounded cursor-pointer gap-2 transition duration-200 opacity-100 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1.5em" width="2em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M928 161H699.2c-49.1 0-97.1 14.1-138.4 40.7L512 233l-48.8-31.3A255.2 255.2 0 0 0 324.8 161H96c-17.7 0-32 14.3-32 32v568c0 17.7 14.3 32 32 32h228.8c49.1 0 97.1 14.1 138.4 40.7l44.4 28.6c1.3.8 2.8 1.3 4.3 1.3s3-.4 4.3-1.3l44.4-28.6C602 807.1 650.1 793 699.2 793H928c17.7 0 32-14.3 32-32V193c0-17.7-14.3-32-32-32zM324.8 721H136V233h188.8c35.4 0 69.8 10.1 99.5 29.2l48.8 31.3 6.9 4.5v462c-47.6-25.6-100.8-39-155.2-39zm563.2 0H699.2c-54.4 0-107.6 13.4-155.2 39V298l6.9-4.5 48.8-31.3c29.7-19.1 64.1-29.2 99.5-29.2H888v488zM396.9 361H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm223.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c0-4.1-3.2-7.5-7.1-7.5H627.1c-3.9 0-7.1 3.4-7.1 7.5zM396.9 501H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5z"></path>
                    </svg>
                    Read
                  </button>

                  <button
                    onClick={() => handleReadOrListen("listen")}
                    disabled={membershipLoading}
                    aria-disabled={membershipLoading}
                    className="flex items-center justify-center w-[144px] h-12 !bg-[#032b41] text-white text-[18px] rounded cursor-pointer gap-2 transition duration-200 opacity-100 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
                      <path d="M842 454c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8 0 140.3-113.7 254-254 254S258 594.3 258 454c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8 0 168.7 126.6 307.9 290 327.6V884H326.7c-13.7 0-24.7 14.3-24.7 32v36c0 4.4 2.8 8 6.2 8h407.6c3.4 0 6.2-3.6 6.2-8v-36c0-17.7-11-32-24.7-32H548V782.1c165.3-18 294-158 294-328.1zM512 624c93.9 0 170-75.2 170-168V232c0-92.8-76.1-168-170-168s-170 75.2-170 168v224c0 92.8 76.1 168 170 168zm-94-392c0-50.6 41.9-92 94-92s94 41.4 94 92v224c0 50.6-41.9 92-94 92s-94-41.4-94-92V232z"></path>
                    </svg>
                    Listen
                  </button>
                </div>



                {/* Book description */}
                <div className="mb-7">
                  <h3 className="text-lg font-bold text-[#032b41] mb-2">What{"'"}s it about?</h3>
                  <div className="flex flex-wrap gap-3 mb-5">
                    {book.tags?.map((tag) => (
                      <div
                        key={tag}
                        className="bg-[#f1f6f4] px-4 py-2 rounded font-semibold text-[#032b41] text-[16px] cursor-not-allowed"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                  <div className="text-[#032b41] text-base whitespace-pre-line">
                    {book.bookDescription}
                  </div>
                </div>

                {/* About the author */}
                <div>
                  <h3 className="text-lg font-bold text-[#032b41] mb-2">About the author</h3>
                  <div className="text-[#032b41] text-base whitespace-pre-line">
                    {book.authorDescription}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-400">Book not found.</div>
            )}
          </div>

          {/* Book Cover */}
          <div className="flex justify-center lg:block flex-shrink-0 mb-6 lg:mb-0 order-1 lg:order-2">
            {loading ? (
              <div className="w-64 h-80 bg-gray-200 animate-pulse rounded-md relative" />
            ) : (
              book && (
                <figure className="w-64 h-80 relative rounded-md flex items-center justify-center">
                  <Image
                    src={book.imageLink || book.img || "/fallback.jpg"}
                    alt={book.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 420px"
                    className="w-full object-cover rounded-md"
                  />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-24 rounded-b-[48%] bg-[#e06e6e] -z-10"></div>
                </figure>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
