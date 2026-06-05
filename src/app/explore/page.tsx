"use client";

import { Suspense, useState, useEffect, useCallback, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Tabs } from "@heroui/react";
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

type SearchTab = "posts" | "people";

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
  const [searchTab, setSearchTab] = useState<SearchTab>("posts");

  useEffect(() => {
    setInput(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const trimmed = input.trim();
    const urlQ = (searchParams.get("q") || "").trim();
    if (trimmed === urlQ) return;

    const t = window.setTimeout(() => {
      router.replace(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : "/explore");
    }, 350);

    return () => window.clearTimeout(t);
  }, [input, router, searchParams]);

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
          bodySnippet:
            typeof post.body === "string" && post.body.trim()
              ? post.body.trim().slice(0, 60)
              : "",
          username: post.username,
          authorClerkId: post.authorClerkId,
          imageIndex: idx,
        },
      ];
    })
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="w-full flex flex-row max-w-[1600px] mx-auto">
          <ArchiveLeftSidebar />
          <SidebarInsetSpacer />

          <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
            <div className="w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
              <div className="mb-6 sm:mb-8">
                <Tabs
                  selectedKey={searchTab}
                  onSelectionChange={(key) => setSearchTab(String(key) as SearchTab)}
                  className="w-full"
                >
                  <Tabs.ListContainer className="mb-4 flex justify-start bg-transparent shadow-none">
                    <Tabs.List
                      aria-label="Search type"
                      className="w-fit bg-transparent *:h-6 *:w-fit *:px-3 *:text-sm *:font-normal *:data-[selected=true]:text-accent-foreground"
                    >
                      <Tabs.Tab id="posts">
                        Posts
                        <Tabs.Indicator className="bg-accent" />
                      </Tabs.Tab>
                      <Tabs.Tab id="people">
                        People
                        <Tabs.Indicator className="bg-accent" />
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>
                </Tabs>

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

              {searchTab === "people" ? (
                <section className="mb-6 sm:mb-8" aria-label="People results">
                  {!isLoaded || !isSignedIn ? (
                    <p className="text-xs text-stone-400">Sign in to search people.</p>
                  ) : q.length < 2 ? (
                    <p className="text-xs text-stone-400">Type at least 2 characters to search people.</p>
                  ) : peopleLoading ? (
                    <p className="text-xs text-stone-400">Searching people…</p>
                  ) : peopleResults.length === 0 ? (
                    <p className="text-sm text-stone-400">No people matched &ldquo;{q}&rdquo;.</p>
                  ) : (
                    <ul className="flex flex-col gap-1 rounded-2xl border border-stone-200/80 bg-white overflow-hidden divide-y divide-stone-100 max-w-xl">
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
                            <span className="text-xs text-stone-400">Profile</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ) : (
              <section aria-label="Post results">
                {postsLoading ? (
                  <div className={postGridClassName}>
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="aspect-square bg-stone-100/90 animate-pulse rounded-sm" />
                    ))}
                  </div>
                ) : allImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 text-center">
                    <p className="text-xs text-stone-400">
                      {q ? "No posts match your search." : "No public posts yet."}
                    </p>
                  </div>
                ) : (
                  <div className={postGridClassName}>
                    {allImages.map((img) => (
                      <PostGridCard
                        key={`${img.postId}-${img.imageIndex}`}
                        href={`/post/${encodeURIComponent(String(img.postId))}`}
                        src={img.url}
                        alt={img.bodySnippet || `Post by ${img.username}`}
                        caption={img.username}
                      />
                    ))}
                  </div>
                )}
              </section>
              )}
            </div>
          </div>

          <div className="hidden xl:block xl:w-64 2xl:w-72 flex-shrink-0" aria-hidden />
        </div>
      </div>
    </SidebarProvider>
  );
}

function ExploreFallback() {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="w-full flex flex-row max-w-[1600px] mx-auto">
          <ArchiveLeftSidebar />
          <SidebarInsetSpacer />
          <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
            <div className="w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
              <div className="mb-6 sm:mb-8">
                <div className="h-8 w-32 bg-stone-100 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-stone-100 rounded animate-pulse mb-4" />
                <div className="h-12 w-full bg-stone-100 rounded-xl animate-pulse" />
              </div>
              <div className={postGridClassName}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-square bg-stone-100/90 animate-pulse rounded-sm" />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden xl:block xl:w-64 2xl:w-72 flex-shrink-0" aria-hidden />
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
