"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ArchiveLeftSidebar from "@/components/leftSideBar";
import ArchiveRightSidebar from "@/components/rightSideBar";
import { SidebarProvider } from "@/components/sidebarContext";
import { SidebarInsetSpacer } from "@/components/sidebarInsetSpacer";
import { Button, Skeleton, Tabs } from "@heroui/react";
import FollowButton from "@/components/FollowButton";

type NotifRowData = {
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
  { key: "all", label: "All" },
  { key: "follow", label: "Follows" },
  { key: "like", label: "Likes" },
  { key: "comment", label: "Comments" },
  { key: "friend", label: "Friend requests" },
];

function passesFilter(n: NotifRowData, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "follow") return n.type === "follow";
  if (filter === "like") return n.type === "like";
  if (filter === "comment") return n.type === "comment";
  if (filter === "friend") return n.type === "friend_request" || n.type === "friend_accepted";
  return true;
}

function groupByDate(rows: NotifRowData[]): { label: string; items: NotifRowData[] }[] {
  const now = Date.now();
  const DAY = 86_400_000;
  const WEEK = 7 * DAY;

  const buckets: Record<string, NotifRowData[]> = {
    Today: [],
    "This week": [],
    "This month": [],
    Older: [],
  };

  for (const n of rows) {
    const diff = now - new Date(n.createdAt).getTime();
    if (diff < DAY) buckets["Today"].push(n);
    else if (diff < WEEK) buckets["This week"].push(n);
    else if (diff < 30 * DAY) buckets["This month"].push(n);
    else buckets["Older"].push(n);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

function formatTime(iso?: string) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 1) return "Just now";
  if (diff < 60) return `${Math.floor(diff)}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function labelFor(n: NotifRowData): string {
  switch (n.type) {
    case "like":
      return "liked your post.";
    case "comment": {
      if (!n.snippet) return "commented on your post.";
      const s = n.snippet.length > 80 ? `${n.snippet.slice(0, 77)}…` : n.snippet;
      return `commented: "${s}"`;
    }
    case "follow":
      return "started following you.";
    case "friend_request":
      return "sent you a friend request.";
    case "friend_accepted":
      return "accepted your friend request.";
    default:
      return "interacted with you.";
  }
}

function ActorAvatar({ n }: { n: NotifRowData }) {
  const avatarClass =
    "w-11 h-11 rounded-full object-cover ring-1 ring-stone-200/60 hover:opacity-90 transition-opacity";

  if (n.actorImageUrl) {
    return (
      <img
        src={n.actorImageUrl}
        alt=""
        referrerPolicy="no-referrer"
        className={avatarClass}
      />
    );
  }

  const initial = (n.actorFullName || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`${avatarClass} flex items-center justify-center bg-stone-200 text-sm font-medium text-stone-600`}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export default function NotificationsPage() {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<NotifRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [notifRes] = await Promise.all([
        fetch("/api/notifications?limit=80", { credentials: "include" }),
        fetch("/api/notifications/read", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ all: true }),
        }),
      ]);
      if (!notifRes.ok) return;
      const data = await notifRes.json();
      const rows = Array.isArray(data.notifications) ? data.notifications : [];
      setNotifications(rows.map((n: NotifRowData) => ({ ...n, read: true })));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) load();
  }, [isLoaded, user, load]);

  async function respondToFriendRequest(n: NotifRowData, accept: boolean) {
    try {
      await fetch("/api/friends/respond", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ requesterClerkId: n.actorClerkId, accept }),
      });
    } catch {
      /* ignore */
    }
  }

  if (!isLoaded) return null;

  const filtered = notifications.filter((n) => passesFilter(n, filter));
  const groups = groupByDate(filtered);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white">
        <div className="w-full flex flex-row max-w-[1600px] mx-auto">
          <ArchiveLeftSidebar />
          <SidebarInsetSpacer />

          <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
            <div className="w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
              {!user ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <p className="text-xs text-stone-400">Sign in to view notifications.</p>
                </div>
              ) : (
                <>
                  <Tabs
                    selectedKey={filter}
                    onSelectionChange={(key) => setFilter(String(key) as FilterKey)}
                    className="w-full"
                  >
                    <Tabs.ListContainer className="mb-6 flex justify-start bg-transparent shadow-none">
                      <Tabs.List
                        aria-label="Filter notifications"
                        className="w-fit bg-transparent *:h-6 *:w-fit *:px-3 *:text-sm *:font-normal *:data-[selected=true]:text-accent-foreground"
                      >
                        {FILTERS.map(({ key, label }) => (
                          <Tabs.Tab key={key} id={key}>
                            {label}
                            <Tabs.Indicator className="bg-accent" />
                          </Tabs.Tab>
                        ))}
                      </Tabs.List>
                    </Tabs.ListContainer>
                  </Tabs>

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
                              <NotificationRow
                                key={n._id}
                                n={n}
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

function NotificationRow({
  n,
  onFriendRespond,
}: {
  n: NotifRowData;
  onFriendRespond: (n: NotifRowData, accept: boolean) => void;
}) {
  const hasPostThumb = n.postId && (n.type === "like" || n.type === "comment");

  return (
    <li>
      <div className="flex items-center gap-3 py-3 transition-colors hover:bg-stone-50/80">
        <Link
          href={`/profile/${encodeURIComponent(n.actorClerkId)}`}
          className="flex-shrink-0"
        >
          <ActorAvatar n={n} />
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-stone-700 leading-snug">
            <Link
              href={`/profile/${encodeURIComponent(n.actorClerkId)}`}
              className="font-medium text-stone-800 hover:underline underline-offset-2"
            >
              {n.actorFullName}
            </Link>{" "}
            <span className="text-stone-500">{labelFor(n)}</span>{" "}
            <span className="text-stone-400 text-xs">{formatTime(n.createdAt)}</span>
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          {hasPostThumb && n.postImageUrl ? (
            <Link href={`/post/${encodeURIComponent(n.postId!)}`}>
              <img
                src={n.postImageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg object-cover hover:opacity-90 transition-opacity"
              />
            </Link>
          ) : null}

          {n.type === "follow" ? (
            <FollowButton
              targetUserId={n.actorClerkId}
              className="text-xs px-4 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors min-w-[5rem]"
            />
          ) : null}

          {n.type === "friend_request" ? (
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
          ) : null}
        </div>
      </div>
    </li>
  );
}
