"use client";
import { useEffect, useState } from "react";
import { ClockIcon, StarIcon } from "@heroicons/react/24/outline";

type Book = {
  id: string;
  title: string;
  author: string;
  subTitle?: string;
  imageLink?: string;
  img?: string;
  duration?: string;
  totalRating?: number;
  averageRating: number;
  keyIdeas: number;
  type: string;
  status: string;
  summary: string;
  tags: string[];
  bookDescription: string;
  authorDescription: string;
  subscriptionRequired?: boolean;
  audioLink: string;
};

export default function SuggestedBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const response = await fetch(
          "https://us-central1-summaristt.cloudfunctions.net/getBooks?status=suggested"
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
      <h2 className="text-[22px] font-semibold text-gray-900">Suggested Books</h2>
      <p className="text-md text-gray-500 mb-4">Browse these books</p>

      {loading ? (
        <div className="flex overflow-x-auto gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex-none w-56 bg-white rounded-lg shadow-sm border-0 p-3 relative animate-pulse"
            >
              {/* Premium pill skeleton */}
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
            <a
              key={book.id}
              href={`/book/${book.id}`}
              className="flex-none w-56 bg-white rounded-lg shadow-sm border-0 transition p-3 relative hover:bg-gray-100 duration-200 hover:-translate-y-1 hover:shadow-lg hover:scale-[1.025]"
            >
              {/* Premium Pill */}
              {book.subscriptionRequired && (
                <div className="absolute top-1 right-1 bg-[#032b41] text-[#fff] text-xs font-bold px-2 py-0.5 rounded-full z-10">
                  Premium
                </div>
              )}
              <figure className="w-full h-40 mb-3">
                <img
                  className="w-full h-full object-cover rounded"
                  src={book.imageLink || book.img}
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
                  <span>{book.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <StarIcon className="w-4 h-4" />
                  <span>{book.averageRating}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
