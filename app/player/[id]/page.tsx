"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { auth } from "../../../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "../../../components/Sidebar";
import SearchBar from "../../../components/SearchBar";
import AudioPlayer from "components/AudioPlayer";
import LoginModal from "../../../components/LoginModal";

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
};

export default function PlayerPage() {
  const params = useParams();
  const id = params.id as string | undefined;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSizeKey, setFontSizeKey] = useState<keyof typeof fontSizes>("small");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const { user: currentUser } = useAuth();
  const isLocked = !currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);

    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLoginClick = () => setIsLoginModalOpen(true);

  useEffect(() => {
    if (!id) return;
    async function fetchBook() {
      try {
        const response = await fetch(
          `https://us-central1-summaristt.cloudfunctions.net/getBook?id=${id}`
        );
        const data = await response.json();
        setBook(data);
      } catch (error) {
        console.error("Failed to fetch book:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [id]);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="hidden md:block bg-white">
        <Sidebar
          activeSize={fontSizeKey}
          setActiveSize={setFontSizeKey}
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
              activeSize={fontSizeKey}
              setActiveSize={setFontSizeKey}
              isDrawer
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

      {/* Main Content */}
      <main className="flex-1 px-8 pt-6 pb-[200px] ml-0 md:ml-[200px] overflow-y-auto">
        <div className="border-b border-[#e1e7ea] mb-6 w-full flex items-center justify-end">
          <div className="flex items-center gap-2">
            <SearchBar />
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

        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div>
              <div className="h-10 w-3/4 bg-gray-200 rounded mb-3 animate-pulse"></div>
              <div className="h-5 w-2/3 bg-gray-100 rounded mb-4 animate-pulse"></div>
            </div>
          ) : !book ? (
            <div className="text-gray-400">Book not found.</div>
          ) : isLocked ? (
            <GatePrompt onLogin={handleLoginClick} title={book.title} />
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
                {/* 
                  If you ever decide to render the player while locked,
                  uncomment the overlay below to intercept Play clicks:
                  
                  {isLocked && (
                    <button
                      type="button"
                      aria-label="Login to play"
                      onClick={handleLoginClick}
                      className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                    />
                  )}
                */}
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
            Log in to your account to read and listen to the book
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
