"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

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
};

export function PostMediaCarousel({ media, alt }: PostMediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollEndTimer = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [media]);

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
      <div className="flex h-full w-full min-h-[12rem] items-center justify-center bg-white px-4 text-center text-xs text-stone-400">
        No photo for this post
      </div>
    );
  }

  const hasMultiple = media.length > 1;
  const navButtonClass =
    "absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-sm backdrop-blur-[1px] transition-opacity hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 opacity-80 md:opacity-0 md:group-hover/carousel:opacity-100 md:focus-visible:opacity-100";

  return (
    <div className="group/carousel relative aspect-square w-full overflow-hidden">
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
        {media.map((url, i) => (
          <div key={`${url}-${i}`} className="relative h-full w-full shrink-0 snap-center snap-always">
            <img
              src={url}
              alt={i === 0 ? alt : `${alt} (${i + 1} of ${media.length})`}
              draggable={false}
              className="h-full w-full object-cover select-none"
              style={IMAGE_FILTER}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={NOISE_OVERLAY}
            />
          </div>
        ))}
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
                  i === activeIndex ? "h-1.5 w-1.5 bg-white" : "h-1 w-1 bg-white/45 hover:bg-white/70"
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
