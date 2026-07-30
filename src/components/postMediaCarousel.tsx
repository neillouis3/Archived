"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import {
  clampPostAspectRatio,
  loadImageSize,
  POST_ASPECT_SQUARE,
} from "@/lib/postAspectRatio";

const NOISE_OVERLAY = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
};

const IMAGE_FILTER = { filter: "brightness(0.97) contrast(1.02) saturate(0.92)" };

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

type PostMediaCarouselProps = {
  media: string[];
  alt: string;
  className?: string;
  /**
   * Modal layout: height-capped frame; width follows clamped aspect ratio.
   * Feed: width-driven frame (default).
   */
  variant?: "feed" | "modal";
  /** Explicit pixel box for modal (parent sizes from aspect ratio). */
  frameSize?: { width: number; height: number };
  /** Prefer this frame when set (from post.aspectRatio). */
  forcedAspectRatio?: number;
  /** Notified when the clamped frame ratio is known (modal sizing). */
  onAspectRatio?: (ratio: number) => void;
};

export function PostMediaCarousel({
  media,
  alt,
  className,
  variant = "feed",
  frameSize,
  forcedAspectRatio,
  onAspectRatio,
}: PostMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(
    () =>
      (typeof forcedAspectRatio === "number" && forcedAspectRatio > 0
        ? forcedAspectRatio
        : POST_ASPECT_SQUARE)
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollEndTimer = useRef<number | null>(null);
  const onAspectRatioRef = useRef(onAspectRatio);
  onAspectRatioRef.current = onAspectRatio;
  const firstUrl = media[0] ?? "";

  useEffect(() => {
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [firstUrl]);

  useEffect(() => {
    if (typeof forcedAspectRatio === "number" && forcedAspectRatio > 0) {
      setAspectRatio(forcedAspectRatio);
      onAspectRatioRef.current?.(forcedAspectRatio);
      return;
    }
    if (!firstUrl) {
      setAspectRatio(POST_ASPECT_SQUARE);
      onAspectRatioRef.current?.(POST_ASPECT_SQUARE);
      return;
    }
    let cancelled = false;
    void loadImageSize(firstUrl)
      .then(({ width, height }) => {
        if (cancelled) return;
        const ratio = clampPostAspectRatio(width, height);
        setAspectRatio(ratio);
        onAspectRatioRef.current?.(ratio);
      })
      .catch(() => {
        if (cancelled) return;
        setAspectRatio(POST_ASPECT_SQUARE);
        onAspectRatioRef.current?.(POST_ASPECT_SQUARE);
      });
    return () => {
      cancelled = true;
    };
  }, [firstUrl, forcedAspectRatio]);

  function applyNaturalSize(width: number, height: number) {
    if (typeof forcedAspectRatio === "number" && forcedAspectRatio > 0) return;
    if (!width || !height) return;
    const ratio = clampPostAspectRatio(width, height);
    setAspectRatio((prev) => (Math.abs(prev - ratio) < 0.001 ? prev : ratio));
    onAspectRatioRef.current?.(ratio);
  }

  useEffect(() => {
    return () => {
      if (scrollEndTimer.current != null) window.clearTimeout(scrollEndTimer.current);
    };
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el || media.length === 0) return;
      const next = Math.max(0, Math.min(index, media.length - 1));
      setActiveIndex(next);
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    },
    [media.length]
  );

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || media.length <= 1) return;
    const w = el.clientWidth;
    if (!w) return;
    const next = Math.round(el.scrollLeft / w);
    setActiveIndex(Math.max(0, Math.min(next, media.length - 1)));
  }, [media.length]);

  const onScroll = useCallback(() => {
    if (scrollEndTimer.current != null) window.clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = window.setTimeout(syncIndexFromScroll, 80);
  }, [syncIndexFromScroll]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (media.length <= 1) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(activeIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(activeIndex + 1);
      }
    },
    [activeIndex, goTo, media.length]
  );

  if (media.length === 0) {
    return (
      <div
        className={`flex aspect-square w-full items-center justify-center bg-black px-4 text-center text-xs text-stone-400 ${className ?? ""}`}
      >
        No photo for this post
      </div>
    );
  }

  const hasMultiple = media.length > 1;
  const navButtonClass =
    "absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-sm transition-opacity hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 opacity-90 md:opacity-0 md:group-hover/carousel:opacity-100 md:focus-visible:opacity-100";

  const frameStyle: CSSProperties =
    variant === "modal" && frameSize
      ? {
          width: frameSize.width,
          height: frameSize.height,
        }
      : variant === "modal"
        ? {
            aspectRatio: String(aspectRatio),
            width: `min(100%, 640px, calc(90vh * ${aspectRatio}))`,
            maxHeight: "90vh",
            height: "auto",
          }
        : {
            aspectRatio: String(aspectRatio),
            width: "100%",
          };

  return (
    <div
      className={`group/carousel relative overflow-hidden bg-black ${className ?? ""}`}
      style={frameStyle}
    >
      <div
        ref={scrollRef}
        tabIndex={hasMultiple ? 0 : -1}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
        role="region"
        aria-roledescription="carousel"
        aria-label="Post photos"
      >
        {media.map((url, i) => {
          const nearActive = Math.abs(i - activeIndex) <= 1;
          return (
            <div
              key={`${url}-${i}`}
              className="relative h-full w-full shrink-0 snap-center snap-always"
            >
              {nearActive || i === 0 ? (
                <img
                  src={url}
                  alt={i === 0 ? alt : `${alt} (${i + 1} of ${media.length})`}
                  draggable={false}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-full w-full select-none object-cover"
                  style={IMAGE_FILTER}
                  onLoad={
                    i === 0
                      ? (e) => {
                          const el = e.currentTarget;
                          applyNaturalSize(el.naturalWidth, el.naturalHeight);
                        }
                      : undefined
                  }
                />
              ) : (
                <div className="h-full w-full bg-stone-900" aria-hidden />
              )}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={NOISE_OVERLAY}
              />
            </div>
          );
        })}
      </div>

      {hasMultiple ? (
        <>
          {activeIndex > 0 ? (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => goTo(activeIndex - 1)}
              className={`${navButtonClass} left-2`}
            >
              <ChevronLeftIcon />
            </button>
          ) : null}

          {activeIndex < media.length - 1 ? (
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => goTo(activeIndex + 1)}
              className={`${navButtonClass} right-2`}
            >
              <ChevronRightIcon />
            </button>
          ) : null}

          <div
            className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5"
            role="tablist"
            aria-label="Photo indicators"
          >
            {media.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Photo ${i + 1} of ${media.length}`}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all ${
                  i === activeIndex
                    ? "h-1.5 w-1.5 bg-white"
                    : "h-1 w-1 bg-white/45 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <p className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium tabular-nums text-white/95 backdrop-blur-[1px]">
            {activeIndex + 1}/{media.length}
          </p>
        </>
      ) : null}
    </div>
  );
}
