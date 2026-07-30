"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { clampPostAspectRatio } from "@/lib/postAspectRatio";
import { usePostViewerOptional } from "@/components/postViewerContext";

/**
 * VSCO-style 2-column masonry: keep image ratios, pack into the shortest
 * column so there are no vertical holes. Ordered by post date (newest first).
 *
 * @param {{ authorClerkId?: string, collection?: 'public' | 'friends' | 'private' | null, refreshNonce?: number }} props
 */
export default function ImageGrid({ authorClerkId, collection = null, refreshNonce = 0 }) {
  const { openPost } = usePostViewerOptional();
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
    const onKey = (e) => {
      if (e.key === "Escape") setIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

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

  // Pack into 2 columns (shortest column wins) — VSCO / Pinterest style.
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
    // naturalRatios intentionally included so packing updates as images load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaItems, naturalRatios]);

  if (loading) {
    return (
      <div className="flex w-full gap-0.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="animate-pulse rounded-tl-md bg-stone-100" style={{ aspectRatio: "4/5" }} />
          <div className="animate-pulse bg-stone-100" style={{ aspectRatio: "1" }} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="animate-pulse rounded-tr-md bg-stone-100" style={{ aspectRatio: "1" }} />
          <div className="animate-pulse bg-stone-100" style={{ aspectRatio: "5/4" }} />
        </div>
      </div>
    );
  }

  if (!mediaItems.length) {
    return <p className="py-16 text-center text-sm text-stone-400">No media yet.</p>;
  }

  const active = index != null ? mediaItems[index] : null;

  function renderTile(card, flatIndex, cornerClass) {
    const ratio = ratioFor(card);
    const tile = (
      <img
        src={card.url}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        onLoad={(e) => {
          if (!(typeof card.aspectRatio === "number" && card.aspectRatio > 0)) {
            onImgLoad(card.id, e);
          }
        }}
      />
    );

    const frameClass = `relative block w-full overflow-hidden bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 ${cornerClass}`;
    const frameStyle = { aspectRatio: String(ratio) };

    if (card.postId) {
      return (
        <button
          key={card.id}
          type="button"
          onClick={() => openPost(String(card.postId))}
          className={frameClass}
          style={frameStyle}
          aria-label="View post"
        >
          {tile}
        </button>
      );
    }

    return (
      <button
        key={card.id}
        type="button"
        onClick={() => setIndex(flatIndex)}
        className={frameClass}
        style={frameStyle}
      >
        {tile}
      </button>
    );
  }

  return (
    <>
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
        active &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
            onClick={() => setIndex(null)}
            role="dialog"
            aria-modal="true"
          >
            <img
              src={active.url}
              alt=""
              className="max-h-[85vh] max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </>
  );
}
