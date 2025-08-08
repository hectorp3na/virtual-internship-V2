"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Book = {
  id: string;
  title: string;
  author: string;
  subTitle?: string;
  imageLink?: string;
  img?: string;
  duration?: string;
};

export default function SelectedForYou() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

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
          {/* Book Info Text (Left Side) */}
          <div className="flex-1 pr-4">
            <p className="text-sm text-gray-700 mb-2">{book.subTitle}</p>
            <div className="border-t border-gray-200 my-2"></div>
            <h3 className="text-lg font-bold text-gray-900">{book.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{book.author}</p>
            <div className="flex items-center text-gray-600 text-sm">
              <svg
                className="mr-1"
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 16 16"
                height="16"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
              </svg>
              {book.duration}
            </div>
          </div>
          {/* Book Image (Right Side) */}
          <figure className="flex-shrink-0 w-32 h-32">
            <img
              className="w-full h-full object-cover rounded-md"
              src={book.imageLink || book.img}
              alt={book.title}
            />
          </figure>
        </Link>
      )}
    </div>
  );
}
