"use client";

import type React from "react";
import {
  Add01Icon,
  Copy01Icon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { MessageCircleIcon } from "lucide-react";
import { usePostViewerOptional } from "@/components/postViewerContext";

type PostGridCardProps = {
  postId: string;
  src: string;
  alt: string;
  /** Shown on hover in the bottom gradient (e.g. @username). */
  caption?: string;
  /** Show multi-photo badge (carousel posts). */
  hasMultiple?: boolean;
  likeCount?: number;
  commentCount?: number;
  className?: string;
};

function formatCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n < 1000) return String(Math.floor(n));
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}

/**
 * Shared tile for post grids (Explore, Home grid view, etc.).
 * Opens the post overlay in place — no route change.
 */
export function PostGridCard({
  postId,
  src,
  alt,
  hasMultiple = false,
  likeCount = 0,
  commentCount = 0,
  className = "",
}: PostGridCardProps) {
  const { openPost } = usePostViewerOptional();

  return (
    <button
      type="button"
      onClick={() => openPost(postId)}
      className={`relative aspect-square overflow-hidden group block w-full bg-white ring-1 ring-stone-200/40 text-left ${className}`}
      aria-label={alt}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        style={{ filter: "brightness(0.97) contrast(1.02) saturate(0.92)" }}
      />

      {hasMultiple ? (
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 top-2 z-20 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
        >
          <HugeiconsIcon
            icon={Copy01Icon}
            size={16}
            strokeWidth={2}
            className="text-white"
          />
        </span>
      ) : null}

      {/* Dark frosted hover — likes + comments */}
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/45 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden
      >
        <div className="flex items-center gap-6 text-white">
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={20}
              strokeWidth={0}
              fill="currentColor"
              className="size-5 shrink-0"
            />
            <span className="text-sm font-semibold tabular-nums">
              {formatCount(likeCount)}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircleIcon
              absoluteStrokeWidth
              className="size-5 shrink-0 fill-current"
              strokeWidth={0}
            />
            <span className="text-sm font-semibold tabular-nums">
              {formatCount(commentCount)}
            </span>
          </span>
        </div>
      </div>
    </button>
  );
}

export const postGridClassName = "grid grid-cols-3 gap-0.5";

/** Instagram-style 3-column placeholders while posts load. */
export function PostGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className={postGridClassName} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`aspect-square animate-pulse bg-stone-100 ${
            i === 0 ? "rounded-tl-md" : i === 2 ? "rounded-tr-md" : ""
          }`}
        />
      ))}
    </div>
  );
}

/** Empty-state tile that opens create post (own profile). */
export function CreateFirstPostTile({
  className = "",
  ...buttonProps
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...buttonProps}
      className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-tl-md bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200/80 hover:text-stone-700 ${className}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white">
        <HugeiconsIcon icon={Add01Icon} size={22} strokeWidth={1.75} />
      </span>
      <span className="px-2 text-center text-xs font-medium leading-snug">
        Create your first post
      </span>
    </button>
  );
}
