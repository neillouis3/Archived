"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "motion/react";

export type CarouselItem = {
  id: string | number;
  url: string;
  title?: string;
};

/** Demo / fallback Unsplash set when no items are provided. */
export const items: CarouselItem[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1471899236350-e3016bf1e69e?q=80&w=880&auto=format&fit=crop",
    title: "Misty Mountain Majesty",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1539552678512-4005a33c64db?q=80&w=880&auto=format&fit=crop",
    title: "Winter Wonderland",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1709983966747-58c311fa6976?q=80&w=880&auto=format&fit=crop",
    title: "Autumn Mountain Retreat",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1683722319473-f851deb3fdf2?q=80&w=880&auto=format&fit=crop",
    title: "Tranquil Lake Reflection",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1560790671-b76ca4de55ef?q=80&w=734&auto=format&fit=crop",
    title: "Misty Mountain Peaks",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1698774303292-7af9410c3a57?q=80&w=436&auto=format&fit=crop",
    title: "Golden Hour Glow",
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1643994542584-1247b5266429?q=80&w=869&auto=format&fit=crop",
    title: "Snowy Mountain Highway",
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1613681230409-6423a38c43e1?q=80&w=871&auto=format&fit=crop",
    title: "Foggy Mountain Forest",
  },
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1486102515046-44130769cb25?q=80&w=435&auto=format&fit=crop",
    title: "Sunset Mountain Silhouette",
  },
  {
    id: 10,
    url: "https://images.unsplash.com/photo-1610397648930-477b8c7f0943?q=80&w=430&auto=format&fit=crop",
    title: "Alpine Meadow Bliss",
  },
  {
    id: 11,
    url: "https://images.unsplash.com/photo-1546471180-335a013cb87b?q=80&w=387&auto=format&fit=crop",
    title: "Mountain Lake Serenity",
  },
  {
    id: 12,
    url: "https://images.unsplash.com/photo-1540163502599-a3284e17072d?q=80&w=880&auto=format&fit=crop",
    title: "Icy Mountain Stream",
  },
  {
    id: 13,
    url: "https://images.unsplash.com/photo-1555803741-1ac759ac2f53?q=80&w=880&auto=format&fit=crop",
    title: "Wildflower Mountain Meadow",
  },
  {
    id: 14,
    url: "https://images.unsplash.com/photo-1516705486637-7b01bf9b9d13?q=80&w=880&auto=format&fit=crop",
    title: "Mountain Valley Vista",
  },
  {
    id: 15,
    url: "https://images.unsplash.com/photo-1512045519129-eb9ceb788555?q=80&w=880&auto=format&fit=crop",
    title: "Rugged Mountain Terrain",
  },
  {
    id: 16,
    url: "https://images.unsplash.com/photo-1504198266287-1659872e6590?q=80&w=880&auto=format&fit=crop",
    title: "Mountain Wildflower Bloom",
  },
  {
    id: 17,
    url: "https://images.unsplash.com/photo-1611582450053-0f056a82a68e?q=80&w=735&auto=format&fit=crop",
    title: "Mountain River Rapids",
  },
  {
    id: 18,
    url: "https://images.unsplash.com/photo-1590872000386-4348c6393115?q=80&w=688&auto=format&fit=crop",
    title: "Lush Mountain Valley",
  },
];

const FULL_WIDTH_PX = 120;
const COLLAPSED_WIDTH_PX = 35;
const GAP_PX = 2;
const MARGIN_PX = 2;

type FramerThumbnailCarouselProps = {
  items?: CarouselItem[];
  className?: string;
};

export function FramerThumbnailCarousel({
  items: itemsProp,
  className = "",
}: FramerThumbnailCarouselProps) {
  const slides = itemsProp?.length ? itemsProp : items;
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, slides.length - 1)));
  }, [slides.length]);

  useEffect(() => {
    if (!isDragging && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth || 1;
      const targetX = -index * containerWidth;

      animate(x, targetX, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    }
  }, [index, x, isDragging]);

  if (!slides.length) {
    return (
      <div
        className={`flex h-96 items-center justify-center text-sm text-stone-400 ${className}`}
      >
        No photos yet.
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-md" ref={containerRef}>
          <motion.div
            className="flex"
            drag="x"
            dragElastic={0.2}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(_e, info) => {
              setIsDragging(false);
              const containerWidth = containerRef.current?.offsetWidth || 1;
              const offset = info.offset.x;
              const velocity = info.velocity.x;

              let newIndex = index;

              if (Math.abs(velocity) > 500) {
                newIndex = velocity > 0 ? index - 1 : index + 1;
              } else if (Math.abs(offset) > containerWidth * 0.3) {
                newIndex = offset > 0 ? index - 1 : index + 1;
              }

              newIndex = Math.max(0, Math.min(slides.length - 1, newIndex));
              setIndex(newIndex);
            }}
            style={{ x }}
          >
            {slides.map((item) => (
              <div key={item.id} className="aspect-[4/3] w-full shrink-0 sm:aspect-[16/10]">
                <img
                  src={item.url}
                  alt={item.title ?? "Gallery photo"}
                  className="pointer-events-none h-full w-full select-none object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </motion.div>

          <motion.button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            aria-label="Previous photo"
            className={`absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-black shadow-lg transition-transform ${
              index === 0
                ? "cursor-not-allowed opacity-40"
                : "bg-white opacity-70 hover:scale-110 hover:opacity-100"
            }`}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          <motion.button
            type="button"
            disabled={index === slides.length - 1}
            onClick={() =>
              setIndex((i) => Math.min(slides.length - 1, i + 1))
            }
            aria-label="Next photo"
            className={`absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-black shadow-lg transition-transform ${
              index === slides.length - 1
                ? "cursor-not-allowed opacity-40"
                : "bg-white opacity-70 hover:scale-110 hover:opacity-100"
            }`}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </div>

        <Thumbnails items={slides} index={index} setIndex={setIndex} />
      </div>
    </div>
  );
}

/** @deprecated Prefer FramerThumbnailCarousel */
export function Component(props: FramerThumbnailCarouselProps) {
  return <FramerThumbnailCarousel {...props} />;
}

function Thumbnails({
  items: thumbItems,
  index,
  setIndex,
}: {
  items: CarouselItem[];
  index: number;
  setIndex: (index: number) => void;
}) {
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (thumbnailsRef.current) {
      let scrollPosition = 0;
      for (let i = 0; i < index; i++) {
        scrollPosition += COLLAPSED_WIDTH_PX + GAP_PX;
      }

      scrollPosition += MARGIN_PX;

      const containerWidth = thumbnailsRef.current.offsetWidth;
      const centerOffset = containerWidth / 2 - FULL_WIDTH_PX / 2;
      scrollPosition -= centerOffset;

      thumbnailsRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [index]);

  return (
    <div
      ref={thumbnailsRef}
      className="overflow-x-auto scrollbar-hide"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div className="flex h-20 gap-1 pb-2" style={{ width: "fit-content" }}>
        {thumbItems.map((item, i) => (
          <motion.button
            type="button"
            key={item.id}
            onClick={() => setIndex(i)}
            initial={false}
            animate={i === index ? "active" : "inactive"}
            variants={{
              active: {
                width: FULL_WIDTH_PX,
                marginLeft: MARGIN_PX,
                marginRight: MARGIN_PX,
              },
              inactive: {
                width: COLLAPSED_WIDTH_PX,
                marginLeft: 0,
                marginRight: 0,
              },
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative h-full shrink-0 overflow-hidden rounded-md"
            aria-label={item.title ?? `Photo ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
          >
            <img
              src={item.url}
              alt={item.title ?? ""}
              className="pointer-events-none h-full w-full select-none object-cover"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
