"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, useOverlayState } from "@heroui/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { MediaPickItem } from "@/lib/collectionTypes";

type Props = {
  state: ReturnType<typeof useOverlayState>;
  authorClerkId: string;
  /** Already in the collection — pre-disabled / pre-selected handling */
  excludeUrls?: string[];
  title?: string;
  confirmLabel?: string;
  onConfirm: (items: MediaPickItem[]) => Promise<void>;
};

export default function CollectionPhotoPickerModal({
  state,
  authorClerkId,
  excludeUrls = [],
  title = "Add photos",
  confirmLabel = "Add",
  onConfirm,
}: Props) {
  const [media, setMedia] = useState<MediaPickItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const excluded = useMemo(() => new Set(excludeUrls), [excludeUrls]);

  useEffect(() => {
    if (!state.isOpen || !authorClerkId) return;
    let cancelled = false;
    setLoading(true);
    setSelected(new Set());
    setError("");
    void (async () => {
      try {
        const res = await fetch(
          `/api/media/${encodeURIComponent(authorClerkId)}?limit=120`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.success && Array.isArray(data.items)) {
          setMedia(
            data.items.filter(
              (item: MediaPickItem) => item.url && !excluded.has(item.url)
            )
          );
        } else {
          setMedia([]);
        }
      } catch {
        if (!cancelled) setMedia([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.isOpen, authorClerkId, excluded]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleConfirm(close: () => void) {
    const items = media.filter((m) => selected.has(m.id));
    if (!items.length) {
      setError("Select at least one photo");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onConfirm(items);
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal state={state}>
      <Modal.Backdrop className="!z-[95] bg-black/65">
        <Modal.Container className="!z-[95] flex items-center justify-center p-4 sm:p-6">
          <Modal.Dialog
            className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl !h-auto !max-h-none !min-h-0 !max-w-none !p-0"
            style={{
              width: "min(96vw, 560px)",
              minWidth: "min(96vw, 560px)",
              height: "min(85vh, 640px)",
              maxHeight: "min(85vh, 640px)",
              padding: 0,
            }}
          >
            {({ close }) => (
              <>
                <div className="relative flex h-11 shrink-0 items-center justify-center px-12">
                  <h2 className="text-sm font-semibold text-stone-900">
                    {title}
                  </h2>
                  <Modal.CloseTrigger className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-800">
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={18}
                      strokeWidth={1.8}
                    />
                  </Modal.CloseTrigger>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
                  {loading ? (
                    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div
                          key={i}
                          className="aspect-square animate-pulse rounded-md bg-stone-100"
                        />
                      ))}
                    </div>
                  ) : !media.length ? (
                    <p className="flex h-full items-center justify-center text-center text-sm text-stone-400">
                      No photos available to add.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                      {media.map((item) => {
                        const isOn = selected.has(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggle(item.id)}
                            className="relative aspect-square overflow-hidden rounded-md bg-stone-100"
                          >
                            <img
                              src={item.url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                            {isOn ? (
                              <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-medium text-white">
                                ✓
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {error ? (
                    <p className="mt-3 text-sm text-rose-600">{error}</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center justify-end px-5 pb-5 pt-3">
                  <button
                    type="button"
                    onClick={() => void handleConfirm(close)}
                    disabled={saving || selected.size === 0}
                    className="text-sm font-semibold text-[#0095f6] transition-colors hover:text-[#1877f2] disabled:cursor-not-allowed disabled:text-sky-300"
                  >
                    {saving ? "Saving…" : `${confirmLabel} (${selected.size})`}
                  </button>
                </div>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
