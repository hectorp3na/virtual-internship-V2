"use client";
import { useEffect, useState } from "react";
import { ClockIcon, StarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

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
  audioLink?: string;
  subscriptionRequired?: boolean;
};

export default function RecommendedForYou() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await fetch(
          "https://us-central1-summaristt.cloudfunctions.net/getBooks?status=recommended"
        );
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-[22px] font-semibold text-gray-900">Recommended For You</h2>
      <p className="text-md text-gray-500 mb-4">We think you’ll like these</p>

      {loading ? (
        <div className="flex overflow-x-auto gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex-none w-56 bg-white rounded-lg shadow-sm border-0 p-3 relative animate-pulse"
            >
              <div className="absolute top-1 right-1 bg-gray-300 rounded-full h-5 w-16"></div>
              <div className="w-full h-40 mb-3 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5 mb-2"></div>
              <div className="flex items-center justify-between mt-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4 scroll-snap-x scroll-snap-mandatory mb-8">
          {books.map((book) => (
            <RecommendedCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecommendedCard({ book }: { book: Book }) {
  const audioSecs = useAudioDuration(book.audioLink);
  const secondsFromApi = toSeconds(book.duration);
  const durationClock = formatClock(secondsFromApi ?? audioSecs);

  return (
    <Link
      href={`/book/${book.id}`}
      className="flex-none w-56 bg-white rounded-lg shadow-sm border-0 p-3 relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:scale-[1.025] hover:bg-gray-100"
    >
      {book.subscriptionRequired && (
        <div className="absolute top-1 right-1 bg-[#032b41] text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
          Premium
        </div>
      )}

      <figure className="h-40 mb-3">
        <img
          className="w-full h-full object-cover rounded"
          src={book.imageLink || book.img || "/fallback.jpg"}
          alt={book.title}
        />
      </figure>

      <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">
        {book.title}
      </h3>
      <p className="text-xs text-gray-500">{book.author}</p>
      <p className="text-xs text-gray-400 mt-1">{book.subTitle}</p>

      <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
        <div className="flex items-center space-x-1">
          <ClockIcon className="w-4 h-4" />
          <span>{durationClock}</span>
        </div>
        <div className="flex items-center space-x-1">
          <StarIcon className="w-4 h-4" />
          <span>{book.averageRating ?? "-"}</span>
        </div>
      </div>
    </Link>
  );
}
