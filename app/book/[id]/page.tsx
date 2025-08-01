"use client";
import { useEffect, useState } from "react";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import LoginModal from "../../../components/LoginModal";
import { useAuth } from "../../../app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import SearchBar from "../../../components/SearchBar";
import {
  ClockIcon,
  StarIcon,
  MicrophoneIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

type Book = {
  id: string;
  title: string;
  author: string;
  subTitle?: string;
  imageLink?: string;
  img?: string;
  duration?: string;
  totalRating?: number;
  averageRating?: number;
  keyIdeas?: number;
  type?: string;
  status?: string;
  summary?: string;
  tags?: string[];
  bookDescription?: string;
  authorDescription?: string;
  subscriptionRequired?: boolean;
  audioLink?: string;
};

export default function BookPage() {
  const { openAuth } = useAuthModal();
  const params = useParams();
  const id = params.id as string | undefined;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const handleReadOrListen = (type: "read" | "listen") => {
    if (!user) {
      openAuth();
      return;
    }
    if (book?.subscriptionRequired && !user.isSubscribed) {
      router.push("/choose-plan");
      return;
    }
    // If user is subscribed or book is free
    router.push(`/player/${book.id}`);
  };

  // For add to library:
  const handleAddToLibrary = () => {
    if (!user) {
      openAuth();
      return;
    }
    alert("Added to library!");
  };

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
      <aside className="bg-white">
        <Sidebar />
      </aside>
      {/* Main Content */}
      <main className="flex-1 px-8 py-6 ml-[200px]">
        <SearchBar />
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row pt-6 gap-8">
          {/* Book Info: ORDER FIRST ON DESKTOP */}
          <div className="flex-1 min-w-0 order-2 lg:order-1">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 w-3/4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 w-2/3 bg-gray-100 rounded mb-4"></div>
                <div className="border-t border-b border-[#e1e7ea] py-4 mb-6">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-5 w-32 bg-gray-200 rounded mb-2"
                      ></div>
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
                      {book.duration || "-"}
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
                    className="  flex items-center
    justify-center
    w-[144px]
    h-[48px]
    !bg-[#032b41]
    text-white
    text-[18px]
    rounded
    cursor-pointer
    gap-2
    transition
    duration-200
    opacity-100
    hover:opacity-80"
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 1024 1024"
                      height="1.5em"
                      width="2em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M928 161H699.2c-49.1 0-97.1 14.1-138.4 40.7L512 233l-48.8-31.3A255.2 255.2 0 0 0 324.8 161H96c-17.7 0-32 14.3-32 32v568c0 17.7 14.3 32 32 32h228.8c49.1 0 97.1 14.1 138.4 40.7l44.4 28.6c1.3.8 2.8 1.3 4.3 1.3s3-.4 4.3-1.3l44.4-28.6C602 807.1 650.1 793 699.2 793H928c17.7 0 32-14.3 32-32V193c0-17.7-14.3-32-32-32zM324.8 721H136V233h188.8c35.4 0 69.8 10.1 99.5 29.2l48.8 31.3 6.9 4.5v462c-47.6-25.6-100.8-39-155.2-39zm563.2 0H699.2c-54.4 0-107.6 13.4-155.2 39V298l6.9-4.5 48.8-31.3c29.7-19.1 64.1-29.2 99.5-29.2H888v488zM396.9 361H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm223.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c0-4.1-3.2-7.5-7.1-7.5H627.1c-3.9 0-7.1 3.4-7.1 7.5zM396.9 501H211.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5zm416 0H627.1c-3.9 0-7.1 3.4-7.1 7.5v45c0 4.1 3.2 7.5 7.1 7.5h185.7c3.9 0 7.1-3.4 7.1-7.5v-45c.1-4.1-3.1-7.5-7-7.5z"></path>
                    </svg>
                    Read
                  </button>
                  <button
                    onClick={() => handleReadOrListen("listen")}
                    className="  flex
    items-center
    justify-center
    w-[144px]
    h-12
    !bg-[#032b41]
    text-white
    text-[18px]
    rounded
    cursor-pointer
    gap-2
    transition
    duration-200
    opacity-100
    hover:opacity-80"
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 1024 1024"
                      height="1.5em"
                      width="1.5em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M842 454c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8 0 140.3-113.7 254-254 254S258 594.3 258 454c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8 0 168.7 126.6 307.9 290 327.6V884H326.7c-13.7 0-24.7 14.3-24.7 32v36c0 4.4 2.8 8 6.2 8h407.6c3.4 0 6.2-3.6 6.2-8v-36c0-17.7-11-32-24.7-32H548V782.1c165.3-18 294-158 294-328.1zM512 624c93.9 0 170-75.2 170-168V232c0-92.8-76.1-168-170-168s-170 75.2-170 168v224c0 92.8 76.1 168 170 168zm-94-392c0-50.6 41.9-92 94-92s94 41.4 94 92v224c0 50.6-41.9 92-94 92s-94-41.4-94-92V232z"></path>
                    </svg>
                    Listen
                  </button>
                </div>
                <button
                  onClick={handleAddToLibrary}
                  className="flex items-center text-blue-600 hover:text-blue-900 text-lg font-semibold mb-7 hover:underline transition-colors duration-200 gap-2"
                >
                  <svg
                    height="2em"
                    width="1.5em"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    viewBox="0 0 22 22"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 5v14l7-5 7 5V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"
                    /> 
                  </svg>
                  Add title to My Library
                </button>

                {/* Book description */}
                <div className="mb-7">
                  <h3 className="text-lg font-bold text-[#032b41] mb-2">
                    What's it about?
                  </h3>
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
                  <h3 className="text-lg font-bold text-[#032b41] mb-2">
                    About the author
                  </h3>
                  <div className="text-[#032b41] text-base whitespace-pre-line">
                    {book.authorDescription}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-400">Book not found.</div>
            )}
          </div>
          {/* Book Cover: ORDER SECOND ON DESKTOP */}
          <div className="flex justify-center lg:block flex-shrink-0 mb-6 lg:mb-0 order-1 lg:order-2">
            {loading ? (
              <div className="w-64 h-80 bg-gray-200 animate-pulse rounded-md relative" />
            ) : (
              book && (
                <figure className="w-64 h-80 relative rounded-md flex items-center justify-center">
                  <img
                    src={book.imageLink || book.img || "/fallback.jpg"}
                    alt={book.title}
                    className="w-full object-cover rounded-md"
                  />
                  {/* Arc background */}
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
