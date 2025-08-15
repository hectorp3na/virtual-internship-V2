import React, { useEffect, useMemo, useRef, useState } from "react";

type Book = {
  id: string;
  title: string;
  authors?: string[] | string;
  thumbnail?: string;
  description?: string;
};

type Props = {
  onSelect?: (book: Book) => void;
  minChars?: number;
  placeholder?: string;
};

export default function SearchBar({
  onSelect,
  minChars = 2,
  placeholder = "Search for books",
}: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  const trimmed = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setActive(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const getMessage = (e: unknown) =>
    e instanceof Error ? e.message : String(e ?? "");
  const isAbortError = (e: unknown): e is { name: "AbortError" } =>
    typeof e === "object" &&
    e !== null &&
    "name" in e &&
    (e as { name?: unknown }).name === "AbortError";

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (trimmed.length < minChars) {
      setItems([]);
      setLoading(false);
      setError(null);
      setOpen(false);
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    debounceRef.current = window.setTimeout(fetchBooks, 300);

    async function fetchBooks() {
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setLoading(true);
      setError(null);

      const url = `https://us-central1-summaristt.cloudfunctions.net/getBooksByAuthorOrTitle?search=${encodeURIComponent(
        trimmed
      )}`;

      try {
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const raw = await res.json();
        const normalized = normalizeItems(raw);
        setItems(normalized);
        setOpen(true);
        setActive(normalized.length ? 0 : -1);
      } catch (e: unknown) {
        if (isAbortError(e)) return;
        setItems([]);
        setError(getMessage(e) || "Something went wrong");
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [trimmed, minChars]);

    const isObj = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

  const str = (v: unknown): string | undefined =>
    typeof v === "string" ? v : typeof v === "number" ? String(v) : undefined;

   function normalizeItems(data: unknown): Book[] {
    const obj = isObj(data) ? (data as { books?: unknown; items?: unknown }) : undefined;

    let listUnknown: unknown[] = [];
    if (Array.isArray(data)) listUnknown = data as unknown[];
    else if (obj) {
      if (Array.isArray(obj.books)) listUnknown = obj.books as unknown[];
      else if (Array.isArray(obj.items)) listUnknown = obj.items as unknown[];
    }

    return listUnknown.map((b): Book => {
      const rec = isObj(b) ? (b as Record<string, unknown>) : {};
      const vi = isObj(rec.volumeInfo) ? (rec.volumeInfo as Record<string, unknown>) : undefined;
      const imageLinks = isObj(vi?.imageLinks)
        ? (vi!.imageLinks as Record<string, unknown>)
        : undefined;

      const id =
        str(rec.id) ??
        str(rec.bookId) ??
        str(rec.isbn) ??
        str(rec.ISBN_13) ??
        str(rec.ISBN_10) ??
        crypto.randomUUID();

      const title =
        str(rec.title) ??
        str(rec.name) ??
        str(vi?.title) ??
        "Untitled";

      const authorsRaw =
        rec.authors ?? rec.author ?? (vi?.authors as unknown);
      const authors: string[] | string = Array.isArray(authorsRaw)
        ? (authorsRaw.filter((x): x is string => typeof x === "string") as string[])
        : typeof authorsRaw === "string"
        ? authorsRaw
        : [];

      const thumbnail =
        str(rec.thumbnail) ??
        str(rec.image) ??
        str(rec.coverImage) ??
        str(rec.cover) ??
        str(imageLinks?.thumbnail) ??
        str(imageLinks?.smallThumbnail) ??
        "";

      const description =
        str(rec.description) ??
        str(rec.summary) ??
        str(vi?.description) ??
        "";

      return { id, title, authors, thumbnail, description };
    });
  }

  function pick(index: number) {
    const book = items[index];
    if (!book) return;
    setQ(book.title);
    setOpen(false);
    setActive(-1);
    onSelect?.(book);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && ["ArrowDown", "ArrowUp"].includes(e.key)) {
      setOpen(true);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (items.length ? (i + 1) % items.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) =>
        items.length ? (i - 1 + items.length) % items.length : -1
      );
    } else if (e.key === "Enter") {
      if (active >= 0) {
        e.preventDefault();
        pick(active);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const listboxId = "book-suggestions";

  return (
    <div className="flex justify-end mb-6">
      <div
        ref={wrapperRef}
        className="relative w-full max-w-md"
        role="combobox"
        aria-expanded={open}
        aria-owns={listboxId}
        aria-haspopup="listbox"
      >
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => items.length && setOpen(true)}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            active >= 0 ? `${listboxId}-option-${active}` : undefined
          }
          className="w-full rounded-md border-2 border-[#e1e7ea] bg-[#f1f6f4] py-2 pl-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-30"
        />

        {/* Right icon */}
        <div className="absolute inset-y-0 right-3 flex items-center text-gray-500 border-l-2 border-l-[#e1e7ea] pl-2">
          {loading ? (
            <svg
              className="animate-spin"
              viewBox="0 0 24 24"
              width="22"
              height="22"
              aria-label="Loading"
            >
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity=".25" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          ) : (
            <svg
              stroke="#03314b"
              fill="#03314b"
              strokeWidth="0"
              viewBox="0 0 1024 1024"
              height="22"
              width="22"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
            </svg>
          )}
        </div>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute z-50 mt-2 w-full rounded-md border border-[#e1e7ea] bg-white shadow-lg"
            role="listbox"
            id={listboxId}
          >
            {error && (
              <div className="px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {!error && trimmed.length >= minChars && !loading && items.length === 0 && (
              <div className="px-3 py-2 text-sm text-[#03314b]">
                No results
              </div>
            )}

            {!error && items.length > 0 && (
              <ul className="max-h-96 overflow-auto py-1">
                {items.map((b, i) => (
                  <li
                    key={b.id}
                    id={`${listboxId}-option-${i}`}
                    role="option"
                    aria-selected={i === active}
                    className={[
                      "flex gap-3 px-3 py-2 cursor-pointer",
                      i === active ? "bg-[#f1f6f4]" : "hover:bg-[#f7faf9]",
                    ].join(" ")}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()} // keep input focused
                    onClick={() => pick(i)}
                  >
                    {b.thumbnail ? (
                      <img
                        src={b.thumbnail}
                        alt=""
                        className="h-10 w-8 rounded object-cover flex-none bg-[#f1f6f4]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-10 w-8 rounded bg-[#f1f6f4] flex-none" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#03314b] truncate">{b.title}</div>
                      <div className="text-xs text-gray-600 truncate">
                        {Array.isArray(b.authors) ? b.authors.join(", ") : b.authors}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
