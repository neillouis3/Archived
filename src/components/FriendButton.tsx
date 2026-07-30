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

const pillBase =
  "inline-flex items-center justify-center gap-1 rounded-lg px-4 py-1.5 text-sm font-normal transition-colors disabled:opacity-50";

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

  if (status.isFriend) {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={removeFriend}
        className={
          className ||
          `${pillBase} bg-neutral-100 text-black hover:bg-neutral-200`
        }
      >
        {loading ? "…" : "Unfriend"}
      </button>
    );
  }

  if (status.outgoingPending) {
    return (
      <span
        className={
          className ||
          `${pillBase} cursor-default bg-neutral-100 text-neutral-400`
        }
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
          className={`${pillBase} bg-black text-white hover:bg-neutral-800`}
        >
          {loading ? "…" : "Accept"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void respond(false)}
          className={`${pillBase} bg-neutral-100 text-black hover:bg-neutral-200`}
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
      className={
        className || `${pillBase} bg-black text-white hover:bg-neutral-800`
      }
    >
      {loading ? "…" : "Add friend"}
    </button>
  );
}
