"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ArchiveLeftSidebar from "@/components/leftSideBar";
import ArchiveRightSidebar from "@/components/rightSideBar";
import { SidebarProvider } from "@/components/sidebarContext";
import { SidebarInsetSpacer } from "@/components/sidebarInsetSpacer";
import { Button, Tabs, Skeleton, Chip } from "@heroui/react";
import FollowButton from "@/components/FollowButton";

type NotifRow = {
  _id: string;
  type: string;
  actorClerkId: string;
  actorFullName: string;
  actorUsername?: string;
  actorImageUrl?: string;
  postId: string | null;
  snippet?: string;
  read: boolean;
  createdAt: string;
};

function formatTime(iso?: string) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1)     return "Just now";
  if (diff < 60)    return `${Math.floor(diff)}m ago`;
  if (diff < 1440)  return `${Math.floor(diff / 60)}h ago`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function labelFor(n: NotifRow): string {
  switch (n.type) {
    case "like":            return "liked your post";
    case "comment": {
      if (!n.snippet) return "commented on your post";
      const s = n.snippet.length > 90 ? `${n.snippet.slice(0, 87)}…` : n.snippet;
      return `commented: "${s}"`;
    }
    case "follow":          return "started following you";
    case "friend_request":  return "sent you a friend request";
    case "friend_accepted": return "accepted your friend request";
    default:                return "interacted with you";
  }
}

const typeColors: Record<string, string> = {
  like:            "text-rose-400",
  comment:         "text-sky-500",
  follow:          "text-emerald-500",
  friend_request:  "text-violet-500",
  friend_accepted: "text-violet-500",
};

function NotifIcon({ type }: { type: string }) {
  const cls = `w-4 h-4 shrink-0 ${typeColors[type] ?? "text-stone-400"}`;
  switch (type) {
    case "like":
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}><path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"/></svg>;
    case "comment":
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}><path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd"/></svg>;
    case "follow":
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}><path d="M6.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM3.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM19.75 7.5a.75.75 0 0 0-1.5 0v2.25H16a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H22a.75.75 0 0 0 0-1.5h-2.25V7.5Z"/></svg>;
    case "friend_request":
    case "friend_accepted":
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}><path fillRule="evenodd" d="M8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 17.25a8.25 8.25 0 0 1 13.5-6.36 5.25 5.25 0 0 1 6.75 5.01v.38a.75.75 0 0 1-.75.75h-19.5a.75.75 0 0 1-.75-.75v-.38Z" clipRule="evenodd"/></svg>;
    default:
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}><path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z"/></svg>;
  }
}

export default function NotificationsPage() {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<NotifRow[]>([]);
  const [loading, setLoading]             = useState(true);

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-full flex flex-row max-w-[1600px] mx-auto">
          <ArchiveLeftSidebar />
          <SidebarInsetSpacer />

          <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
            <div className="w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
              <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-light text-stone-800 mb-2"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    Notifications
                  </h1>
                  <p className="text-sm text-stone-400">Likes, comments, follows, and friends</p>
                </div>

                {user && unreadCount > 0 ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <Chip
                      variant="soft"
                      size="sm"
                      className="bg-stone-800 text-white text-xs"
                    >
                      {unreadCount} unread
                    </Chip>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={markAllRead}
                      className="text-xs text-stone-500 hover:text-stone-700 h-auto py-1 px-2"
                    >
                      Mark all read
                    </Button>
                  </div>
                ) : null}
              </div>

              {!user ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <p className="text-xs text-stone-400">Sign in to view notifications.</p>
                </div>
              ) : (
                <Tabs defaultSelectedKey="all" className="w-full">
                <Tabs.ListContainer className="mb-6 border-b border-stone-200/60">
                  <Tabs.List aria-label="Filter notifications" className="gap-4 bg-transparent p-0">
                    <Tabs.Tab
                      id="all"
                      className="pb-2 text-xs text-stone-400 data-[selected]:text-stone-800 data-[selected]:font-medium bg-transparent px-0 rounded-none"
                    >
                      All
                      <Tabs.Indicator className="bottom-0 h-0.5 bg-stone-800 rounded-none" />
                    </Tabs.Tab>
                    <Tabs.Tab
                      id="unread"
                      className="pb-2 text-xs text-stone-400 data-[selected]:text-stone-800 data-[selected]:font-medium bg-transparent px-0 rounded-none"
                    >
                      Unread
                      <Tabs.Indicator className="bottom-0 h-0.5 bg-stone-800 rounded-none" />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>

                <Tabs.Panel id="all">
                  <NotifList
                    rows={notifications}
                    loading={loading}
                    onMarkRead={markOneRead}
                    onFriendRespond={respondToFriendRequest}
                  />
                </Tabs.Panel>

                <Tabs.Panel id="unread">
                  <NotifList
                    rows={notifications.filter((n) => !n.read)}
                    loading={loading}
                    onMarkRead={markOneRead}
                    onFriendRespond={respondToFriendRequest}
                    emptyLabel="No unread notifications"
                  />
                </Tabs.Panel>
              </Tabs>
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

/* ─── Card list ───────────────────────────────────────────────────────────── */

const notifFollowBtnClass =
  "text-xs px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50 min-w-[5.5rem]";

function NotifList({
  rows,
  loading,
  onMarkRead,
  onFriendRespond,
  emptyLabel = "No notifications",
}: {
  rows: NotifRow[];
  loading: boolean;
  onMarkRead: (id: string) => void;
  onFriendRespond: (n: NotifRow, accept: boolean) => void;
  emptyLabel?: string;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-center rounded-2xl border border-stone-200/80 bg-white">
        <p className="text-xs text-stone-300 mb-1">{emptyLabel}</p>
        <p className="text-xs text-stone-400">You&apos;re all caught up</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col rounded-2xl border border-stone-200/80 bg-white overflow-hidden divide-y divide-stone-100">
      {rows.map((n) => (
        <li key={n._id}>
          <div className={`flex items-start gap-3 p-4 transition-colors hover:bg-stone-50/90 ${!n.read ? "bg-white border-l-2 border-stone-300" : ""}`}>
            <Link
              href={`/profile/${encodeURIComponent(n.actorClerkId)}`}
              onClick={() => { if (!n.read) onMarkRead(n._id); }}
              className="flex-shrink-0"
            >
              <img
                src={n.actorImageUrl || "https://i.pravatar.cc/150?u=placeholder"}
                alt=""
                className="w-10 h-10 rounded-full object-cover ring-1 ring-stone-200/60 hover:opacity-90 transition-opacity"
              />
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <NotifIcon type={n.type} />
                <p className="text-sm text-stone-700 leading-snug">
                  <Link
                    href={`/profile/${encodeURIComponent(n.actorClerkId)}`}
                    onClick={() => { if (!n.read) onMarkRead(n._id); }}
                    className="font-medium text-stone-800 hover:underline underline-offset-2"
                  >
                    {n.actorFullName}
                  </Link>{" "}
                  <span className="text-stone-500">{labelFor(n)}</span>
                </p>
              </div>

              <p className="text-xs text-stone-400 mt-1">{formatTime(n.createdAt)}</p>

              {n.postId && (n.type === "like" || n.type === "comment") && (
                <Link
                  href={`/post/${encodeURIComponent(n.postId!)}`}
                  onClick={() => {
                    if (!n.read) onMarkRead(n._id);
                  }}
                  className="inline-block text-xs text-stone-400 mt-1.5 hover:text-stone-600 underline underline-offset-2"
                >
                  View post
                </Link>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0 pt-0.5">
              {n.type === "follow" && (
                <FollowButton
                  targetUserId={n.actorClerkId}
                  className={notifFollowBtnClass}
                  onChange={() => onMarkRead(n._id)}
                />
              )}

              {n.type === "friend_request" && !n.read && (
                <div className="flex flex-col items-end gap-1.5">
                  <Button
                    size="sm"
                    onPress={() => onFriendRespond(n, true)}
                    className="bg-stone-800 hover:bg-stone-700 text-white text-xs rounded-lg px-3 h-7 min-w-[5.5rem]"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => onFriendRespond(n, false)}
                    className="border-stone-200 text-stone-600 hover:border-stone-300 text-xs rounded-lg px-3 h-7 min-w-[5.5rem]"
                  >
                    Delete
                  </Button>
                </div>
              )}

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-stone-700 shrink-0" aria-hidden title="Unread" />
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}