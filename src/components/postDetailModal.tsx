"use client";

import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, useOverlayState } from "@heroui/react";
import {
  Cancel01Icon,
  Comment01Icon,
  CommentBlock01Icon,
  Delete02Icon,
  Edit02Icon,
  FavouriteIcon,
  Flag01Icon,
  LinkSquare02Icon,
  MoreHorizontalIcon,
  RepostIcon,
  UserIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { MessageCircleIcon, BookmarkIcon as LucideBookmarkIcon } from "lucide-react";
import type { EditPostVisibility } from "@/components/editPostModal";
import { PostMediaCarousel } from "@/components/postMediaCarousel";
import {
  modalMediaBoxSize,
  parsePostAspectRatio,
  POST_ASPECT_SQUARE,
  POST_MODAL_SIDEBAR_WIDTH,
} from "@/lib/postAspectRatio";
import {
  type FeedPost,
  feedPostMediaUrls,
} from "@/types/feedPost";

const EditPostModal = dynamic(() => import("@/components/editPostModal"), {
  ssr: false,
});

type CommentRow = {
  _id: string;
  authorClerkId: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  body: string;
  createdAt?: string;
};

function parseVisibility(v: unknown): EditPostVisibility {
  return v === "friends" || v === "private" ? v : "public";
}

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 60000;
  if (diff < 1) return "now";
  if (diff < 60) return `${Math.floor(diff)}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  if (diff < 1440 * 7) return `${Math.floor(diff / 1440)}d`;
  if (diff < 1440 * 30) return `${Math.floor(diff / (1440 * 7))}w`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatAbsoluteDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <HugeiconsIcon
    icon={FavouriteIcon}
    size={24}
    strokeWidth={filled ? 0 : 1.75}
    fill={filled ? "currentColor" : "none"}
    className={`block size-6 shrink-0 ${filled ? "text-red-500" : ""}`}
  />
);

const ChatIcon = () => (
  <MessageCircleIcon absoluteStrokeWidth className="block size-6 shrink-0" strokeWidth={1.75} />
);

const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
  <LucideBookmarkIcon
    absoluteStrokeWidth
    className="block size-6 shrink-0"
    strokeWidth={1.75}
    fill={filled ? "currentColor" : "none"}
  />
);

const RepostActionIcon = ({ active }: { active?: boolean }) => (
  <HugeiconsIcon
    icon={RepostIcon}
    size={24}
    strokeWidth={1.75}
    className={`block size-6 shrink-0 ${active ? "text-emerald-600" : ""}`}
  />
);

function ActionRow({
  label,
  icon,
  danger,
  onClick,
}: {
  label: string;
  icon?: IconSvgElement;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`mx-2 flex w-[calc(100%-1rem)] items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors hover:bg-neutral-100 ${
        danger ? "text-red-600" : "text-neutral-900"
      }`}
    >
      <span>{label}</span>
      {icon ? (
        <HugeiconsIcon
          icon={icon}
          size={18}
          strokeWidth={1.6}
          className={`shrink-0 ${danger ? "text-red-600" : "text-neutral-800"}`}
        />
      ) : null}
    </button>
  );
}

function MoreMenu({
  postId,
  isOwner,
  authorClerkId,
  onEdit,
  onDeleted,
  onRepost,
  reposted,
}: {
  postId: string;
  isOwner: boolean;
  authorClerkId?: string;
  onEdit?: () => void;
  onDeleted?: () => void;
  onRepost?: () => void;
  reposted?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hideLikeCount, setHideLikeCount] = useState(false);
  const [commentsOff, setCommentsOff] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopImmediatePropagation();
      setOpen(false);
    }
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  async function handleDelete() {
    if (!window.confirm("Delete this post permanently? This cannot be undone.")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Delete failed (${res.status})`);
      }
      setOpen(false);
      onDeleted?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not delete post.");
    } finally {
      setDeleting(false);
    }
  }

  function goToPost() {
    setOpen(false);
    // Permalink in a new tab — does not hijack the current page.
    window.open(`/post/${encodeURIComponent(postId)}`, "_blank", "noopener,noreferrer");
  }

  function aboutAccount() {
    setOpen(false);
    if (authorClerkId) {
      window.location.assign(`/profile/${encodeURIComponent(authorClerkId)}`);
    }
  }

  const sheet =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Dismiss"
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <div
              role="menu"
              aria-label="Post options"
              className="relative z-[111] w-full max-w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="py-2">
              {isOwner ? (
                <>
                  <ActionRow
                    label={deleting ? "Deleting…" : "Delete"}
                    icon={Delete02Icon}
                    danger
                    onClick={() => {
                      if (!deleting) void handleDelete();
                    }}
                  />
                  <ActionRow
                    label="Edit"
                    icon={Edit02Icon}
                    onClick={() => {
                      setOpen(false);
                      onEdit?.();
                    }}
                  />
                  <ActionRow
                    label={
                      hideLikeCount
                        ? "Unhide like count to others"
                        : "Hide like count from others"
                    }
                    icon={hideLikeCount ? ViewIcon : ViewOffSlashIcon}
                    onClick={() => {
                      setHideLikeCount((v) => !v);
                      setOpen(false);
                    }}
                  />
                  <ActionRow
                    label={
                      commentsOff ? "Turn on commenting" : "Turn off commenting"
                    }
                    icon={commentsOff ? Comment01Icon : CommentBlock01Icon}
                    onClick={() => {
                      setCommentsOff((v) => !v);
                      setOpen(false);
                    }}
                  />
                  <ActionRow
                    label="Go to post"
                    icon={LinkSquare02Icon}
                    onClick={goToPost}
                  />
                  <ActionRow
                    label="About this account"
                    icon={UserIcon}
                    onClick={aboutAccount}
                  />
                  <ActionRow
                    label="Cancel"
                    icon={Cancel01Icon}
                    onClick={() => setOpen(false)}
                  />
                </>
              ) : (
                <>
                  <ActionRow
                    label={reposted ? "Remove repost" : "Repost"}
                    icon={RepostIcon}
                    onClick={() => {
                      setOpen(false);
                      onRepost?.();
                    }}
                  />
                  <ActionRow
                    label="Report"
                    icon={Flag01Icon}
                    danger
                    onClick={() => setOpen(false)}
                  />
                  <ActionRow
                    label="Go to post"
                    icon={LinkSquare02Icon}
                    onClick={goToPost}
                  />
                  <ActionRow
                    label="About this account"
                    icon={UserIcon}
                    onClick={aboutAccount}
                  />
                  <ActionRow
                    label="Cancel"
                    icon={Cancel01Icon}
                    onClick={() => setOpen(false)}
                  />
                </>
              )}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-stone-900 transition-colors hover:bg-stone-100"
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} size={20} strokeWidth={2} />
      </button>
      {sheet}
    </>
  );
}

function mongooseObjectIdOk(id: string) {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

export default function PostDetailModal({
  postId,
  onClose,
}: {
  postId: string;
  /** Close the overlay in place — no routing. */
  onClose: () => void;
}) {
  const { user, isLoaded } = useUser();
  const editModalState = useOverlayState({ defaultOpen: false });
  const [mounted, setMounted] = useState(false);
  const [post, setPost] = useState<FeedPost | null>(null);
  const [error, setError] = useState<"missing" | "notfound" | "failed" | null>(null);
  const [loading, setLoading] = useState(true);

  const [displayBody, setDisplayBody] = useState("");
  const [displayLocation, setDisplayLocation] = useState("");
  const [displayVisibility, setDisplayVisibility] =
    useState<EditPostVisibility>("public");
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  const [recentLikers, setRecentLikers] = useState<
    { clerkId: string; username: string; imageUrl: string }[]
  >([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [repostPending, setRepostPending] = useState(false);
  const [frameRatio, setFrameRatio] = useState(POST_ASPECT_SQUARE);
  const [viewport, setViewport] = useState({ w: 1200, h: 800 });
  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = onClose;

  useEffect(() => {
    function syncViewport() {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    }
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    setFrameRatio(
      parsePostAspectRatio(post?.aspectRatio) ?? POST_ASPECT_SQUARE
    );
  }, [postId, post?.aspectRatio]);

  const stacked = viewport.w < 768;
  const mediaBox = useMemo(
    () =>
      modalMediaBoxSize(frameRatio, viewport.w, viewport.h, {
        sidebarWidth: POST_MODAL_SIDEBAR_WIDTH,
        stacked,
      }),
    [frameRatio, viewport.w, viewport.h, stacked]
  );

  useEffect(() => {
    if (!postId || !mongooseObjectIdOk(postId)) {
      setError("missing");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(postId)}`, {
          credentials: "include",
        });
        if (cancelled) return;
        if (res.status === 404) {
          setPost(null);
          setError("notfound");
          return;
        }
        if (!res.ok) {
          setPost(null);
          setError("failed");
          return;
        }
        const data = (await res.json()) as FeedPost;
        if (cancelled) return;
        setPost(data);
        setDisplayBody(data.body ?? "");
        setDisplayLocation(data.location ?? "");
        setDisplayVisibility(parseVisibility(data.visibility));
        if (data.engagement) {
          setLikeCount(data.engagement.likeCount ?? 0);
          setCommentCount(data.engagement.commentCount ?? 0);
          setRepostCount(data.engagement.repostCount ?? 0);
          setLiked(Boolean(data.engagement.likedByMe));
          setSaved(Boolean(data.engagement.savedByMe));
          setReposted(Boolean(data.engagement.repostedByMe));
        }
        setError(null);
      } catch {
        if (!cancelled) {
          setPost(null);
          setError("failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  useEffect(() => {
    if (!postId || !mongooseObjectIdOk(postId) || !post) return;
    const ac = new AbortController();

    void (async () => {
      try {
        const [engRes, commentsRes] = await Promise.all([
          fetch(`/api/posts/${encodeURIComponent(postId)}/engagement`, {
            credentials: "include",
            signal: ac.signal,
          }),
          fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
            credentials: "include",
            signal: ac.signal,
          }),
        ]);

        if (ac.signal.aborted) return;

        if (engRes.ok) {
          const data = await engRes.json();
          if (ac.signal.aborted) return;
          setLikeCount(data.likeCount ?? 0);
          setCommentCount(data.commentCount ?? 0);
          setRepostCount(data.repostCount ?? 0);
          setLiked(Boolean(data.likedByMe));
          setSaved(Boolean(data.savedByMe));
          setReposted(Boolean(data.repostedByMe));
          setRecentLikers(
            Array.isArray(data.recentLikers) ? data.recentLikers.slice(0, 3) : []
          );
        }

        if (commentsRes.ok) {
          const data = await commentsRes.json();
          if (ac.signal.aborted) return;
          const rows = Array.isArray(data.comments) ? data.comments : [];
          setComments([...rows].reverse());
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    })();

    return () => ac.abort();
  }, [postId, post]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose from parent
  }, [onClose]);

  const signedIn = Boolean(user);
  const isOwner = Boolean(
    isLoaded && user?.id && post?.authorClerkId && user.id === post.authorClerkId
  );
  const resolvedUsername = (post?.username || "username").replace(/^@+/, "");
  const resolvedImage =
    post?.avatarUrl ?? "https://i.pravatar.cc/150?u=placeholder";
  const profileHref = post?.authorClerkId
    ? `/profile/${encodeURIComponent(post.authorClerkId)}`
    : null;
  const media = feedPostMediaUrls(post?.media);
  const relativeTime = formatRelativeTime(post?.createdAt);
  const absoluteDate = formatAbsoluteDate(post?.createdAt);

  async function toggleLike() {
    if (!signedIn || !user || !postId || likePending) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    const prevLikers = recentLikers;
    const nextLiked = !prevLiked;
    const meLiker = {
      clerkId: user.id,
      username: (user.username || user.firstName || "you").replace(/^@+/, ""),
      imageUrl: user.imageUrl || `https://i.pravatar.cc/150?u=${user.id}`,
    };
    setLiked(nextLiked);
    setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    setRecentLikers((prev) => {
      if (nextLiked) {
        return [meLiker, ...prev.filter((l) => l.clerkId !== user.id)].slice(0, 3);
      }
      return prev.filter((l) => l.clerkId !== user.id);
    });
    setLikePending(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        setLiked(prevLiked);
        setLikeCount(prevCount);
        setRecentLikers(prevLikers);
        return;
      }
      const data = await res.json();
      setLiked(Boolean(data.liked));
      if (typeof data.likeCount === "number") setLikeCount(data.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      setRecentLikers(prevLikers);
    } finally {
      setLikePending(false);
    }
  }

  async function toggleSave() {
    if (!signedIn || !postId || savePending) return;
    const prevSaved = saved;
    setSaved(!prevSaved);
    setSavePending(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/save`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        setSaved(prevSaved);
        return;
      }
      const data = await res.json();
      setSaved(Boolean(data.saved));
    } catch {
      setSaved(prevSaved);
    } finally {
      setSavePending(false);
    }
  }

  async function toggleRepost() {
    if (!signedIn || !postId || repostPending || isOwner) return;
    const prevReposted = reposted;
    const prevCount = repostCount;
    const next = !prevReposted;
    setReposted(next);
    setRepostCount((c) => Math.max(0, c + (next ? 1 : -1)));
    setRepostPending(true);
    try {
      const res = await fetch(
        `/api/posts/${encodeURIComponent(postId)}/repost`,
        { method: "POST", credentials: "include" }
      );
      if (!res.ok) {
        setReposted(prevReposted);
        setRepostCount(prevCount);
        return;
      }
      const data = await res.json();
      setReposted(Boolean(data.reposted));
      if (typeof data.repostCount === "number") setRepostCount(data.repostCount);
    } catch {
      setReposted(prevReposted);
      setRepostCount(prevCount);
    } finally {
      setRepostPending(false);
    }
  }

  async function submitComment() {
    const t = commentText.trim();
    if (!signedIn || !postId || !t || commentSubmitting) return;
    setCommentSubmitting(true);
    try {
      const res = await fetch(
        `/api/posts/${encodeURIComponent(postId)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ body: t }),
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setCommentCount((c) => c + 1);
        setCommentText("");
      }
    } finally {
      setCommentSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        onClick={close}
      />

      <button
        type="button"
        aria-label="Close post"
        onClick={close}
        className="absolute right-4 top-4 z-[90] rounded-full p-2 text-white transition-colors hover:bg-white/10"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={22} strokeWidth={1.8} />
      </button>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Post"
        className={`relative z-[85] flex max-h-[90vh] max-w-full overflow-hidden rounded-sm bg-white shadow-2xl ${
          stacked ? "flex-col" : "flex-row items-stretch"
        }`}
        style={
          stacked
            ? { width: Math.min(viewport.w - 32, Math.max(mediaBox.width, 320)) }
            : {
                width: mediaBox.width + POST_MODAL_SIDEBAR_WIDTH,
                height: mediaBox.height,
              }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div
            className="flex items-center justify-center bg-stone-50"
            style={{ width: mediaBox.width, height: mediaBox.height }}
          >
            <div className="h-8 w-8 animate-pulse rounded-full bg-stone-200" />
          </div>
        ) : error === "missing" ? (
          <div className="flex w-[min(90vw,420px)] flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="text-sm text-stone-500">Invalid post link.</p>
            <button
              type="button"
              onClick={close}
              className="text-sm text-stone-800 underline underline-offset-4"
            >
              Close
            </button>
          </div>
        ) : error === "notfound" ? (
          <div className="flex w-[min(90vw,420px)] flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="text-sm text-stone-500">This post isn&apos;t available.</p>
            <button
              type="button"
              onClick={close}
              className="text-sm text-stone-800 underline underline-offset-4"
            >
              Close
            </button>
          </div>
        ) : error === "failed" || !post ? (
          <div className="flex w-[min(90vw,420px)] flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="text-sm text-stone-500">Could not load this post.</p>
            <button
              type="button"
              onClick={close}
              className="text-sm text-stone-800 underline underline-offset-4"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Media — pixel box sized from aspect ratio */}
            <div
              className="relative shrink-0 bg-black"
              style={{ width: mediaBox.width, height: mediaBox.height }}
            >
              <PostMediaCarousel
                media={media}
                alt={
                  displayBody.trim()
                    ? displayBody.trim().slice(0, 80)
                    : `Post by ${resolvedUsername}`
                }
                variant="modal"
                frameSize={mediaBox}
                forcedAspectRatio={parsePostAspectRatio(post.aspectRatio)}
                onAspectRatio={setFrameRatio}
              />
            </div>

            {/* Sidebar — matches media height on desktop */}
            <div
              className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-white md:shrink-0"
              style={
                stacked
                  ? undefined
                  : {
                      width: POST_MODAL_SIDEBAR_WIDTH,
                      height: mediaBox.height,
                    }
              }
            >
              <header className="flex shrink-0 items-center gap-3 border-b border-stone-200 px-4 py-3">
                {profileHref ? (
                  <Link
                    href={profileHref}
                    className="shrink-0 rounded-full"
                    aria-label={`View ${resolvedUsername}'s profile`}
                  >
                    <img
                      src={resolvedImage}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </Link>
                ) : (
                  <img
                    src={resolvedImage}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  {profileHref ? (
                    <Link
                      href={profileHref}
                      className="block truncate text-sm font-semibold text-stone-900"
                    >
                      {resolvedUsername}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {resolvedUsername}
                    </p>
                  )}
                  {displayLocation.trim() ? (
                    <p className="truncate text-xs text-stone-500">
                      {displayLocation.trim()}
                    </p>
                  ) : null}
                </div>
                <MoreMenu
                  postId={postId}
                  isOwner={isOwner}
                  authorClerkId={post.authorClerkId}
                  onEdit={() => editModalState.open()}
                  onDeleted={close}
                  onRepost={() => void toggleRepost()}
                  reposted={reposted}
                />
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                {displayBody.trim() ? (
                  <div className="mb-4 flex gap-3">
                    {profileHref ? (
                      <Link href={profileHref} className="shrink-0">
                        <img
                          src={resolvedImage}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      </Link>
                    ) : (
                      <img
                        src={resolvedImage}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm leading-snug text-stone-800 break-words">
                        {profileHref ? (
                          <Link
                            href={profileHref}
                            className="font-semibold hover:underline"
                          >
                            {resolvedUsername}
                          </Link>
                        ) : (
                          <span className="font-semibold">{resolvedUsername}</span>
                        )}{" "}
                        {displayBody.trim()}
                      </p>
                      {relativeTime ? (
                        <p className="mt-1 text-xs text-stone-400">{relativeTime}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {comments.length === 0 ? (
                  <p className="py-6 text-center text-sm text-stone-300">
                    No comments yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {comments.map((c) => {
                      const handle = (c.username || c.fullName || "user").replace(
                        /^@+/,
                        ""
                      );
                      return (
                        <div key={c._id} className="flex gap-3">
                          <Link
                            href={`/profile/${encodeURIComponent(c.authorClerkId)}`}
                            className="shrink-0"
                          >
                            <img
                              src={
                                c.avatarUrl ||
                                "https://i.pravatar.cc/150?u=placeholder"
                              }
                              alt=""
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-snug text-stone-800 break-words">
                              <Link
                                href={`/profile/${encodeURIComponent(c.authorClerkId)}`}
                                className="font-semibold hover:underline"
                              >
                                {handle}
                              </Link>{" "}
                              {c.body}
                            </p>
                            <p className="mt-1 text-xs text-stone-400">
                              {formatRelativeTime(c.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-stone-200 px-4 py-3">
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    disabled={!isLoaded || !signedIn}
                    onClick={() => void toggleLike()}
                    aria-label={liked ? "Unlike" : "Like"}
                    className={`grid size-6 place-items-center transition-colors disabled:opacity-40 ${
                      liked ? "text-rose-500" : "text-stone-800 hover:text-stone-500"
                    }`}
                  >
                    <HeartIcon filled={liked} />
                  </button>
                  <button
                    type="button"
                    disabled={!isLoaded || !signedIn}
                    onClick={() => commentInputRef.current?.focus()}
                    aria-label="Comment"
                    className="grid size-6 place-items-center text-stone-800 transition-colors hover:text-stone-500 disabled:opacity-40"
                  >
                    <ChatIcon />
                  </button>
                  {!isOwner ? (
                    <button
                      type="button"
                      disabled={!isLoaded || !signedIn || repostPending}
                      onClick={() => void toggleRepost()}
                      aria-label={reposted ? "Remove repost" : "Repost"}
                      className={`grid size-6 place-items-center transition-colors disabled:opacity-40 ${
                        reposted
                          ? "text-emerald-600"
                          : "text-stone-800 hover:text-stone-500"
                      }`}
                    >
                      <RepostActionIcon active={reposted} />
                    </button>
                  ) : null}
                  <span className="flex-1" aria-hidden />
                  <button
                    type="button"
                    disabled={!isLoaded || !signedIn}
                    onClick={() => void toggleSave()}
                    aria-label={saved ? "Unsave" : "Save"}
                    className={`grid size-6 place-items-center transition-colors disabled:opacity-40 ${
                      saved ? "text-stone-900" : "text-stone-800 hover:text-stone-500"
                    }`}
                  >
                    <BookmarkIcon filled={saved} />
                  </button>
                </div>

                {likeCount > 0 ? (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      {recentLikers.length > 0 ? (
                        <div className="flex shrink-0 -space-x-1.5">
                          {recentLikers.slice(0, 3).map((liker, i) => (
                            <img
                              key={liker.clerkId}
                              src={liker.imageUrl}
                              alt=""
                              className="h-5 w-5 rounded-full object-cover ring-2 ring-white"
                              style={{ zIndex: 3 - i }}
                            />
                          ))}
                        </div>
                      ) : null}
                      <p className="min-w-0 text-sm text-stone-900">
                        {recentLikers[0] ? (
                          <>
                            Liked by{" "}
                            <Link
                              href={`/profile/${encodeURIComponent(recentLikers[0].clerkId)}`}
                              className="font-semibold hover:underline"
                            >
                              {recentLikers[0].username}
                            </Link>
                            {likeCount > 1 ? (
                              <>
                                {" "}
                                and{" "}
                                <span className="font-semibold">others</span>
                              </>
                            ) : null}
                          </>
                        ) : (
                          <span className="font-semibold">
                            {likeCount === 1 ? "1 like" : `${likeCount} likes`}
                          </span>
                        )}
                      </p>
                    </div>
                    {absoluteDate ? (
                      <p className="mt-1 text-xs text-stone-400">{absoluteDate}</p>
                    ) : null}
                  </div>
                ) : absoluteDate ? (
                  <p className="mt-2 text-xs text-stone-400">{absoluteDate}</p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2 border-t border-stone-200 px-4 py-3">
                {signedIn ? (
                  <>
                    <input
                      ref={commentInputRef}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void submitComment();
                        }
                      }}
                      placeholder="Add a comment..."
                      className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      isDisabled={commentSubmitting || !commentText.trim()}
                      isPending={commentSubmitting}
                      onPress={() => void submitComment()}
                      className="shrink-0 font-semibold text-sky-500 disabled:text-sky-300"
                    >
                      Post
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-stone-400">Sign in to comment.</p>
                )}
              </div>

              {isOwner ? (
                <EditPostModal
                  state={editModalState}
                  postId={postId}
                  initialBio={displayBody}
                  initialLocation={displayLocation}
                  initialVisibility={displayVisibility}
                  onSaved={(data) => {
                    setDisplayBody(data.body);
                    setDisplayLocation(data.location ?? "");
                    setDisplayVisibility(data.visibility);
                  }}
                  onDeleted={() => {
                    close();
                  }}
                />
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
