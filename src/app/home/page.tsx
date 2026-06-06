"use client"

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, Skeleton, Tabs } from "@heroui/react";
import ArchiveLeftSidebar from "@/components/leftSideBar";
import ArchiveRightSidebar from "@/components/rightSideBar";
import ArchivePost from "@/components/albumPost";
import {
  type FeedPost,
  feedPostMediaEntryUrl,
  feedPostMediaUrls,
  type PostsListResponse,
} from "@/types/feedPost";
import { PostGridCard, postGridClassName } from "@/components/postGridCard";
import { subscribeArchiveFeedRefresh } from "@/lib/feedRefresh";
import { SidebarProvider } from "@/components/sidebarContext";
import { SidebarInsetSpacer } from "@/components/sidebarInsetSpacer";

const PAGE_SIZE = 15;

function PostSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-7 w-7 rounded-full" />
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

function DiscoverEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <p className="text-xs text-stone-300 mb-1">Nothing here yet</p>
      <p className="text-xs text-stone-200">Start archiving your moments.</p>
    </div>
  );
}

function FollowingEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
      <p className="text-xs text-stone-300 mb-2">
        No posts from people you follow
      </p>
      <p className="text-xs text-stone-400 leading-relaxed mb-8">
        Follow accounts to see their public posts here. Friends-only posts appear when you are
        accepted friends.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:justify-center">
        <Button
          variant="primary"
          size="sm"
          onPress={() => router.push("/explore")}
        >
          Explore posts
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={() => router.push("/accounts/profile")}
        >
          Your profile
        </Button>
      </div>
    </div>
  );
}

export default function Home() {
  const { isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [feedType, setFeedType] = useState<"following" | "discover">("discover");
  const [viewMode, setViewMode] = useState<"feed" | "grid">("feed");

  const fetchPostsPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (!isLoaded) return;
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const qs = new URLSearchParams();
        qs.set("skipTotal", "1");
        qs.set("limit", String(PAGE_SIZE));
        qs.set("page", String(nextPage));
        if (feedType === "following") qs.set("following", "true");
        const res = await fetch(`/api/posts?${qs.toString()}`, {
          credentials: "include",
        });
        if (feedType === "following" && res.status === 401) {
          setPosts([]);
          setHasMore(false);
          setPage(1);
          return;
        }
        if (!res.ok) {
          if (!append) setPosts([]);
          setHasMore(false);
          return;
        }
        const data = (await res.json()) as PostsListResponse;
        const rows = Array.isArray(data.results) ? data.results : [];
        if (append) {
          setPosts((prev) => [...prev, ...rows]);
          setPage(nextPage);
        } else {
          setPosts(rows);
          setPage(1);
        }
        setHasMore(rows.length === PAGE_SIZE);
      } catch (err) {
        console.error(err);
        if (!append) setPosts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isLoaded, feedType]
  );

  useEffect(() => {
    void fetchPostsPage(1, false);
  }, [fetchPostsPage]);

  useEffect(() => {
    return subscribeArchiveFeedRefresh(() => {
      void fetchPostsPage(1, false);
    });
  }, [fetchPostsPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    void fetchPostsPage(page + 1, true);
  }, [hasMore, loadingMore, loading, page, fetchPostsPage]);

  const removePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => String(p._id) !== id));
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="w-full flex flex-row max-w-[1600px] mx-auto">

          {/* Left Sidebar */}
          <ArchiveLeftSidebar />
          <SidebarInsetSpacer />

          {/* Feed */}
          <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
            <div className={`w-full ${viewMode === "grid" ? "max-w-6xl" : "max-w-[520px]"} px-4 py-6 sm:px-6 sm:py-10`}>

             

              {/* Feed tabs */}
              <div className="mb-6 sm:mb-8 flex flex-wrap items-center gap-4 sm:gap-6">
                <Tabs
                  selectedKey={feedType}
                  onSelectionChange={(key) =>
                    setFeedType(String(key) as "following" | "discover")
                  }
                  variant="secondary"
                  className="min-w-0"
                >
                  <Tabs.ListContainer>
                    <Tabs.List aria-label="Feed" className="text-xs">
                      <Tabs.Tab id="discover" className="text-xs">
                        Discover
                      </Tabs.Tab>
                      <Tabs.Separator />
                      <Tabs.Tab id="following" className="text-xs">
                        Following
                      </Tabs.Tab>
                      <Tabs.Indicator />
                    </Tabs.List>
                  </Tabs.ListContainer>
                </Tabs>
                <button 
                  onClick={() => setViewMode(viewMode === "feed" ? "grid" : "feed")}
                  className="text-xs text-stone-300 hover:text-stone-500 transition-colors pb-0.5 ml-auto flex items-center gap-1.5"
                >
                  {viewMode === "feed" ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
                      </svg>
                      Grid
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                      </svg>
                      Feed
                    </>
                  )}
                </button>
              </div>

              {/* Content - Feed or Grid View */}
              {viewMode === "feed" ? (
                <div className="flex flex-col gap-12">
                  {loading ? (
                    <>
                      <PostSkeleton />
                      <PostSkeleton />
                    </>
                  ) : posts.length === 0 ? (
                    feedType === "following" ? (
                      <FollowingEmptyState />
                    ) : (
                      <DiscoverEmptyState />
                    )
                  ) : (
                    posts.map((post) => (
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
                        onPostDeleted={removePost}
                        initialEngagement={post.engagement}
                      />
                    ))
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
                  ) : posts.length === 0 ? (
                    feedType === "following" ? (
                      <FollowingEmptyState />
                    ) : (
                      <DiscoverEmptyState />
                    )
                  ) : (
                    <div className={postGridClassName}>
                      {posts.flatMap((post) =>
                        (post.media || []).map((m, idx: number) => (
                          <PostGridCard
                            key={`${post._id}-${idx}`}
                            href={`/post/${encodeURIComponent(String(post._id))}`}
                            src={feedPostMediaEntryUrl(m)}
                            alt={
                              (post.body && String(post.body).trim().slice(0, 60)) ||
                              `Post by ${post.username || "author"}`
                            }
                            caption={post.username ? String(post.username) : undefined}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {!loading && posts.length > 0 && (
                <div className="flex flex-col items-center gap-4 mt-12 pb-8">
                  {hasMore ? (
                    <Button
                      variant="ghost"
                      className="text-xs text-stone-500 hover:text-stone-800 border border-stone-200 rounded-xl px-6 py-2"
                      isPending={loadingMore}
                      isDisabled={loadingMore}
                      onPress={loadMore}
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </Button>
                  ) : (
                    <p className="text-xs text-stone-300">
                      End of feed
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden xl:block xl:w-64 2xl:w-72 flex-shrink-0">
            <ArchiveRightSidebar />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
