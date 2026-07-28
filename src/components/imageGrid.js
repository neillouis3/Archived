"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * @param {{ authorClerkId?: string, collection?: 'public' | 'friends' | 'private' | null, refreshNonce?: number }} props
 */
export default function ImageGrid({ authorClerkId, collection = null, refreshNonce = 0 }) {
  const [mediaUrls, setMediaUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authorClerkId) {
      setMediaUrls([]);
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
        if (data.success && Array.isArray(data.mediaUrls)) {
          setMediaUrls(
            data.mediaUrls.map((url, i) => ({
              id: `media-${i}`,
              url,
            }))
          );
        } else {
          setMediaUrls([]);
        }
      } catch {
        if (!cancelled) setMediaUrls([]);
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

  if (loading) {
    return (
      <div className="grid w-full grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-sm bg-stone-100" />
        ))}
      </div>
    );
  }

  if (!mediaUrls.length) {
    return <p className="text-sm text-stone-400">No media yet.</p>;
  }

  const active = index != null ? mediaUrls[index] : null;

  return (
    <>
      <div className="columns-2 gap-1">
        {mediaUrls.map((card, i) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setIndex(i)}
            className="mb-1 block w-full overflow-hidden rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          >
            <img
              src={card.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="block w-full object-cover"
            />
          </button>
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
