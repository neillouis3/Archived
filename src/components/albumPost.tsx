"use client";

import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Link from "next/link";
import { memo, useEffect, useRef, useState } from "react";
import { Button, Tooltip, useOverlayState } from "@heroui/react";
import type { EditPostVisibility } from "@/components/editPostModal";

const EditPostModal = dynamic(() => import("@/components/editPostModal"), {
  ssr: false,
});

const HeartIcon = ({ filled }: { filled?: boolean }) =>
  filled ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled?: boolean }) =>
  filled ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  );

const DotsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
);

const PinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 shrink-0 text-stone-300">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

function parseVisibility(v: unknown): EditPostVisibility {
  return v === "friends" || v === "private" ? v : "public";
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Feb 16";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCommentTime(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 60000;
  if (diff < 1) return "now";
  if (diff < 60) return `${Math.floor(diff)}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
}: ArchivePostProps) {
  const { user, isLoaded } = useUser();
  const editModalState = useOverlayState({ defaultOpen: false });
  const [displayBody, setDisplayBody] = useState(description);
  const [displayLocation, setDisplayLocation] = useState(locationProp ?? "");
  const [displayVisibility, setDisplayVisibility] = useState(() =>
    parseVisibility(visibilityProp)
  );
  const [activeImg, setActiveImg] = useState(0);
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
  const [actionLoading, setActionLoading] = useState(false);
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
  const resolvedUsername = username || "username";
  const profileHref = authorClerkId
    ? `/profile/${encodeURIComponent(authorClerkId)}`
    : null;

  const media = mediaUrl.filter(Boolean);

  const signedIn = Boolean(user);

  async function toggleLike() {
    if (!signedIn || !postId || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setLiked(Boolean(data.liked));
      if (typeof data.likeCount === "number") setLikeCount(data.likeCount);
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleSave() {
    if (!signedIn || !postId || actionLoading) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/save`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setSaved(Boolean(data.saved));
    } finally {
      setActionLoading(false);
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

  return (
    <article className="flex flex-col">
      <div className="mb-3 flex w-full items-center gap-2.5">
        {profileHref ? (
          <Link
            href={profileHref}
            className="group/author -m-1 flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-stone-100/80"
            aria-label={`View ${resolvedUsername}'s profile`}
          >
            <img
              src={resolvedImage}
              alt=""
              className="h-7 w-7 flex-shrink-0 rounded-full object-cover ring-1 ring-transparent transition-[box-shadow] group-hover/author:ring-stone-300"
            />
            <span className="truncate text-xs font-medium text-stone-700 underline-offset-2 decoration-stone-300 group-hover/author:text-stone-900 group-hover/author:underline">
              {resolvedUsername}
            </span>
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <img
              src={resolvedImage}
              alt={resolvedUsername}
              className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
            />
            <span className="truncate text-xs font-medium text-stone-700">{resolvedUsername}</span>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-0.5">
          <span className="text-xs text-stone-300">{formatDate(createdAt)}</span>
          {isOwner ? (
            <EditPostModal
              state={editModalState}
              trigger={
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 min-w-0 rounded-md text-stone-300 hover:text-stone-500"
                  aria-label="Edit post"
                >
                  <DotsIcon />
                </Button>
              }
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

      <div className="relative w-full bg-white border border-stone-200/80 overflow-hidden">
        <div className="relative aspect-square w-full">
          {media.length > 0 ? (
            <>
              <img
                src={media[Math.min(activeImg, media.length - 1)]}
                alt={
                  displayBody.trim()
                    ? displayBody.trim().slice(0, 80)
                    : `Post by ${resolvedUsername}`
                }
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.97) contrast(1.02) saturate(0.92)" }}
              />
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </>
          ) : (
            <div className="flex h-full w-full min-h-[12rem] items-center justify-center bg-white border border-stone-200/80 px-4 text-center text-xs text-stone-400">
              No photo for this post
            </div>
          )}
        </div>

        {media.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {media.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImg(i)}
                className={`w-1 h-1 rounded-full transition-all ${i === activeImg ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-2 w-full">
        <div className="flex items-center gap-1">
          <Tooltip>
            <Tooltip.Trigger>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                isDisabled={!isLoaded || !signedIn || actionLoading}
                onPress={toggleLike}
                className={`w-7 h-7 min-w-0 rounded-md transition-colors ${liked ? "text-rose-400" : "text-stone-400 hover:text-stone-600"}`}
              >
                <HeartIcon filled={liked} />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content placement="top">
              <p className="text-xs">
                {!signedIn ? "Sign in to like" : liked ? "Unlike" : "Like"}
              </p>
            </Tooltip.Content>
          </Tooltip>
          {!engagementLoading && likeCount > 0 && (
            <span className="text-xs font-medium text-stone-500 tabular-nums">{likeCount}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <Tooltip.Trigger>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                isDisabled={!isLoaded || !signedIn}
                onPress={toggleComments}
                className={`text-stone-400 hover:text-stone-600 w-7 h-7 min-w-0 rounded-md ${commentsOpen ? "text-stone-700" : ""}`}
              >
                <ChatIcon />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content placement="top">
              <p className="text-xs">{!signedIn ? "Sign in to comment" : "Comments"}</p>
            </Tooltip.Content>
          </Tooltip>
          {!engagementLoading && commentCount > 0 && (
            <span className="text-xs font-medium text-stone-500 tabular-nums">{commentCount}</span>
          )}
        </div>

        <span className="min-w-2 flex-1" aria-hidden />

        <Tooltip>
          <Tooltip.Trigger>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              isDisabled={!isLoaded || !signedIn || actionLoading}
              onPress={toggleSave}
              className={`w-7 h-7 min-w-0 rounded-md transition-colors ${saved ? "text-stone-700" : "text-stone-400 hover:text-stone-600"}`}
            >
              <BookmarkIcon filled={saved} />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content placement="top">
            <p className="text-xs">{!signedIn ? "Sign in to save" : saved ? "Unsave" : "Save"}</p>
          </Tooltip.Content>
        </Tooltip>
      </div>

      <div className="mt-1.5">
        <p className="text-xs text-stone-700 leading-relaxed">
          {profileHref ? (
            <Link
              href={profileHref}
              className="font-medium text-stone-700 hover:text-stone-900 hover:underline underline-offset-2 decoration-stone-300"
              aria-label={`View ${resolvedUsername}'s profile`}
            >
              {resolvedUsername}
            </Link>
          ) : (
            <span className="font-medium">{resolvedUsername}</span>
          )}
          {displayBody.trim() ? (
            <>
              {" "}
              <span className="font-normal text-stone-500 line-clamp-3">{displayBody.trim()}</span>
            </>
          ) : null}
        </p>
        {displayLocation.trim() && (
          <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
            <PinIcon />
            <span className="truncate">{displayLocation.trim()}</span>
          </p>
        )}

        {commentsOpen && (
          <div className="mt-3 pt-3 border-t border-stone-200/80 space-y-3">
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-xs text-stone-400">No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="flex gap-2 text-xs">
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
                        <span className="text-stone-300 text-xs ml-1">{formatCommentTime(c.createdAt)}</span>
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
                  className="flex-1 min-w-0 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 placeholder:text-stone-300 outline-none focus:border-stone-400 resize-none"
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
              <p className="text-xs text-stone-400">Sign in to comment.</p>
            )}
          </div>
        )}

        {!commentsOpen && commentCount > 0 && (
          <button
            type="button"
            onClick={toggleComments}
            className="text-xs text-stone-300 mt-1 hover:text-stone-500 transition-colors"
          >
            View {commentCount === 1 ? "1 comment" : `all ${commentCount} comments`}
          </button>
        )}
      </div>
    </article>
  );
}

export default memo(ArchivePost);
