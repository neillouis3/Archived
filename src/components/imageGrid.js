"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { clampPostAspectRatio } from "@/lib/postAspectRatio";

/**
 * VSCO-style 2-column masonry with Framer shared-layout lightbox.
 * Clicking an image expands it in place — does not open the post viewer.
 *
 * @param {{ authorClerkId?: string, collection?: 'public' | 'friends' | 'private' | null, refreshNonce?: number }} props
 */
export default function ImageGrid({
  authorClerkId,
  collection = null,
  refreshNonce = 0,
}) {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(null);
  const [mounted, setMounted] = useState(false);
  /** @type {[Record<string, number>, Function]} */
  const [naturalRatios, setNaturalRatios] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authorClerkId) {
      setMediaItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const fetchMedia = async () => {
      try {
        const qs =
          collection && ["public", "friends", "private"].includes(collection)
            ? `?collection=${encodeURIComponent(collection)}`
            : "";
        const res = await fetch(
          `/api/media/${encodeURIComponent(authorClerkId)}${qs}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.success && Array.isArray(data.items)) {
          setMediaItems(data.items);
        } else if (data.success && Array.isArray(data.mediaUrls)) {
          setMediaItems(
            data.mediaUrls.map((url, i) => ({
              id: `media-${i}`,
              url,
              postId: null,
              aspectRatio: null,
            }))
          );
        } else {
          setMediaItems([]);
        }
      } catch {
        if (!cancelled) setMediaItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchMedia();
    return () => {
      cancelled = true;
    };
  }, [authorClerkId, collection, refreshNonce]);

  useEffect(() => {
    if (index == null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") {
        setIndex((i) =>
          i == null ? i : Math.min(mediaItems.length - 1, i + 1)
        );
      }
      if (e.key === "ArrowLeft") {
        setIndex((i) => (i == null ? i : Math.max(0, i - 1)));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, mediaItems.length]);

  function ratioFor(card) {
    if (typeof card.aspectRatio === "number" && card.aspectRatio > 0) {
      return card.aspectRatio;
    }
    return naturalRatios[card.id] ?? 1;
  }

  function onImgLoad(id, e) {
    const img = e.currentTarget;
    if (!img?.naturalWidth || !img?.naturalHeight) return;
    const ratio = clampPostAspectRatio(img.naturalWidth, img.naturalHeight);
    setNaturalRatios((prev) =>
      prev[id] === ratio ? prev : { ...prev, [id]: ratio }
    );
  }

  const columns = useMemo(() => {
    const cols = [[], []];
    const heights = [0, 0];
    mediaItems.forEach((card, flatIndex) => {
      const ratio = ratioFor(card);
      const h = 1 / ratio;
      const col = heights[0] <= heights[1] ? 0 : 1;
      cols[col].push({ card, flatIndex });
      heights[col] += h;
    });
    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaItems, naturalRatios]);

  if (loading) {
    return (
      <div className="flex w-full gap-0.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div
            className="animate-pulse rounded-tl-md bg-stone-100"
            style={{ aspectRatio: "4/5" }}
          />
          <div className="animate-pulse bg-stone-100" style={{ aspectRatio: "1" }} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div
            className="animate-pulse rounded-tr-md bg-stone-100"
            style={{ aspectRatio: "1" }}
          />
          <div
            className="animate-pulse bg-stone-100"
            style={{ aspectRatio: "5/4" }}
          />
        </div>
      </div>
    );
  }

  if (!mediaItems.length) {
    return (
      <p className="py-16 text-center text-sm text-stone-400">No media yet.</p>
    );
  }

  const active = index != null ? mediaItems[index] : null;

  function renderTile(card, flatIndex, cornerClass) {
    const ratio = ratioFor(card);
    const isOpen = index === flatIndex;

    return (
      <button
        key={card.id}
        type="button"
        onClick={() => setIndex(flatIndex)}
        className={`relative block w-full overflow-hidden bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 ${cornerClass}`}
        style={{ aspectRatio: String(ratio) }}
        aria-label="View image"
      >
        {/* Placeholder keeps masonry height while the open tile is in the lightbox */}
        {isOpen ? (
          <div className="h-full w-full bg-stone-200/80" aria-hidden />
        ) : (
          <motion.img
            layoutId={`gallery-${card.id}`}
            src={card.url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onLoad={(e) => {
              if (
                !(typeof card.aspectRatio === "number" && card.aspectRatio > 0)
              ) {
                onImgLoad(card.id, e);
              }
            }}
          />
        )}
      </button>
    );
  }

  return (
    <LayoutGroup>
      <div className="flex w-full items-start gap-0.5">
        {columns.map((col, colIndex) => (
          <div
            key={colIndex}
            className="flex min-w-0 flex-1 flex-col gap-0.5"
          >
            {col.map(({ card, flatIndex }, rowIndex) => {
              const cornerClass =
                colIndex === 0 && rowIndex === 0
                  ? "rounded-tl-md"
                  : colIndex === 1 && rowIndex === 0
                    ? "rounded-tr-md"
                    : "";
              return renderTile(card, flatIndex, cornerClass);
            })}
          </div>
        ))}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {active ? (
              <motion.div
                key="gallery-lightbox"
                className="fixed inset-0 z-[80] flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-label="Image viewer"
              >
                <motion.button
                  type="button"
                  aria-label="Close"
                  className="absolute inset-0 bg-black/55"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIndex(null)}
                />
                <motion.img
                  layoutId={`gallery-${active.id}`}
                  src={active.url}
                  alt=""
                  className="relative z-[81] max-h-[85vh] max-w-full rounded-md object-contain shadow-2xl"
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body
        )}
    </LayoutGroup>
  );
}
