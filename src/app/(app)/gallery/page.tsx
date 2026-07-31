"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CollectionsGallery from "@/components/collectionsGallery";
import { subscribeArchiveFeedRefresh } from "@/lib/feedRefresh";

function GalleryPageLoader() {
  return (
    <div className="w-full" aria-busy="true" aria-label="Loading gallery">
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-xl bg-stone-100"
          />
        ))}
      </div>
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
    </div>
  );
}

export default function GalleryPage() {
  const { user, isLoaded } = useUser();
  const [gridRefresh, setGridRefresh] = useState(0);

  useEffect(() => {
    return subscribeArchiveFeedRefresh(() => {
      setGridRefresh((n) => n + 1);
    });
  }, []);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div className="w-full max-w-6xl px-4 pb-6 pt-4 sm:px-6 sm:pb-10">
        {!isLoaded ? (
          <GalleryPageLoader />
        ) : !user ? (
          <div className="flex h-96 flex-col items-center justify-center text-center">
            <p className="text-xs text-stone-400">
              Sign in to view your gallery.
            </p>
          </div>
        ) : (
          <CollectionsGallery
            ownerClerkId={user.id}
            canManage
            refreshNonce={gridRefresh}
          />
        )}
      </div>
    </div>
  );
}
