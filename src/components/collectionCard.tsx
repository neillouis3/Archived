"use client";

import type { CollectionSummary } from "@/lib/collectionTypes";

type Props = {
  collection: CollectionSummary;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

/** Outer card is rounded-xl (12px) with p-1 (4px) → inner radius ≈ 8px = rounded-lg */
const INNER = "rounded-lg";

function CollectionCollage({ urls }: { urls: string[] }) {
  const photos = urls.slice(0, 4);
  const imgClass =
    "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105";

  if (photos.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-stone-400">
        Empty
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <div className="h-full overflow-hidden p-1">
        <div className={`h-full min-h-0 overflow-hidden bg-stone-200/60 ${INNER}`}>
          <img src={photos[0]} alt="" className={imgClass} />
        </div>
      </div>
    );
  }

  if (photos.length === 2) {
    return (
      <div className="grid h-full grid-cols-2 gap-1 p-1">
        <div
          className={`min-h-0 overflow-hidden bg-stone-200/60 rounded-l-lg`}
        >
          <img src={photos[0]} alt="" className={imgClass} />
        </div>
        <div
          className={`min-h-0 overflow-hidden bg-stone-200/60 rounded-r-lg`}
        >
          <img src={photos[1]} alt="" className={imgClass} />
        </div>
      </div>
    );
  }

  if (photos.length === 3) {
    return (
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-1 p-1">
        <div className="row-span-2 min-h-0 overflow-hidden rounded-l-lg bg-stone-200/60">
          <img src={photos[0]} alt="" className={imgClass} />
        </div>
        <div className="min-h-0 overflow-hidden rounded-tr-lg bg-stone-200/60">
          <img src={photos[1]} alt="" className={imgClass} />
        </div>
        <div className="min-h-0 overflow-hidden rounded-br-lg bg-stone-200/60">
          <img src={photos[2]} alt="" className={imgClass} />
        </div>
      </div>
    );
  }

  const cornerClass = [
    "rounded-tl-lg",
    "rounded-tr-lg",
    "rounded-bl-lg",
    "rounded-br-lg",
  ];

  return (
    <div className="grid h-full grid-cols-2 grid-rows-2 gap-1 p-1">
      {photos.map((url, i) => (
        <div
          key={url}
          className={`min-h-0 overflow-hidden bg-stone-200/60 ${cornerClass[i]}`}
        >
          <img src={url} alt="" className={imgClass} />
        </div>
      ))}
    </div>
  );
}

export default function CollectionCard({
  collection,
  selected = false,
  onClick,
  className = "",
}: Props) {
  const previewUrls =
    collection.previewUrls?.length > 0
      ? collection.previewUrls
      : collection.coverUrl
        ? [collection.coverUrl]
        : [];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative aspect-square w-full overflow-hidden rounded-xl bg-stone-100 text-left ${
        selected ? "ring-2 ring-stone-900 ring-offset-2" : ""
      } ${className}`}
    >
      <CollectionCollage urls={previewUrls} />

      {/* Same dark frosted hover as PostGridCard */}
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/45 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden
      >
        <p className="truncate px-4 text-center text-sm font-semibold text-white">
          {collection.name}
        </p>
      </div>
    </button>
  );
}
