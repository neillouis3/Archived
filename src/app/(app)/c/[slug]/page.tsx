"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import CollectionsGallery from "@/components/collectionsGallery";
import { subscribeArchiveFeedRefresh } from "@/lib/feedRefresh";

function CollectionPageLoader() {
  return (
    <div className="w-full" aria-busy="true" aria-label="Loading collection">
      <div className="mb-4 flex items-center gap-3">
        <div className="size-9 animate-pulse rounded-lg bg-stone-100" />
        <div className="h-5 w-40 animate-pulse rounded bg-stone-100" />
      </div>
      <div className="flex w-full gap-1">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div
            className="animate-pulse rounded-tl-md bg-stone-100"
            style={{ aspectRatio: "4/5" }}
          />
          <div className="animate-pulse bg-stone-100" style={{ aspectRatio: "1" }} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
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

export default function CollectionBySlugPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slugParam = params?.slug;
  const slug =
    typeof slugParam === "string"
      ? decodeURIComponent(slugParam)
      : Array.isArray(slugParam)
        ? decodeURIComponent(slugParam[0] || "")
        : "";
  const ownerFromQuery = searchParams.get("u")?.trim() || "";
  const { user, isLoaded } = useUser();
  const [gridRefresh, setGridRefresh] = useState(0);

  const ownerClerkId = ownerFromQuery || user?.id || "";
  const canManage = Boolean(user?.id && user.id === ownerClerkId);

  useEffect(() => {
    return subscribeArchiveFeedRefresh(() => {
      setGridRefresh((n) => n + 1);
    });
  }, []);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div className="w-full max-w-6xl px-4 pb-6 pt-4 sm:px-6 sm:pb-10">
        {!isLoaded ? (
          <CollectionPageLoader />
        ) : !user && !ownerFromQuery ? (
          <div className="flex h-96 flex-col items-center justify-center text-center">
            <p className="text-xs text-stone-400">
              Sign in to view this collection.
            </p>
          </div>
        ) : !slug || !ownerClerkId ? (
          <div className="flex h-96 flex-col items-center justify-center text-center">
            <p className="text-xs text-stone-400">Collection not found.</p>
          </div>
        ) : (
          <CollectionsGallery
            ownerClerkId={ownerClerkId}
            canManage={canManage}
            refreshNonce={gridRefresh}
            initialSlug={slug}
          />
        )}
      </div>
    </div>
  );
}
