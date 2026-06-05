"use client";

import type { FormEvent } from "react";

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.25}
    stroke="currentColor"
    className={className}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

export type ExploreSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  /** Shown next to submit when `showReset` */
  onReset?: () => void;
  showReset?: boolean;
  inputId?: string;
  placeholder?: string;
  variant?: "full" | "sidebar";
};

export function ExploreSearchBar({
  value,
  onChange,
  onSubmit,
  onReset,
  showReset = false,
  inputId = "explore-search",
  placeholder = "Posts, tags, usernames, or people…",
  variant = "full",
}: ExploreSearchBarProps) {
  const isSidebar = variant === "sidebar";

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor={inputId} className="sr-only">
        Search explore
      </label>
      <div
        className={
          isSidebar
            ? "flex flex-col gap-2"
            : "flex flex-col gap-3 sm:flex-row sm:items-center"
        }
      >
        <div
          className={
            isSidebar
              ? `flex min-w-0 items-center gap-2 rounded-xl border border-stone-200/90 bg-background px-2.5 py-2
                 transition-shadow focus-within:border-stone-300 focus-within:shadow-[0_0_0_3px_rgba(120,113,108,0.12)]`
              : `flex flex-1 min-w-0 items-center gap-3 rounded-xl border border-stone-200/90 bg-background px-4 py-3
                 transition-shadow focus-within:border-stone-300 focus-within:shadow-[0_0_0_3px_rgba(120,113,108,0.12)]`
          }
        >
          <SearchIcon
            className={
              isSidebar
                ? "w-3.5 h-3.5 text-stone-400 flex-shrink-0"
                : "w-5 h-5 text-stone-400 flex-shrink-0"
            }
          />
          <input
            id={inputId}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            className={
              isSidebar
                ? "min-w-0 flex-1 bg-transparent text-xs text-stone-800 placeholder:text-stone-400 outline-none"
                : "min-w-0 flex-1 bg-transparent text-[15px] text-stone-800 placeholder:text-stone-400 outline-none"
            }
          />
        </div>
        <div
          className={
            isSidebar
              ? showReset && onReset
                ? "flex shrink-0"
                : "hidden"
              : showReset && onReset
                ? "flex gap-2 shrink-0"
                : "hidden"
          }
        >
          {showReset && onReset ? (
            <button
              type="button"
              onClick={onReset}
              className={
                isSidebar
                  ? `w-full rounded-xl border border-stone-200/90 bg-background px-4 py-2 text-xs
                     text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-700`
                  : `flex-1 sm:flex-initial rounded-xl border border-stone-200/90 bg-background px-5 py-3 text-xs
                     text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-700`
              }
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
