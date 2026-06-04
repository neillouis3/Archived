"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type UserSearchHit = {
  id: string;
  username: string | null;
  fullName: string;
  imageUrl: string;
};

type Props = {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  /** Compact mode for sidebar (smaller padding, no subtitle) */
  variant?: "default" | "sidebar";
};

export default function UserSearch({
  className = "",
  inputClassName = "",
  placeholder = "Search people…",
  variant = "default",
}: Props) {
  const { isSignedIn, isLoaded } = useUser();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(q.trim())}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        setResults([]);
        return;
      }
      const data = await res.json();
      setResults(Array.isArray(data.users) ? data.users : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open || query.trim().length < 2) return;
    const t = window.setTimeout(() => runSearch(query), 280);
    return () => window.clearTimeout(t);
  }, [query, open, runSearch]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className={`text-xs text-stone-400 px-1 ${className}`}>
        Sign in to search people.
      </div>
    );
  }

  const isSidebar = variant === "sidebar";

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div
        className={
          isSidebar
            ? `flex items-center gap-2 rounded-lg border border-stone-200/90 bg-white/80 px-2.5 py-2 focus-within:border-stone-300 ${inputClassName}`
            : `flex items-center gap-3 rounded-xl border border-stone-200/90 bg-white px-4 py-3 focus-within:border-stone-300 focus-within:shadow-[0_0_0_3px_rgba(120,113,108,0.12)] ${inputClassName}`
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.25}
          stroke="currentColor"
          className={`text-stone-400 flex-shrink-0 ${isSidebar ? "w-4 h-4" : "w-5 h-5"}`}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`min-w-0 flex-1 bg-transparent text-stone-800 placeholder:text-stone-400 outline-none ${
            isSidebar ? "text-xs" : "text-[15px]"
          }`}
        />
        {loading && (
          <span className="text-xs text-stone-400 tabular-nums">…</span>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div
          className={`absolute left-0 right-0 z-50 mt-1 rounded-xl border border-stone-200/90 bg-white shadow-lg overflow-hidden max-h-72 overflow-y-auto ${
            isSidebar ? "top-full" : "top-full"
          }`}
        >
          {results.length === 0 && !loading ? (
            <p className="text-xs text-stone-400 px-3 py-3">No people found.</p>
          ) : (
            <ul className="py-1">
              {results.map((u) => (
                <li key={u.id}>
                  <Link
                    href={`/profile/${encodeURIComponent(u.id)}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-stone-50 transition-colors"
                  >
                    <img
                      src={u.imageUrl}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-200/60"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-stone-800 truncate">
                        {u.fullName}
                      </p>
                      <p className="text-xs text-stone-400 truncate">
                        {u.username ? `@${u.username}` : u.id.slice(0, 12) + "…"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
