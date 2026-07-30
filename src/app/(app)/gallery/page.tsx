"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import ImageGrid from "@/components/imageGrid";
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
    <div className="flex-1 min-w-0 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 pt-4 pb-6 sm:px-6 sm:pb-10">
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
