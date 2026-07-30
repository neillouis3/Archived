"use client";

import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Link from "next/link";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, useOverlayState } from "@heroui/react";
import {
  FavouriteIcon,
  MoreHorizontalIcon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { MessageCircleIcon, BookmarkIcon as LucideBookmarkIcon } from "lucide-react";
import type { EditPostVisibility } from "@/components/editPostModal";
import { PostMediaCarousel } from "@/components/postMediaCarousel";
import FollowButton from "@/components/FollowButton";

const EditPostModal = dynamic(() => import("@/components/editPostModal"), {
  ssr: false,
});

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

const DotsIcon = () => (
  <HugeiconsIcon icon={MoreHorizontalIcon} size={20} strokeWidth={2} />
);

function PostMoreMenu({
  postId,
  isOwner,
  onEdit,
}: {
  postId: string;
  isOwner: boolean;
  onEdit?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function updatePosition() {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      top: rect.bottom + 6,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onReposition() {
      updatePosition();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  async function copyLink() {
    const url = `${window.location.origin}/post/${encodeURIComponent(postId)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  const menu =
    open && pos
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[100] min-w-[160px] overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            style={{ top: pos.top, right: pos.right }}
          >
            {isOwner ? (
              <button
                type="button"
                role="menuitem"
                className="flex w-full px-3 py-2.5 text-left text-sm text-stone-900 hover:bg-stone-50"
                onClick={() => {
                  setOpen(false);
                  onEdit?.();
                }}
              >
                Edit
              </button>
            ) : null}
            <button
              type="button"
              role="menuitem"
              className="flex w-full px-3 py-2.5 text-left text-sm text-stone-900 hover:bg-stone-50"
              onClick={() => void copyLink()}
            >
              Copy link
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-stone-900 hover:bg-stone-100 transition-colors"
      >
        <DotsIcon />
      </button>
      {menu}
    </>
  );
}

const PinIcon = () => (
  <HugeiconsIcon
    icon={Location01Icon}
    size={12}
    strokeWidth={1.5}
    className="shrink-0 text-stone-300"
  />
);

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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCommentTime(dateStr?: string) {
  return formatRelativeTime(dateStr);
}

type CommentRow = {
  _id: string;
  authorClerkId: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  body: string;
  createdAt?: string;
};

export type PostEngagementSnapshot = {
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
};

interface ArchivePostProps {
  postId: string;
  authorClerkId?: string;
  fullName: string;
  description: string;
  mediaUrl: string[];
  username: string;
  imageUrl: string;
  createdAt?: string;
  visibility?: string;
  location?: string;
  /** From GET /api/posts batch — avoids a per-post /engagement request. */
  initialEngagement?: PostEngagementSnapshot | null;
  onPostDeleted?: (postId: string) => void;
  /** Instagram-style follow CTA on suggested posts. */
  showFollow?: boolean;
  /** Stored post frame ratio (4/5, 1, 5/4, 1.91). */
  aspectRatio?: number;
}

function ArchivePost({
  postId,
  authorClerkId,
  fullName: _fullName,
  description,
  mediaUrl,
  username,
  imageUrl,
  createdAt,
  visibility: visibilityProp,
  location: locationProp,
  initialEngagement,
  onPostDeleted,
  showFollow = false,
  aspectRatio: aspectRatioProp,
}: ArchivePostProps) {
  const { user, isLoaded } = useUser();
  const editModalState = useOverlayState({ defaultOpen: false });
  const [displayBody, setDisplayBody] = useState(description);
  const [displayLocation, setDisplayLocation] = useState(locationProp ?? "");
  const [displayVisibility, setDisplayVisibility] = useState(() =>
    parseVisibility(visibilityProp)
  );
  const [likeCount, setLikeCount] = useState(() => initialEngagement?.likeCount ?? 0);
  const [commentCount, setCommentCount] = useState(
    () => initialEngagement?.commentCount ?? 0
  );
  const [liked, setLiked] = useState(() => Boolean(initialEngagement?.likedByMe));
  const [saved, setSaved] = useState(() => Boolean(initialEngagement?.savedByMe));
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [engagementLoading, setEngagementLoading] = useState(!initialEngagement);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const commentsLoadedRef = useRef(false);

  useEffect(() => {
    commentsLoadedRef.current = false;
  }, [postId]);

  useEffect(() => {
    if (initialEngagement != null) {
      setLikeCount(initialEngagement.likeCount);
      setCommentCount(initialEngagement.commentCount);
      setLiked(Boolean(initialEngagement.likedByMe));
      setSaved(Boolean(initialEngagement.savedByMe));
      setEngagementLoading(false);
      return;
    }

    if (!postId) return;
    const ac = new AbortController();
    setEngagementLoading(true);
    void (async () => {
      try {
        const res = await fetch(
          `/api/posts/${encodeURIComponent(postId)}/engagement`,
          { credentials: "include", signal: ac.signal }
        );
        if (!res.ok || ac.signal.aborted) return;
        const data = await res.json();
        if (ac.signal.aborted) return;
        setLikeCount(data.likeCount ?? 0);
        setCommentCount(data.commentCount ?? 0);
        setLiked(Boolean(data.likedByMe));
        setSaved(Boolean(data.savedByMe));
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      } finally {
        if (!ac.signal.aborted) setEngagementLoading(false);
      }
    })();
    return () => ac.abort();
  }, [
    postId,
    Boolean(initialEngagement),
    initialEngagement?.likeCount,
    initialEngagement?.commentCount,
    initialEngagement?.likedByMe,
    initialEngagement?.savedByMe,
  ]);

  useEffect(() => {
    setDisplayBody(description);
    setDisplayLocation(locationProp ?? "");
    setDisplayVisibility(parseVisibility(visibilityProp));
  }, [postId, description, locationProp, visibilityProp]);

  const isOwner = Boolean(isLoaded && user?.id && authorClerkId && user.id === authorClerkId);

  const resolvedImage = imageUrl ?? "https://i.pravatar.cc/150?u=placeholder";
  const resolvedUsername = (username || "username").replace(/^@+/, "");
  const profileHref = authorClerkId
    ? `/profile/${encodeURIComponent(authorClerkId)}`
    : null;

  const media = mediaUrl.filter(Boolean);

  const signedIn = Boolean(user);

  async function toggleLike() {
    if (!signedIn || !postId || likePending) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    const nextLiked = !prevLiked;
    setLiked(nextLiked);
    setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    setLikePending(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        setLiked(prevLiked);
        setLikeCount(prevCount);
        return;
      }
      const data = await res.json();
      setLiked(Boolean(data.liked));
      if (typeof data.likeCount === "number") setLikeCount(data.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
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

  async function submitComment() {
    const t = commentText.trim();
    if (!signedIn || !postId || !t || commentSubmitting) return;
    setCommentSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: t }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.comment) {
        commentsLoadedRef.current = true;
        setComments((prev) => [...prev, data.comment]);
        setCommentCount((c) => c + 1);
        setCommentText("");
      }
    } finally {
      setCommentSubmitting(false);
    }
  }

  function toggleComments() {
    setCommentsOpen((prev) => {
      const next = !prev;
      if (next && postId && !commentsLoadedRef.current) {
        void (async () => {
          try {
            const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
              credentials: "include",
            });
            if (!res.ok) return;
            const data = await res.json();
            const rows = Array.isArray(data.comments) ? data.comments : [];
            commentsLoadedRef.current = true;
            setComments([...rows].reverse());
          } catch {
            /* ignore */
          }
        })();
      }
      return next;
    });
  }

  const relativeTime = formatRelativeTime(createdAt);

  return (
    <article className="flex flex-col">
      <div className="mb-3 flex w-full items-center gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {profileHref ? (
            <Link
              href={profileHref}
              className="shrink-0 rounded-full"
              aria-label={`View ${resolvedUsername}'s profile`}
            >
              <img
                src={resolvedImage}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-8 w-8 rounded-full object-cover"
              />
            </Link>
          ) : (
            <img
              src={resolvedImage}
              alt={resolvedUsername}
              loading="lazy"
              decoding="async"
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          )}
          <span className="flex min-w-0 items-center gap-1.5 truncate text-sm">
            {profileHref ? (
              <Link
                href={profileHref}
                className="truncate font-medium text-stone-900"
              >
                {resolvedUsername}
              </Link>
            ) : (
              <span className="truncate font-medium text-stone-900">
                {resolvedUsername}
              </span>
            )}
            {relativeTime ? (
              <>
                <span className="shrink-0 text-stone-300" aria-hidden>
                  ·
                </span>
                <time
                  className="shrink-0 font-normal text-stone-400"
                  dateTime={createdAt}
                >
                  {relativeTime}
                </time>
              </>
            ) : null}
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {showFollow && authorClerkId && !isOwner ? (
            <FollowButton
              targetUserId={authorClerkId}
              hideIfFollowing
              className="text-xs px-2.5 py-1 rounded-md border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors"
            />
          ) : null}
          <PostMoreMenu
            postId={postId}
            isOwner={isOwner}
            onEdit={() => editModalState.open()}
          />
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
                onPostDeleted?.(postId);
                if (!onPostDeleted) window.location.reload();
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="relative w-full overflow-hidden rounded-md border border-stone-200/80 bg-white">
        <PostMediaCarousel
          media={media}
          alt={
            displayBody.trim()
              ? displayBody.trim().slice(0, 80)
              : `Post by ${resolvedUsername}`
          }
          forcedAspectRatio={aspectRatioProp}
        />
      </div>

      <div className="mt-3 flex w-full items-center gap-3">
        <div className="flex h-6 items-center gap-1.5">
          <button
            type="button"
            disabled={!isLoaded || !signedIn}
            onClick={toggleLike}
            title={!signedIn ? "Sign in to like" : liked ? "Unlike" : "Like"}
            aria-label={!signedIn ? "Sign in to like" : liked ? "Unlike" : "Like"}
            className={`grid size-6 shrink-0 place-items-center transition-colors disabled:opacity-40 ${
              liked ? "text-rose-500" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <HeartIcon filled={liked} />
          </button>
          {!engagementLoading && likeCount > 0 ? (
            <span className="select-none text-sm font-medium leading-none text-stone-500 tabular-nums -translate-y-px">
              {likeCount}
            </span>
          ) : null}
        </div>

        <div className="flex h-6 items-center gap-1.5">
          <button
            type="button"
            disabled={!isLoaded || !signedIn}
            onClick={toggleComments}
            title={!signedIn ? "Sign in to comment" : "Comments"}
            aria-label={!signedIn ? "Sign in to comment" : "Comments"}
            className={`grid size-6 shrink-0 place-items-center transition-colors disabled:opacity-40 ${
              commentsOpen ? "text-stone-800" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <ChatIcon />
          </button>
          {!engagementLoading && commentCount > 0 ? (
            <span className="select-none text-sm font-medium leading-none text-stone-500 tabular-nums -translate-y-px">
              {commentCount}
            </span>
          ) : null}
        </div>

        <span className="min-w-2 flex-1" aria-hidden />

        <button
          type="button"
          disabled={!isLoaded || !signedIn}
          onClick={toggleSave}
          title={!signedIn ? "Sign in to save" : saved ? "Unsave" : "Save"}
          aria-label={!signedIn ? "Sign in to save" : saved ? "Unsave" : "Save"}
          className={`grid size-6 shrink-0 place-items-center transition-colors disabled:opacity-40 ${
            saved ? "text-stone-800" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>

      {displayBody.trim() ? (
        <p className="mt-1.5 text-sm leading-relaxed text-stone-500 line-clamp-3 break-words">
          {profileHref ? (
            <Link
              href={profileHref}
              className="font-medium text-stone-700 hover:text-stone-900"
              aria-label={`View ${resolvedUsername}'s profile`}
            >
              {resolvedUsername}
            </Link>
          ) : (
            <span className="font-medium text-stone-700">{resolvedUsername}</span>
          )}
          {` ${displayBody.trim()}`}
        </p>
      ) : null}

      {displayLocation.trim() && (
        <p className="text-sm text-stone-400 mt-1 flex items-center gap-1">
          <PinIcon />
          <span className="truncate">{displayLocation.trim()}</span>
        </p>
      )}

      {commentsOpen && (
          <div className="mt-3 pt-3 border-t border-stone-200/80 space-y-3">
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-stone-400">No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="flex gap-2 text-sm">
                    <Link href={`/profile/${encodeURIComponent(c.authorClerkId)}`} className="shrink-0">
                      <img
                        src={c.avatarUrl || "https://i.pravatar.cc/150?u=placeholder"}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="text-stone-700">
                        <Link
                          href={`/profile/${encodeURIComponent(c.authorClerkId)}`}
                          className="font-medium hover:underline"
                        >
                          {c.fullName}
                        </Link>
                        <span className="text-stone-300 text-sm ml-1">{formatCommentTime(c.createdAt)}</span>
                      </p>
                      <p className="text-stone-500 leading-snug break-words">{c.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {signedIn ? (
              <div className="flex gap-2 items-end">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  rows={2}
                  className="flex-1 min-w-0 bg-white border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 placeholder:text-stone-300 outline-none focus:border-stone-400 resize-none"
                />
                <Button
                  variant="primary"
                  size="sm"
                  isDisabled={commentSubmitting || !commentText.trim()}
                  isPending={commentSubmitting}
                  onPress={submitComment}
                  className="shrink-0"
                >
                  Post
                </Button>
              </div>
            ) : (
              <p className="text-sm text-stone-400">Sign in to comment.</p>
            )}
          </div>
        )}

      {!commentsOpen && commentCount > 0 && (
        <button
          type="button"
          onClick={toggleComments}
          className="text-sm text-stone-300 mt-1 hover:text-stone-500 transition-colors"
        >
          View {commentCount === 1 ? "1 comment" : `all ${commentCount} comments`}
        </button>
      )}
    </article>
  );
}

export default memo(ArchivePost);
