"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Reorder } from "motion/react";
import type { MediaPickItem } from "@/lib/collectionTypes";

type Props = {
  items: MediaPickItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onReorder: (next: MediaPickItem[]) => void;
  onRemove?: (id: string) => void;
  emptyMessage?: string;
  error?: string;
};

export default function CollectionArrangePanel({
  items,
  activeIndex,
  onActiveIndexChange,
  onReorder,
  onRemove,
  emptyMessage = "No photos to rearrange.",
  error,
}: Props) {
  if (!items.length) {
    return (
      <div className="flex h-full min-h-0 flex-col px-4 pb-4 pt-3">
        <p className="flex flex-1 items-center justify-center text-sm text-stone-400">
          {emptyMessage}
        </p>
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </div>
    );
  }

  const active = items[activeIndex];

  return (
    <div className="flex h-full min-h-0 flex-col px-4 pb-4 pt-3">
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-stone-100">
        <img
          key={active?.id}
          src={active?.url}
          alt=""
          className="max-h-full max-w-full object-contain"
        />
        {onRemove && active ? (
          <button
            type="button"
            onClick={() => onRemove(active.id)}
            className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            aria-label="Remove photo"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.75} />
          </button>
        ) : null}
        <p className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {activeIndex + 1} / {items.length}
        </p>
      </div>

      <p className="mb-2 mt-3 text-center text-xs text-stone-400">
        Drag thumbnails to rearrange
      </p>

      <Reorder.Group
        axis="x"
        values={items}
        onReorder={(next) => {
          const currentId = items[activeIndex]?.id;
          onReorder(next);
          if (currentId) {
            const ni = next.findIndex((p) => p.id === currentId);
            if (ni >= 0) onActiveIndexChange(ni);
          }
        }}
        className="flex h-24 gap-1.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <Reorder.Item
              key={item.id}
              value={item}
              onClick={() => onActiveIndexChange(i)}
              className={`relative h-full shrink-0 cursor-grab overflow-hidden rounded-md active:cursor-grabbing ${
                isActive
                  ? "w-[120px]"
                  : "w-[56px] opacity-80 hover:opacity-100"
              }`}
            >
              <img
                src={item.url}
                alt=""
                className="pointer-events-none h-full w-full select-none object-cover"
                draggable={false}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
