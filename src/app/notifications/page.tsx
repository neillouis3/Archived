"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ArchiveLeftSidebar from "@/components/leftSideBar";
import ArchiveRightSidebar from "@/components/rightSideBar";
import { SidebarProvider } from "@/components/sidebarContext";
import { SidebarInsetSpacer } from "@/components/sidebarInsetSpacer";
import { Button, Skeleton } from "@heroui/react";
import FollowButton from "@/components/FollowButton";

type NotifRow = {
  _id: string;
  type: string;
  actorClerkId: string;
  actorFullName: string;
  actorUsername?: string;
  actorImageUrl?: string;
  postId: string | null;
  postImageUrl?: string;
  snippet?: string;
  read: boolean;
  createdAt: string;
};

type FilterKey = "all" | "follow" | "comment" | "like" | "friend";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",     label: "All" },
  { key: "follow",  label: "Follows" },
  { key: "like",    label: "Likes" },
  { key: "comment", label: "Comments" },
  { key: "friend",  label: "Friend requests" },
];

function passesFilter(n: NotifRow, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "follow") return n.type === "follow";
  if (filter === "like") return n.type === "like";
  if (filter === "comment") return n.type === "comment";
  if (filter === "friend") return n.type === "friend_request" || n.type === "friend_accepted";
  return true;
}

function groupByDate(rows: NotifRow[]): { label: string; items: NotifRow[] }[] {
  const now = Date.now();
  const DAY  = 86_400_000;
  const WEEK = 7 * DAY;

  const buckets: Record<string, NotifRow[]> = {
    Today:      [],
    "This week": [],
    "This month": [],
    Older:      [],
  };

  for (const n of rows) {
    const diff = now - new Date(n.createdAt).getTime();
    if (diff < DAY)        buckets["Today"].push(n);
    else if (diff < WEEK)  buckets["This week"].push(n);
    else if (diff < 30 * DAY) buckets["This month"].push(n);
    else                   buckets["Older"].push(n);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

function formatTime(iso?: string) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1)     return "Just now";
  if (diff < 60)    return `${Math.floor(diff)}m`;
  if (diff < 1440)  return `${Math.floor(diff / 60)}h`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function labelFor(n: NotifRow): string {
  switch (n.type) {
    case "like":            return "liked your post.";
    case "comment": {
      if (!n.snippet) return "commented on your post.";
      const s = n.snippet.length > 80 ? `${n.snippet.slice(0, 77)}…` : n.snippet;
      return `commented: "${s}"`;
    }
    case "follow":          return "started following you.";
    case "friend_request":  return "sent you a friend request.";
    case "friend_accepted": return "accepted your friend request.";
    default:                return "interacted with you.";
  }
}

export default function NotificationsPage() {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<NotifRow[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState<FilterKey>("all");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/notifications?limit=80", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (isLoaded && user) load(); }, [isLoaded, user, load]);

  async function markAllRead() {
    try {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ all: true }),
      });
      setNotifications((list) => list.map((n) => ({ ...n, read: true })));
    } catch { /* ignore */ }
  }

  async function markOneRead(id: string) {
    try {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((list) => list.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch { /* ignore */ }
  }

  async function respondToFriendRequest(n: NotifRow, accept: boolean) {
    try {
      await fetch("/api/friends/respond", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ requesterClerkId: n.actorClerkId, accept }),
      });
      markOneRead(n._id);
    } catch { /* ignore */ }
  }

  if (!isLoaded) return null;

  const filtered = notifications.filter((n) => passesFilter(n, filter));
  const groups   = groupByDate(filtered);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white">
        <div className="w-full flex flex-row max-w-[1600px] mx-auto">
          <ArchiveLeftSidebar />
          <SidebarInsetSpacer />

          <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
            <div className="w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-xl font-medium text-stone-800 tracking-tight">Notifications</h1>
                {user && unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={markAllRead}
                    className="text-xs text-stone-400 hover:text-stone-600 h-auto py-1 px-2"
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              {!user ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <p className="text-xs text-stone-400">Sign in to view notifications.</p>
                </div>
              ) : (
                <>
                  {/* Filter pills */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
                    {FILTERS.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={[
                          "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          filter === key
                            ? "bg-stone-800 text-white border-stone-800"
                            : "bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50",
                        ].join(" ")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Feed */}
                  {loading ? (
                    <div className="flex flex-col gap-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-72 text-center">
                      <p className="text-xs text-stone-300 mb-1">No notifications</p>
                      <p className="text-xs text-stone-400">You&apos;re all caught up</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {groups.map(({ label, items }) => (
                        <section key={label}>
                          <p className="text-sm font-medium text-stone-800 mb-1">{label}</p>
                          <ul className="flex flex-col divide-y divide-stone-100">
                            {items.map((n) => (
                              <NotifRow
                                key={n._id}
                                n={n}
                                onMarkRead={markOneRead}
                                onFriendRespond={respondToFriendRequest}
                              />
                            ))}
                          </ul>
                        </section>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="hidden xl:block xl:w-64 2xl:w-72 flex-shrink-0">
            <ArchiveRightSidebar />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

/* ─── Single row ─────────────────────────────────────────────────────────── */

function NotifRow({
  n,
  onMarkRead,
  onFriendRespond,
}: {
  n: NotifRow;
  onMarkRead: (id: string) => void;
  onFriendRespond: (n: NotifRow, accept: boolean) => void;
}) {
  const hasPostThumb = n.postId && (n.type === "like" || n.type === "comment");

  return (
    <li>
      <div
        className={[
          "flex items-center gap-3 py-3 transition-colors hover:bg-stone-50/80",
          !n.read ? "pl-0" : "",
        ].join(" ")}
      >
        {/* Unread indicator */}
        <div className="w-1.5 flex-shrink-0 flex justify-center">
          {!n.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700" aria-hidden />
          )}
        </div>

        {/* Avatar */}
        <Link
          href={`/profile/${encodeURIComponent(n.actorClerkId)}`}
          onClick={() => { if (!n.read) onMarkRead(n._id); }}
          className="flex-shrink-0"
        >
          <img
            src={n.actorImageUrl || "https://i.pravatar.cc/150?u=placeholder"}
            alt=""
            className="w-11 h-11 rounded-full object-cover ring-1 ring-stone-200/60 hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-stone-700 leading-snug">
            <Link
              href={`/profile/${encodeURIComponent(n.actorClerkId)}`}
              onClick={() => { if (!n.read) onMarkRead(n._id); }}
              className="font-medium text-stone-800 hover:underline underline-offset-2"
            >
              {n.actorFullName}
            </Link>{" "}
            <span className="text-stone-500">{labelFor(n)}</span>{" "}
            <span className="text-stone-400 text-xs">{formatTime(n.createdAt)}</span>
          </p>

          {hasPostThumb && (
            <Link
              href={`/post/${encodeURIComponent(n.postId!)}`}
              onClick={() => { if (!n.read) onMarkRead(n._id); }}
              className="inline-block text-xs text-stone-400 mt-1 hover:text-stone-600 underline underline-offset-2"
            >
              View post
            </Link>
          )}
        </div>

        {/* Right slot */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Post thumbnail */}
          {hasPostThumb && n.postImageUrl && (
            <Link
              href={`/post/${encodeURIComponent(n.postId!)}`}
              onClick={() => { if (!n.read) onMarkRead(n._id); }}
            >
              <img
                src={n.postImageUrl}
                alt=""
                className="w-12 h-12 rounded-lg object-cover"
              />
            </Link>
          )}

          {/* Follow button */}
          {n.type === "follow" && (
            <FollowButton
              targetUserId={n.actorClerkId}
              className="text-xs px-4 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors min-w-[5rem]"
              onChange={() => onMarkRead(n._id)}
            />
          )}

          {/* Friend request buttons */}
          {n.type === "friend_request" && !n.read && (
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                onPress={() => onFriendRespond(n, true)}
                className="bg-stone-800 hover:bg-stone-700 text-white text-xs rounded-lg px-3 h-7 min-w-[4.5rem]"
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onPress={() => onFriendRespond(n, false)}
                className="border-stone-200 text-stone-600 hover:border-stone-300 text-xs rounded-lg px-3 h-7 min-w-[4.5rem]"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
