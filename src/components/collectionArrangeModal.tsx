"use client";

import { useEffect, useState } from "react";
import { Modal, useOverlayState } from "@heroui/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import CollectionArrangePanel from "@/components/collectionArrangePanel";
import type { MediaPickItem } from "@/lib/collectionTypes";

type Props = {
  state: ReturnType<typeof useOverlayState>;
  initialItems: MediaPickItem[];
  onSave: (items: MediaPickItem[]) => Promise<void>;
};

export default function CollectionArrangeModal({
  state,
  initialItems,
  onSave,
}: Props) {
  const [items, setItems] = useState<MediaPickItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state.isOpen) return;
    setItems(initialItems);
    setActiveIndex(0);
    setError("");
    setSaving(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isOpen]);

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(0, items.length - 1)));
  }, [items.length]);

  async function handleSave(close: () => void) {
    if (!items.length) {
      setError("Add photos before rearranging");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(items);
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
              width: "min(98vw, 1080px)",
              minWidth: "min(98vw, 1080px)",
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
                    Rearrange
                  </Modal.Heading>
                  <button
                    type="button"
                    onClick={() => void handleSave(close)}
                    disabled={saving || items.length === 0}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#0095f6] transition-colors hover:text-[#1877f2] disabled:cursor-not-allowed disabled:text-sky-300"
                  >
                    {saving ? "Saving…" : "Done"}
                  </button>
                </header>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <CollectionArrangePanel
                    items={items}
                    activeIndex={activeIndex}
                    onActiveIndexChange={setActiveIndex}
                    onReorder={setItems}
                    error={error}
                    emptyMessage="No photos in this collection yet."
                  />
                </div>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
