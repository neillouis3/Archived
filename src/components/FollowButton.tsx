"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

type Props = {
  targetUserId: string;
  className?: string;
  /** Called after a successful follow or unfollow */
  onChange?: () => void;
  /** Seed follow state without an extra status request (e.g. sidebar suggestions). */
  initialFollowing?: boolean;
};

export default function FollowButton({
  targetUserId,
  className = "",
  onChange,
  initialFollowing,
}: Props) {
  const { user, isLoaded } = useUser();
  const [following, setFollowing] = useState<boolean | null>(() =>
    typeof initialFollowing === "boolean" ? initialFollowing : null
  );
  const [followsYou, setFollowsYou] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!targetUserId) return;
    try {
      const res = await fetch(
        `/api/follows/${encodeURIComponent(targetUserId)}`,
        { credentials: "include" }
      );
      if (!res.ok) return;
      const data = await res.json();
      setFollowing(Boolean(data.isFollowing));
      setFollowsYou(Boolean(data.followsYou));
    } catch {
      setFollowing(null);
      setFollowsYou(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (!isLoaded || !user || user.id === targetUserId) {
      if (typeof initialFollowing !== "boolean") setFollowing(null);
      return;
    }
    if (typeof initialFollowing === "boolean") {
      setFollowing(initialFollowing);
      return;
    }
    load();
  }, [isLoaded, user, targetUserId, load, initialFollowing]);

  if (!isLoaded || !user || user.id === targetUserId) return null;

  async function toggle() {
    setLoading(true);
    try {
      if (following) {
        await fetch(`/api/follows/${encodeURIComponent(targetUserId)}`, {
          method: "DELETE",
          credentials: "include",
        });
        setFollowing(false);
        onChange?.();
      } else {
        await fetch("/api/follows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ followingClerkId: targetUserId }),
        });
        setFollowing(true);
        onChange?.();
      }
    } finally {
      setLoading(false);
    }
  }

  if (following === null) return null;

  const labelFollow = followsYou ? "Follow back" : "Follow";

  return (
    <button
      type="button"
      disabled={loading}
      onClick={toggle}
      className={
        (className ||
          "text-xs px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50") +
        (following ? " group relative" : "")
      }
    >
      {loading ? (
        "…"
      ) : following ? (
        <span className="inline-block min-w-[5rem] text-center">
          <span className="group-hover:hidden">Following</span>
          <span className="hidden group-hover:inline text-red-600/90 normal-case tracking-normal text-xs font-medium">
            Unfollow
          </span>
        </span>
      ) : (
        labelFollow
      )}
    </button>
  );
}
