"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CollectionCard from "@/components/collectionCard";
import type { CollectionSummary } from "@/lib/collectionTypes";

type Props = {
  ownerClerkId: string;
  /** When viewing another user’s profile, pass their id into /c links */
  linkOwnerInQuery?: boolean;
  refreshNonce?: number;
  className?: string;
};

export default function ProfileCollections({
  ownerClerkId,
  linkOwnerInQuery = false,
  refreshNonce = 0,
  className = "",
}: Props) {
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerClerkId) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/collections?ownerClerkId=${encodeURIComponent(ownerClerkId)}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (cancelled) return;
        if (data.success && Array.isArray(data.collections)) {
          setCollections(data.collections);
        } else {
          setCollections([]);
        }
      } catch {
        if (!cancelled) setCollections([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ownerClerkId, refreshNonce]);

  if (loading) {
    return (
      <div
        className={`mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 ${className}`}
      >
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-xl bg-stone-100"
          />
        ))}
      </div>
    );
  }

  if (!collections.length) return null;

  return (
    <div
      className={`mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 ${className}`}
    >
      {collections.map((c) => (
        <CollectionCard
          key={c.id}
          collection={c}
          onClick={() => {
            const path = `/c/${encodeURIComponent(c.slug)}`;
            router.push(
              linkOwnerInQuery
                ? `${path}?u=${encodeURIComponent(ownerClerkId)}`
                : path
            );
          }}
        />
      ))}
    </div>
  );
}
