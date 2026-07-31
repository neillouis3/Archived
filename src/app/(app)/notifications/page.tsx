"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useState, type ComponentType } from "react";
import { Chip, Skeleton } from "@heroui/react";
import {
  Heart,
  LayoutGrid,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import FollowButton from "@/components/FollowButton";
import { usePostViewerOptional } from "@/components/postViewerContext";

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

type FilterKey = "all" | "follow" | "comment" | "like";

const FILTERS: {
  key: FilterKey;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number; absoluteStrokeWidth?: boolean }>;
}[] = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "follow", label: "Follows", icon: UserPlus },
  { key: "like", label: "Likes", icon: Heart },
  { key: "comment", label: "Comments", icon: MessageCircle },
];

function passesFilter(n: NotifRowData, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "follow") return n.type === "follow";
  if (filter === "like") return n.type === "like";
  if (filter === "comment") return n.type === "comment";
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
    case "repost":
      return "reposted your post.";
    case "comment": {
      if (!n.snippet) return "commented on your post.";
      const s = n.snippet.length > 80 ? `${n.snippet.slice(0, 77)}…` : n.snippet;
      return `commented: "${s}"`;
    }
    case "follow":
      return "started following you.";
    default:
      return "interacted with you.";
  }
}

function ActorAvatar({ n }: { n: NotifRowData }) {
  const [broken, setBroken] = useState(false);
  const avatarClass =
    "size-8 rounded-full object-cover ring-1 ring-stone-200/60 hover:opacity-90 transition-opacity";

  const initial = (n.actorFullName || "?").trim().charAt(0).toUpperCase() || "?";

  if (!n.actorImageUrl || broken) {
    return (
      <div
        className={`${avatarClass} flex items-center justify-center bg-stone-100 text-xs font-medium text-stone-500`}
        aria-hidden
      >
        {initial}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={n.actorImageUrl}
      alt=""
      className={avatarClass}
      onError={() => setBroken(true)}
    />
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

  if (!isLoaded) return null;

  const filtered = notifications.filter((n) => passesFilter(n, filter));
  const groups = groupByDate(filtered);

  return (
    <div className="flex-1 min-w-0 flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {!user ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <p className="text-xs text-stone-400">Sign in to view notifications.</p>
          </div>
        ) : (
          <>
            <div
              className="mb-6 flex flex-wrap gap-2"
              role="tablist"
              aria-label="Filter notifications"
            >
              {FILTERS.map(({ key, label, icon: Icon }) => {
                const selected = filter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setFilter(key)}
                    className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                  >
                    <Chip
                      size="md"
                      variant="tertiary"
                      color="default"
                      className={`cursor-pointer border bg-transparent text-sm font-normal transition-colors [&_.chip__label]:text-sm ${
                        selected
                          ? "border-stone-800 text-stone-900"
                          : "border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-800"
                      }`}
                    >
                      <Icon
                        absoluteStrokeWidth
                        className="size-3.5 shrink-0"
                        strokeWidth={1.75}
                      />
                      <Chip.Label className="text-sm">{label}</Chip.Label>
                    </Chip>
                  </button>
                );
              })}
            </div>

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
                    <ul className="flex flex-col">
                      {items.map((n) => (
                        <NotificationRow key={n._id} n={n} />
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
  );
}

function NotificationRow({ n }: { n: NotifRowData }) {
  const { openPost } = usePostViewerOptional();
  const hasPostThumb = n.postId && (n.type === "like" || n.type === "comment" || n.type === "repost");

  return (
    <li>
      <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-stone-50/80 sm:px-4">
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
              {(n.actorUsername || n.actorFullName || "user").replace(/^@+/, "")}
            </Link>{" "}
            <span className="text-stone-500">{labelFor(n)}</span>{" "}
            <span className="text-stone-400 text-xs">{formatTime(n.createdAt)}</span>
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          {hasPostThumb && n.postImageUrl ? (
            <button
              type="button"
              onClick={() => openPost(n.postId!)}
              className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
            >
              <img
                src={n.postImageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="size-9 rounded-lg object-cover transition-opacity hover:opacity-90"
              />
            </button>
          ) : null}

          {n.type === "follow" ? (
            <FollowButton
              targetUserId={n.actorClerkId}
              className="text-xs px-4 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors min-w-[5rem]"
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}
