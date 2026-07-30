"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Label, SearchField } from "@heroui/react";

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
      <div className={`px-1 text-xs text-stone-400 ${className}`}>
        Sign in to search people.
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <SearchField
        value={query}
        onChange={(v) => {
          setQuery(v);
          setOpen(true);
        }}
        fullWidth
        variant="secondary"
        aria-label="Search people"
        className={inputClassName}
      >
        <Label className="sr-only">Search people</Label>
        <SearchField.Group onFocus={() => setOpen(true)}>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={placeholder} />
          {loading ? (
            <span className="pr-2 text-xs tabular-nums text-stone-400">…</span>
          ) : (
            <SearchField.ClearButton />
          )}
        </SearchField.Group>
      </SearchField>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-72 overflow-hidden overflow-y-auto rounded-xl border border-stone-200/90 bg-white shadow-lg">
          {results.length === 0 && !loading ? (
            <p className="px-3 py-3 text-xs text-stone-400">No people found.</p>
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
                    className="flex items-center gap-2.5 px-3 py-2 transition-colors hover:bg-stone-50"
                  >
                    <img
                      src={u.imageUrl}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-stone-200/60"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-stone-800">
                        {u.fullName}
                      </p>
                      <p className="truncate text-xs text-stone-400">
                        {u.username
                          ? `@${u.username.replace(/^@+/, "")}`
                          : u.id.slice(0, 12) + "…"}
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
