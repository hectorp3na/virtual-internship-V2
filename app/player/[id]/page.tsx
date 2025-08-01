"use client";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import SearchBar from "../../../components/SearchBar";
import AudioPlayer from "components/AudioPlayer";

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
type SidebarProps = {
  activeSize?: keyof typeof fontSizes;
  setActiveSize?: Dispatch<SetStateAction<keyof typeof fontSizes>>;
};

export default function PlayerPage() {
  const params = useParams();
  const id = params.id as string | undefined;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSizeKey, setFontSizeKey] =
    useState<keyof typeof fontSizes>("small");

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
        <Sidebar activeSize={fontSizeKey} setActiveSize={setFontSizeKey} />
      </aside>
      {/* Main Content */}
      <main className="flex-1 px-8 py-6 ml-[200px]">
        <SearchBar />
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div>
              <div className="h-10 w-3/4 bg-gray-200 rounded mb-3 animate-pulse"></div>
              <div className="h-5 w-2/3 bg-gray-100 rounded mb-4 animate-pulse"></div>
            </div>
          ) : book ? (
            <>
              <h1 className="text-2xl font-bold text-[#032b41] border-t border-b border-[#e1e7ea] mb-8 pt-4 pb-4 leading-[1.5]">
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
              <AudioPlayer
                src={book.audioLink}
                cover={book.imageLink}
                title={book.title}
                author={book.author}
              />
            </>
          ) : (
            <div className="text-gray-400">Book not found.</div>
          )}
        </div>
      </main>
    </div>
  );
}
