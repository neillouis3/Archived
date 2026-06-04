"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

type Status = {
  isFriend: boolean;
  outgoingPending: boolean;
  incomingPending: boolean;
  blocked: boolean;
};

type Props = {
  targetUserId: string;
  className?: string;
};

export default function FriendButton({ targetUserId, className = "" }: Props) {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!targetUserId) return;
    try {
      const res = await fetch(
        `/api/friends/status/${encodeURIComponent(targetUserId)}`,
        { credentials: "include" }
      );
      if (!res.ok) return;
      const data = await res.json();
      setStatus({
        isFriend: Boolean(data.isFriend),
        outgoingPending: Boolean(data.outgoingPending),
        incomingPending: Boolean(data.incomingPending),
        blocked: Boolean(data.blocked),
      });
    } catch {
      setStatus(null);
    }
  }, [targetUserId]);

  useEffect(() => {
    if (!isLoaded || !user || user.id === targetUserId) {
      setStatus(null);
      return;
    }
    load();
  }, [isLoaded, user, targetUserId, load]);

  if (!isLoaded || !user || user.id === targetUserId) return null;
  if (!status) return null;
  if (status.blocked) return null;

  async function sendRequest() {
    setLoading(true);
    try {
      await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ recipientClerkId: targetUserId }),
      });
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function removeFriend() {
    setLoading(true);
    try {
      await fetch(`/api/friends/${encodeURIComponent(targetUserId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      await load();
    } finally {
      setLoading(false);
    }
  }

  const base =
    className ||
    "text-xs px-4 py-2 rounded-lg border transition-colors disabled:opacity-50";

  if (status.isFriend) {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={removeFriend}
        className={`${base} border-stone-300 text-stone-600 hover:bg-stone-100`}
      >
        {loading ? "…" : "Unfriend"}
      </button>
    );
  }

  if (status.outgoingPending) {
    return (
      <span
        className={`${base} border-stone-200 text-stone-400 cursor-default inline-flex items-center`}
      >
        Request sent
      </span>
    );
  }

  if (status.incomingPending) {
    async function respond(accept: boolean) {
      setLoading(true);
      try {
        await fetch("/api/friends/respond", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ requesterClerkId: targetUserId, accept }),
        });
        await load();
      } finally {
        setLoading(false);
      }
    }

    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => void respond(true)}
          className="text-xs px-3 py-1.5 rounded-lg bg-stone-800 text-white hover:bg-stone-700 transition-colors disabled:opacity-50"
        >
          {loading ? "…" : "Accept"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void respond(false)}
          className="text-xs px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={sendRequest}
      className={`${base} border-stone-600 text-stone-800 hover:bg-stone-100`}
    >
      {loading ? "…" : "Add friend"}
    </button>
  );
}
