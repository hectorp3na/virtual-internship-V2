"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ClockIcon } from "@heroicons/react/24/outline";


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
  audioLink?: string;
};

export default function SelectedForYou() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const audioSecs = useAudioDuration(book?.audioLink);
  const secondsFromApi = toSeconds(book?.duration);
  const durationClock = formatClock(secondsFromApi ?? audioSecs);

  useEffect(() => {
    async function fetchBook() {
      try {
        const response = await fetch(
          "https://us-central1-summaristt.cloudfunctions.net/getBooks?status=selected"
        );
        const data = await response.json();
        setBook(Array.isArray(data) ? data[0] : data);
      } catch (error) {
        console.error("Failed to fetch selected book:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-[22px] font-semibold text-gray-900 mb-4">
        Selected just for you
      </h2>

      {loading ? (
        // Skeleton loader
        <div className="flex items-center bg-[#fbefd6] rounded-lg shadow-sm p-6 animate-pulse">
          <div className="flex-1 pr-4">
            <div className="h-4 bg-gray-200 rounded w-3/5 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/6 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="flex-shrink-0 w-32 h-32 bg-gray-200 rounded-md"></div>
        </div>
      ) : !book ? (
        <div className="text-gray-500">No selected book found.</div>
      ) : (
        <Link
          href={`/book/${book.id}`}
          className="flex items-center bg-[#fbefd6] hover:bg-yellow-100 rounded-lg shadow-sm transition p-6"
        >
          
          <div className="flex-1 pr-4">
            <p className="text-sm text-gray-700 mb-2">{book.subTitle}</p>
            <div className="border-t border-gray-200 my-2"></div>
            <h3 className="text-lg font-bold text-gray-900">{book.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{book.author}</p>
            <div className="flex items-center text-gray-600 text-sm">
              <ClockIcon className="w-4 h-4 mr-1" />
              {durationClock}
            </div>
          </div>
          {/* Book Image (Right Side) */}
          <figure className="flex-shrink-0 w-32 h-32">
            <img
              className="w-full h-full object-cover rounded-md"
              src={book.imageLink || book.img || "/fallback.jpg"}
              alt={book.title}
            />
          </figure>
        </Link>
      )}
    </div>
  );
}
