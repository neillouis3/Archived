"use client";

import { Suspense, useState, useEffect, useCallback, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import ArchiveLeftSidebar from "@/components/leftSideBar";
import { SidebarProvider } from "@/components/sidebarContext";
import { SidebarInsetSpacer } from "@/components/sidebarInsetSpacer";
import type { UserSearchHit } from "@/components/UserSearch";
import { subscribeArchiveFeedRefresh } from "@/lib/feedRefresh";
import { PostGridCard, postGridClassName } from "@/components/postGridCard";
import { ExploreSearchBar } from "@/components/exploreSearchBar";
import {
  type FeedPost,
  feedPostMediaEntryUrl,
  type PostsListResponse,
} from "@/types/feedPost";

function ExplorePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").trim();
  const { isSignedIn, isLoaded } = useUser();

  const [input, setInput] = useState(q);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [peopleResults, setPeopleResults] = useState<UserSearchHit[]>([]);
  const [peopleLoading, setPeopleLoading] = useState(false);

  useEffect(() => {
    setInput(searchParams.get("q") || "");
  }, [searchParams]);

  const refetchExplorePosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const qs = new URLSearchParams({ skipTotal: "1" });
      if (q) qs.set("search", q);
      const res = await fetch(`/api/posts?${qs.toString()}`, {
        credentials: "include",
      });
      const data = (await res.json()) as PostsListResponse;
      setPosts(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      console.error(err);
    } finally {
      setPostsLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void refetchExplorePosts();
  }, [refetchExplorePosts]);

  useEffect(() => {
    return subscribeArchiveFeedRefresh(() => {
      void refetchExplorePosts();
    });
  }, [refetchExplorePosts]);

  const searchPeople = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setPeopleResults([]);
      return;
    }
    setPeopleLoading(true);
    try {
      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(term.trim())}&limit=20`,
        { credentials: "include" }
      );
      if (!res.ok) {
        setPeopleResults([]);
        return;
      }
      const data = await res.json();
      setPeopleResults(Array.isArray(data.users) ? data.users : []);
    } catch {
      setPeopleResults([]);
    } finally {
      setPeopleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn || q.length < 2) {
      setPeopleResults([]);
      return;
    }
    const t = window.setTimeout(() => searchPeople(q), 300);
    return () => window.clearTimeout(t);
  }, [q, isSignedIn, searchPeople]);

  function applySearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    router.push(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : "/explore");
  }

  function clearSearch() {
    setInput("");
    router.push("/explore");
  }

  const allImages = posts.flatMap((post) =>
    (post.media || []).flatMap((m, idx) => {
      const url = feedPostMediaEntryUrl(m);
      if (!url) return [];
      return [
        {
          url,
          postId: post._id,
          title: post.title,
          username: post.username,
          authorClerkId: post.authorClerkId,
          imageIndex: idx,
        },
      ];
    })
  );

  const resultLabel =
    allImages.length === 1 ? "1 image" : `${allImages.length} images`;

  const showPeopleBlock = isLoaded && isSignedIn && q.length >= 2;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#F7F6F2]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-full flex flex-row max-w-[1600px] mx-auto">
          <ArchiveLeftSidebar />
          <SidebarInsetSpacer />

          <div className="flex-1 min-w-0 flex flex-col border-x-0 sm:border-x sm:border-stone-200/80">
            <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
              <header className="mb-6 sm:mb-8 rounded-2xl border border-stone-200/80 bg-[#FDFCF9] px-4 py-6 sm:px-8 sm:py-9 shadow-[0_8px_30px_rgba(28,25,23,0.04)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-stone-300 mb-2">Browse</p>
                    <h1
                      className="text-2xl sm:text-4xl font-light text-stone-800 tracking-tight"
                      style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                      Explore
                    </h1>
                  </div>
                  {!postsLoading && q && allImages.length > 0 ? (
                    <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mt-2 sm:mt-0 sm:pt-8">
                      {resultLabel}
                    </p>
                  ) : null}
                </div>

                <p className="mt-3 text-sm text-stone-400 max-w-2xl leading-relaxed">
                  Search public posts by title, caption, username, or tag. When you&apos;re signed in, we also
                  match people by name (same query).
                </p>

                <div className="mt-6">
                  <ExploreSearchBar
                    variant="full"
                    inputId="explore-search"
                    value={input}
                    onChange={setInput}
                    onSubmit={applySearch}
                    showReset={!!q}
                    onReset={clearSearch}
                  />
                </div>
              </header>

              {showPeopleBlock && (
                <section className="mb-10" aria-label="People results">
                  <h2 className="text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-3">People</h2>
                  {peopleLoading ? (
                    <p className="text-xs text-stone-400">Searching people…</p>
                  ) : peopleResults.length === 0 ? (
                    <p className="text-sm text-stone-400">No people matched &ldquo;{q}&rdquo;.</p>
                  ) : (
                    <ul className="flex flex-col gap-1 rounded-2xl border border-stone-200/80 bg-[#FDFCF9] overflow-hidden divide-y divide-stone-100 max-w-xl">
                      {peopleResults.map((u) => (
                        <li key={u.id}>
                          <Link
                            href={`/profile/${encodeURIComponent(u.id)}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50/80 transition-colors"
                          >
                            <Image
                              src={u.imageUrl}
                              alt=""
                              width={44}
                              height={44}
                              className="w-11 h-11 rounded-full object-cover ring-1 ring-stone-200/60"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-stone-800 truncate">{u.fullName}</p>
                              <p className="text-xs text-stone-400 truncate">
                                {u.username ? `@${u.username}` : "Member"}
                              </p>
                            </div>
                            <span className="text-[10px] tracking-[0.15em] uppercase text-stone-400">Profile</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              <section aria-label="Post results">
                <h2 className="text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-3 sr-only">
                  Posts
                </h2>
                {postsLoading ? (
                  <>
                    <div className="mb-10 rounded-2xl border border-stone-200/80 bg-[#FDFCF9] px-6 py-8 sm:px-8 animate-pulse">
                      <div className="h-3 w-16 bg-stone-200/70 rounded mb-3" />
                      <div className="h-9 w-40 bg-stone-200/70 rounded mb-4" />
                      <div className="h-4 w-full max-w-md bg-stone-100 rounded mb-6" />
                      <div className="h-12 w-full bg-stone-100 rounded-xl" />
                    </div>
                    <div className={postGridClassName}>
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="aspect-square bg-stone-100/90 animate-pulse rounded-sm" />
                      ))}
                    </div>
                  </>
                ) : allImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-stone-300 mb-1">
                      {q ? "No posts match" : "No public posts yet"}
                    </p>
                    <p className="text-xs text-stone-400">
                      {q ? "Try different words or check people above." : "Check back soon"}
                    </p>
                  </div>
                ) : (
                  <div className={postGridClassName}>
                    {allImages.map((img) => (
                      <PostGridCard
                        key={`${img.postId}-${img.imageIndex}`}
                        href={`/post/${encodeURIComponent(String(img.postId))}`}
                        src={img.url}
                        alt={img.title || `Post by ${img.username}`}
                        caption={img.username}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ExploreFallback() {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#F7F6F2]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-full flex flex-row max-w-[1600px] mx-auto">
          <ArchiveLeftSidebar />
          <SidebarInsetSpacer />
          <div className="flex-1 min-w-0 w-full max-w-6xl mx-auto border-x-0 px-4 py-6 sm:border-x sm:border-stone-200/80 sm:px-6 sm:py-10">
            <div className="mb-10 rounded-2xl border border-stone-200/80 bg-[#FDFCF9] px-6 py-8 animate-pulse">
              <div className="h-3 w-16 bg-stone-200/70 rounded mb-3" />
              <div className="h-9 w-40 bg-stone-200/70 rounded mb-4" />
              <div className="h-4 w-2/3 max-w-md bg-stone-100 rounded mb-6" />
              <div className="h-12 w-full bg-stone-100 rounded-xl" />
            </div>
            <div className={postGridClassName}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-stone-100/90 animate-pulse rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreFallback />}>
      <ExplorePageInner />
    </Suspense>
  );
}
