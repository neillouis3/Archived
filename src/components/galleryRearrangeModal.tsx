"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, useOverlayState } from "@heroui/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { clampPostAspectRatio } from "@/lib/postAspectRatio";

export type GalleryMediaItem = {
  id: string;
  url: string;
  postId?: string | null;
  aspectRatio?: number | null;
};

type Props = {
  state: ReturnType<typeof useOverlayState>;
  authorClerkId: string;
  onSaved?: () => void;
};

function ratioFor(
  item: GalleryMediaItem,
  natural: Record<string, number>
): number {
  if (typeof item.aspectRatio === "number" && item.aspectRatio > 0) {
    return item.aspectRatio;
  }
  return natural[item.id] ?? 1;
}

export default function GalleryRearrangeModal({
  state,
  authorClerkId,
  onSaved,
}: Props) {
  const [items, setItems] = useState<GalleryMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [naturalRatios, setNaturalRatios] = useState<Record<string, number>>(
    {}
  );
  const dragIdRef = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    if (!state.isOpen || !authorClerkId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setSaving(false);
    setNaturalRatios({});
    setDragOverId(null);
    void (async () => {
      try {
        const res = await fetch(
          `/api/media/${encodeURIComponent(authorClerkId)}?limit=120`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.success && Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          setItems([]);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          setError("Could not load gallery photos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.isOpen, authorClerkId]);

  const columns = useMemo(() => {
    const cols: GalleryMediaItem[][] = [[], []];
    const heights = [0, 0];
    for (const item of items) {
      const ratio = ratioFor(item, naturalRatios);
      const h = 1 / ratio;
      const col = heights[0] <= heights[1] ? 0 : 1;
      cols[col].push(item);
      heights[col] += h;
    }
    return cols;
  }, [items, naturalRatios]);

  function reorder(fromId: string, toId: string) {
    if (!fromId || !toId || fromId === toId) return;
    setItems((prev) => {
      const from = prev.findIndex((i) => i.id === fromId);
      const to = prev.findIndex((i) => i.id === toId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function handleSave(close: () => void) {
    if (!items.length) {
      setError("No photos to rearrange");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/gallery/order", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: items.map((i) => i.id) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Could not save order");
      }
      onSaved?.();
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal state={state}>
      <Modal.Backdrop className="!z-[90] bg-black/65">
        <Modal.Container
          placement="center"
          className="relative flex w-full max-w-full items-center justify-center p-3 sm:p-6"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => state.close()}
            className="absolute right-4 top-4 z-[95] rounded-full p-2 text-white transition-colors hover:bg-white/10 sm:right-6 sm:top-6"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={22} strokeWidth={1.75} />
          </button>

          <Modal.Dialog
            className="flex min-w-0 flex-col overflow-hidden rounded-xl bg-white shadow-2xl !h-auto !max-h-none !min-h-0 !max-w-none !p-0"
            style={{
              width: "min(98vw, 720px)",
              minWidth: "min(96vw, 360px)",
              height: "min(92vh, 820px)",
              minHeight: "min(92vh, 820px)",
              maxHeight: "min(92vh, 820px)",
              padding: 0,
            }}
          >
            {({ close }) => (
              <>
                <header className="relative flex h-11 shrink-0 items-center justify-center px-4">
                  <Modal.Heading className="text-sm font-semibold text-stone-900">
                    Rearrange gallery
                  </Modal.Heading>
                  <button
                    type="button"
                    onClick={() => void handleSave(close)}
                    disabled={saving || loading || items.length === 0}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#0095f6] transition-colors hover:text-[#1877f2] disabled:cursor-not-allowed disabled:text-sky-300"
                  >
                    {saving ? "Saving…" : "Done"}
                  </button>
                </header>

                <p className="shrink-0 px-4 pb-2 text-center text-xs text-stone-400">
                  Drag photos to rearrange
                </p>

                <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
                  {loading ? (
                    <div className="flex gap-1">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div
                          className="animate-pulse rounded-md bg-stone-100"
                          style={{ aspectRatio: "4/5" }}
                        />
                        <div
                          className="animate-pulse rounded-md bg-stone-100"
                          style={{ aspectRatio: "1" }}
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div
                          className="animate-pulse rounded-md bg-stone-100"
                          style={{ aspectRatio: "1" }}
                        />
                        <div
                          className="animate-pulse rounded-md bg-stone-100"
                          style={{ aspectRatio: "5/4" }}
                        />
                      </div>
                    </div>
                  ) : !items.length ? (
                    <p className="flex h-full items-center justify-center text-sm text-stone-400">
                      No photos in your gallery yet.
                    </p>
                  ) : (
                    <div className="flex gap-1">
                      {columns.map((col, colIdx) => (
                        <div
                          key={colIdx}
                          className="flex min-w-0 flex-1 flex-col gap-1"
                        >
                          {col.map((item) => {
                            const ratio = ratioFor(item, naturalRatios);
                            const over = dragOverId === item.id;
                            return (
                              <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => {
                                  dragIdRef.current = item.id;
                                  e.dataTransfer.effectAllowed = "move";
                                  e.dataTransfer.setData("text/plain", item.id);
                                  setDragOverId(item.id);
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.dataTransfer.dropEffect = "move";
                                  if (dragOverId !== item.id) {
                                    setDragOverId(item.id);
                                  }
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const fromId =
                                    e.dataTransfer.getData("text/plain") ||
                                    dragIdRef.current;
                                  if (fromId) reorder(fromId, item.id);
                                  dragIdRef.current = null;
                                  setDragOverId(null);
                                }}
                                onDragEnd={() => {
                                  dragIdRef.current = null;
                                  setDragOverId(null);
                                }}
                                className={`relative w-full cursor-grab overflow-hidden rounded-md bg-stone-100 active:cursor-grabbing ${
                                  over
                                    ? "ring-2 ring-stone-900 ring-offset-1"
                                    : ""
                                }`}
                                style={{ aspectRatio: String(ratio) }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.url}
                                  alt=""
                                  draggable={false}
                                  className="pointer-events-none h-full w-full select-none object-cover"
                                  onLoad={(e) => {
                                    const img = e.currentTarget;
                                    if (
                                      !img.naturalWidth ||
                                      !img.naturalHeight
                                    )
                                      return;
                                    const next = clampPostAspectRatio(
                                      img.naturalWidth,
                                      img.naturalHeight
                                    );
                                    setNaturalRatios((prev) =>
                                      prev[item.id] === next
                                        ? prev
                                        : { ...prev, [item.id]: next }
                                    );
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                  {error ? (
                    <p className="mt-3 text-center text-sm text-rose-600">
                      {error}
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
