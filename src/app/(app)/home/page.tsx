"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { Button, Skeleton } from "@heroui/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import ArchivePost from "@/components/albumPost";
import {
  type FeedPost,
  feedPostMediaUrls,
  type PostsListResponse,
} from "@/types/feedPost";
import { PostGridCard, postGridClassName } from "@/components/postGridCard";
import { subscribeArchiveFeedRefresh } from "@/lib/feedRefresh";

const PAGE_SIZE = 15;
const FOLLOWING_WINDOW_DAYS = 7;

type FeedPhase = "following" | "suggested";

function PostSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-3 w-16 rounded ml-auto" />
      </div>
      <Skeleton className="w-full aspect-square rounded-none" />
      <div className="mt-3 flex flex-col gap-2">
        <Skeleton className="h-3 w-2/3 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

function CaughtUpDivider() {
  return (
    <div className="flex flex-col items-center text-center py-10 gap-2">
      <HugeiconsIcon
        icon={CheckmarkCircle02Icon}
        size={56}
        strokeWidth={1.25}
        className="mb-2 text-stone-800"
      />
      <p className="text-[22px] font-normal leading-tight text-stone-900">
        You&apos;re all caught up
      </p>
      <p className="text-sm font-normal text-stone-900">
        You&apos;ve seen all new posts from the past {FOLLOWING_WINDOW_DAYS} days.
      </p>
    </div>
  );
}

function renderPost(
  post: FeedPost,
  opts: { showFollow?: boolean; onDeleted: (id: string) => void }
) {
  return (
    <ArchivePost
      key={post._id}
      postId={String(post._id)}
      authorClerkId={post.authorClerkId}
      fullName={post.fullName}
      description={post.body ?? ""}
      mediaUrl={feedPostMediaUrls(post.media)}
      username={post.username}
      imageUrl={post.avatarUrl}
      createdAt={post.createdAt}
      visibility={post.visibility}
      location={post.location}
      onPostDeleted={opts.onDeleted}
      initialEngagement={post.engagement}
      showFollow={opts.showFollow}
      aspectRatio={post.aspectRatio}
    />
  );
}

async function fetchPosts(qs: URLSearchParams): Promise<FeedPost[]> {
  const res = await fetch(`/api/posts?${qs.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as PostsListResponse;
  return Array.isArray(data.results) ? data.results : [];
}

export default function Home() {
  const { isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followingPosts, setFollowingPosts] = useState<FeedPost[]>([]);
  const [suggestedPosts, setSuggestedPosts] = useState<FeedPost[]>([]);
  const [phase, setPhase] = useState<FeedPhase>("following");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [viewMode, setViewMode] = useState<"feed" | "grid">("feed");

  const loadSuggested = useCallback(async (nextPage: number, excludeIds: Set<string>) => {
    const qs = new URLSearchParams({
      skipTotal: "1",
      limit: String(PAGE_SIZE),
      page: String(nextPage),
      suggested: "true",
    });
    let rows = await fetchPosts(qs);

    // If nothing from non-followed accounts, fall back to the public discover feed.
    if (rows.length === 0 && nextPage === 1) {
      const fallback = new URLSearchParams({
        skipTotal: "1",
        limit: String(PAGE_SIZE),
        page: "1",
      });
      rows = await fetchPosts(fallback);
    }

    return rows.filter((p) => !excludeIds.has(String(p._id)));
  }, []);

  const reloadFeed = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    setFollowingPosts([]);
    setSuggestedPosts([]);
    setPhase("following");
    setPage(1);
    setHasMore(false);

    try {
      const followingQs = new URLSearchParams({
        skipTotal: "1",
        limit: String(PAGE_SIZE),
        page: "1",
        following: "true",
        sinceDays: String(FOLLOWING_WINDOW_DAYS),
      });
      const followingRows = await fetchPosts(followingQs);
      setFollowingPosts(followingRows);

      if (followingRows.length === PAGE_SIZE) {
        setPhase("following");
        setPage(1);
        setHasMore(true);
        return;
      }

      // Past-week following done (or empty) → always load suggested next.
      setPhase("suggested");
      setPage(1);
      const exclude = new Set(followingRows.map((p) => String(p._id)));
      const suggestedRows = await loadSuggested(1, exclude);
      setSuggestedPosts(suggestedRows);
      setHasMore(suggestedRows.length >= PAGE_SIZE - 2);
    } catch (err) {
      console.error(err);
      setFollowingPosts([]);
      setSuggestedPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, loadSuggested]);

  useEffect(() => {
    void reloadFeed();
  }, [reloadFeed]);

  useEffect(() => {
    return subscribeArchiveFeedRefresh(() => {
      void reloadFeed();
    });
  }, [reloadFeed]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      if (phase === "following") {
        const qs = new URLSearchParams({
          skipTotal: "1",
          limit: String(PAGE_SIZE),
          page: String(nextPage),
          following: "true",
          sinceDays: String(FOLLOWING_WINDOW_DAYS),
        });
        const rows = await fetchPosts(qs);
        setFollowingPosts((prev) => [...prev, ...rows]);
        setPage(nextPage);
        if (rows.length === PAGE_SIZE) {
          setHasMore(true);
          return;
        }
        setPhase("suggested");
        setPage(1);
        const exclude = new Set(
          [...followingPosts, ...rows].map((p) => String(p._id))
        );
        const suggestedRows = await loadSuggested(1, exclude);
        setSuggestedPosts(suggestedRows);
        setHasMore(suggestedRows.length >= PAGE_SIZE - 2);
        return;
      }

      const exclude = new Set([
        ...followingPosts.map((p) => String(p._id)),
        ...suggestedPosts.map((p) => String(p._id)),
      ]);
      const qs = new URLSearchParams({
        skipTotal: "1",
        limit: String(PAGE_SIZE),
        page: String(nextPage),
        suggested: "true",
      });
      let rows = (await fetchPosts(qs)).filter((p) => !exclude.has(String(p._id)));
      if (rows.length === 0) {
        const fallback = new URLSearchParams({
          skipTotal: "1",
          limit: String(PAGE_SIZE),
          page: String(nextPage),
        });
        rows = (await fetchPosts(fallback)).filter((p) => !exclude.has(String(p._id)));
      }
      setSuggestedPosts((prev) => [...prev, ...rows]);
      setPage(nextPage);
      setHasMore(rows.length > 0);
    } finally {
      setLoadingMore(false);
    }
  }, [
    hasMore,
    loadingMore,
    loading,
    page,
    phase,
    followingPosts,
    suggestedPosts,
    loadSuggested,
  ]);

  const removePost = useCallback((id: string) => {
    setFollowingPosts((prev) => prev.filter((p) => String(p._id) !== id));
    setSuggestedPosts((prev) => prev.filter((p) => String(p._id) !== id));
  }, []);

  const allPosts = [...followingPosts, ...suggestedPosts];
  const isEmpty = !loading && allPosts.length === 0;

  return (
    <div className="flex-1 min-w-0 flex flex-col items-center">
      <div
        className={`w-full ${viewMode === "grid" ? "max-w-6xl" : "max-w-[520px]"} px-4 py-6 sm:px-6 sm:py-10`}
      >
        <div className="mb-6 sm:mb-8 flex justify-end">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "feed" ? "grid" : "feed")}
            className="text-sm text-stone-300 hover:text-stone-500 transition-colors pb-0.5 flex items-center gap-1.5"
          >
            {viewMode === "feed" ? "Grid" : "Feed"}
          </button>
        </div>

        {viewMode === "feed" ? (
          <div className="flex flex-col gap-12">
            {loading ? (
              <>
                <PostSkeleton />
                <PostSkeleton />
              </>
            ) : isEmpty ? (
              <p className="py-20 text-center text-sm text-stone-400">No posts yet.</p>
            ) : (
              <>
                {followingPosts.map((post) =>
                  renderPost(post, { onDeleted: removePost })
                )}

                {suggestedPosts.length > 0 ? (
                  <>
                    <CaughtUpDivider />
                    <h2 className="text-base font-semibold text-stone-900 -mb-4">
                      Suggested Posts
                    </h2>
                    {suggestedPosts.map((post) =>
                      renderPost(post, {
                        showFollow: true,
                        onDeleted: removePost,
                      })
                    )}
                  </>
                ) : null}
              </>
            )}
          </div>
        ) : (
          <div>
            {loading ? (
              <div className={postGridClassName}>
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-stone-100/90 animate-pulse rounded-sm"
                  />
                ))}
              </div>
            ) : isEmpty ? (
              <p className="py-20 text-center text-sm text-stone-400">No posts yet.</p>
            ) : (
              <div className={postGridClassName}>
                {allPosts.map((post) => {
                  const urls = feedPostMediaUrls(post.media);
                  const src = urls[0];
                  if (!src) return null;
                  return (
                    <PostGridCard
                      key={String(post._id)}
                      postId={String(post._id)}
                      src={src}
                      alt={
                        (post.body && String(post.body).trim().slice(0, 60)) ||
                        `Post by ${post.username || "author"}`
                      }
                      hasMultiple={urls.length > 1}
                      likeCount={post.engagement?.likeCount ?? 0}
                      commentCount={post.engagement?.commentCount ?? 0}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!loading && !isEmpty && (
          <div className="flex flex-col items-center gap-4 mt-12 pb-8">
            {hasMore ? (
              <Button
                variant="ghost"
                className="text-xs text-stone-500 hover:text-stone-800 border border-stone-200 rounded-xl px-6 py-2"
                isPending={loadingMore}
                isDisabled={loadingMore}
                onPress={() => void loadMore()}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            ) : (
              <p className="text-xs text-stone-300">End of feed</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
