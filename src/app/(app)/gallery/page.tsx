"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import ImageGrid from "@/components/imageGrid";
import AddPostModal from "@/components/addPostModal";
import { subscribeArchiveFeedRefresh } from "@/lib/feedRefresh";

export default function GalleryPage() {
  const { user, isLoaded } = useUser();
  const [gridRefresh, setGridRefresh] = useState(0);

  useEffect(() => {
    return subscribeArchiveFeedRefresh(() => {
      setGridRefresh((n) => n + 1);
    });
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
      <div className="w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">

        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <AddPostModal
            username={user?.username ?? undefined}
            fullName={user?.fullName ?? undefined}
            imageUrl={user?.imageUrl ?? undefined}
          />
        </div>

        {/* Gallery Grid */}
        {!user ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <p className="text-xs text-stone-400">Sign in to view your gallery.</p>
          </div>
        ) : (
          <ImageGrid authorClerkId={user.id} refreshNonce={gridRefresh} />
        )}

      </div>
    </div>
  );
}
