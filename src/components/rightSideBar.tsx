"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@heroui/react";
import FollowButton from "./FollowButton";
import { ExploreSearchBar } from "@/components/exploreSearchBar";
import type { UserSearchHit } from "@/components/UserSearch";
import { subscribeArchiveFeedRefresh } from "@/lib/feedRefresh";
import {
  getSidebarCache,
  setSidebarCache,
  type SidebarSuggestion,
  type SidebarTagRow,
  type SidebarTile,
} from "@/lib/rightSidebarCache";

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3">
      <h2 className="text-[10px] tracking-[0.25em] uppercase text-stone-500 font-medium">
        {children}
      </h2>
      {action}
    </div>
  );
}

type SidebarPostThumb = { url: string; postId: string };

export default function ArchiveRightSidebar() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [tiles, setTiles] = useState<SidebarTile[]>([]);
  const [tags, setTags] = useState<SidebarTagRow[]>([]);
  const [suggestions, setSuggestions] = useState<SidebarSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [sidebarPosts, setSidebarPosts] = useState<SidebarPostThumb[]>([]);
  const [sidebarPeople, setSidebarPeople] = useState<UserSearchHit[]>([]);
  const [sidebarSearchLoading, setSidebarSearchLoading] = useState(false);

  const load = useCallback(async (opts?: { force?: boolean }) => {
    const userKey = user?.id ?? "signed-out";

    if (!opts?.force) {
      const cached = getSidebarCache(userKey);
      if (cached) {
        setTiles(cached.tiles);
        setTags(cached.tags);
        setSuggestions(cached.suggestions);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sidebar", { credentials: "include" });
      if (!res.ok) {
        setTiles([]);
        setTags([]);
        setSuggestions([]);
        return;
      }
      const data = await res.json();
      const nextTiles = Array.isArray(data.tiles) ? data.tiles : [];
      const nextTags = Array.isArray(data.tags) ? data.tags : [];
      const nextSuggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
      setTiles(nextTiles);
      setTags(nextTags);
      setSuggestions(nextSuggestions);
      setSidebarCache(userKey, {
        tiles: nextTiles,
        tags: nextTags,
        suggestions: nextSuggestions,
      });
    } catch {
      setTiles([]);
      setTags([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isLoaded) return;
    void load();
  }, [isLoaded, load]);

  useEffect(() => {
    return subscribeArchiveFeedRefresh(() => {
      void load({ force: true });
    });
  }, [load]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(searchInput.trim()), 300);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!debouncedQ) {
      setSidebarPosts([]);
      setSidebarPeople([]);
      setSidebarSearchLoading(false);
      return;
    }

    let cancelled = false;
    setSidebarSearchLoading(true);

    (async () => {
      const qs = new URLSearchParams({ skipTotal: "1", search: debouncedQ });
      const postsP = fetch(`/api/posts?${qs.toString()}`, {
        credentials: "include",
      }).then((r) => (r.ok ? r.json() : { results: [] }));

      const peopleP =
        isLoaded && isSignedIn && debouncedQ.length >= 2
          ? fetch(
              `/api/users/search?q=${encodeURIComponent(debouncedQ)}&limit=6`,
              { credentials: "include" }
            ).then((r) => (r.ok ? r.json() : { users: [] }))
          : Promise.resolve({ users: [] });

      try {
        const [postData, peopleData] = await Promise.all([postsP, peopleP]);
        if (cancelled) return;

        const results = Array.isArray(postData.results) ? postData.results : [];
        const thumbs: SidebarPostThumb[] = [];
        for (const post of results) {
          const media = post.media || [];
          for (const m of media) {
            const url = typeof m === "string" ? m : m?.url;
            if (url) {
              thumbs.push({ url, postId: String(post._id) });
              if (thumbs.length >= 9) break;
            }
          }
          if (thumbs.length >= 9) break;
        }
        setSidebarPosts(thumbs);
        setSidebarPeople(
          Array.isArray(peopleData.users) ? peopleData.users.slice(0, 6) : []
        );
      } catch {
        if (!cancelled) {
          setSidebarPosts([]);
          setSidebarPeople([]);
        }
      } finally {
        if (!cancelled) setSidebarSearchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQ, isLoaded, isSignedIn]);

  const applySidebarSearch = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const t = searchInput.trim();
      router.push(t ? `/explore?q=${encodeURIComponent(t)}` : "/explore");
    },
    [router, searchInput]
  );

  const clearSidebarSearch = useCallback(() => {
    setSearchInput("");
    setDebouncedQ("");
    setSidebarPosts([]);
    setSidebarPeople([]);
    setSidebarSearchLoading(false);
  }, []);

  const placeholderTiles = loading && tiles.length === 0 ? 9 : 0;
  const exploreHref = debouncedQ
    ? `/explore?q=${encodeURIComponent(debouncedQ)}`
    : "/explore";

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 xl:w-72 flex flex-col bg-[#F7F6F2] overflow-y-auto border-l border-stone-200/80">
      <div className="px-5 pt-8 pb-5 border-b border-stone-200/70">
        <h2 className="text-[10px] tracking-[0.25em] uppercase text-stone-500 font-medium mb-3">
          Search
        </h2>
        <ExploreSearchBar
          variant="sidebar"
          inputId="sidebar-explore-search"
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={applySidebarSearch}
          showReset={!!searchInput.trim()}
          onReset={clearSidebarSearch}
        />
        {debouncedQ ? (
          <div className="mt-4 space-y-4">
            {isLoaded && isSignedIn && debouncedQ.length >= 2 ? (
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">
                  People
                </p>
                {sidebarSearchLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-2 animate-pulse">
                        <div className="w-7 h-7 rounded-full bg-stone-200/80" />
                        <div className="flex-1 h-3 bg-stone-100 rounded" />
                      </div>
                    ))}
                  </div>
                ) : sidebarPeople.length === 0 ? (
                  <p className="text-[10px] text-stone-400 leading-snug">
                    No people matched.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-0.5 rounded-lg border border-stone-200/60 bg-[#FDFCF9]/80 overflow-hidden divide-y divide-stone-100/80">
                    {sidebarPeople.map((u) => (
                      <li key={u.id}>
                        <Link
                          href={`/profile/${encodeURIComponent(u.id)}`}
                          className="flex items-center gap-2 px-2 py-2 hover:bg-stone-50/90 transition-colors"
                        >
                          <img
                            src={u.imageUrl}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-200/50 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-stone-800 truncate">
                              {u.fullName}
                            </p>
                            <p className="text-[9px] text-stone-400 truncate">
                              {u.username ? `@${u.username}` : "Member"}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}

            <div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-stone-400 mb-2">
                Posts
              </p>
              {sidebarSearchLoading ? (
                <div className="grid grid-cols-3 gap-0.5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square bg-stone-100/90 animate-pulse rounded-sm" />
                  ))}
                </div>
              ) : sidebarPosts.length === 0 ? (
                <p className="text-[10px] text-stone-400 leading-snug">No posts matched.</p>
              ) : (
                <div className="grid grid-cols-3 gap-0.5">
                  {sidebarPosts.map((t, i) => (
                    <Link
                      key={`${t.postId}-${i}`}
                      href={`/post/${encodeURIComponent(t.postId)}`}
                      className="aspect-square overflow-hidden bg-stone-100 rounded-sm group focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                    >
                      <img
                        src={t.url}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        style={{ filter: "brightness(0.96) saturate(0.85)" }}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href={exploreHref}
              className="inline-block text-[10px] tracking-[0.15em] uppercase text-stone-500 hover:text-stone-700 transition-colors"
            >
              Open full explore →
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-[10px] text-stone-400 leading-relaxed">
            Same search as Explore: posts, tags, usernames{isSignedIn ? ", and people" : ""}.
            {!isSignedIn ? " Sign in to match people by name." : ""}
          </p>
        )}
      </div>

      <div className="px-5 py-6 border-b border-stone-200/70">
        <SectionTitle
          action={
            <Link
              href="/explore"
              className="text-[10px] tracking-wide text-stone-400 hover:text-stone-600 transition-colors shrink-0"
            >
              See all
            </Link>
          }
        >
          From the feed
        </SectionTitle>
        <div className="grid grid-cols-3 gap-0.5">
          {placeholderTiles > 0
            ? [...Array(placeholderTiles)].map((_, i) => (
                <div key={i} className="aspect-square bg-stone-100/90 animate-pulse rounded-sm" />
              ))
            : tiles.length === 0
              ? (
                  <div className="col-span-3 py-6 text-center border border-dashed border-stone-200 rounded-lg bg-[#FDFCF9]/40">
                    <p className="text-[10px] text-stone-400">No public posts yet</p>
                    <Link href="/explore" className="text-[10px] text-stone-500 underline mt-1 inline-block">
                      Open explore
                    </Link>
                  </div>
                )
              : tiles.map((t, i) => (
                  <Link
                    key={`${t.postId}-${i}`}
                    href={`/post/${encodeURIComponent(t.postId)}`}
                    className="aspect-square overflow-hidden bg-stone-100 group focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-sm"
                    title="Open post"
                  >
                    <img
                      src={t.url}
                      alt=""
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-90"
                      style={{ filter: "brightness(0.96) saturate(0.85)" }}
                    />
                  </Link>
                ))}
        </div>
      </div>

      <div className="px-5 py-6 border-b border-stone-200/70">
        <SectionTitle>People to follow</SectionTitle>
        {!isLoaded || loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2.5 animate-pulse">
                <div className="w-7 h-7 rounded-full bg-stone-200/80" />
                <div className="flex-1 h-3 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-[10px] text-stone-400 leading-relaxed">
            {user
              ? "You follow everyone we found here, or there aren’t enough authors yet."
              : "Sign in to follow people from your community."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {suggestions.map((s) => (
              <div key={s.authorClerkId} className="flex items-center gap-2.5">
                <Link href={`/profile/${encodeURIComponent(s.authorClerkId)}`} className="shrink-0">
                  <img
                    src={s.avatarUrl || "https://i.pravatar.cc/150?u=placeholder"}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-200/50"
                  />
                </Link>
                <div className="flex flex-col min-w-0 flex-1">
                  <Link
                    href={`/profile/${encodeURIComponent(s.authorClerkId)}`}
                    className="text-xs text-stone-700 font-medium truncate hover:text-stone-900"
                  >
                    {s.fullName}
                  </Link>
                  <span className="text-[10px] text-stone-400 truncate">
                    {s.username || "Member"}
                  </span>
                </div>
                {user && user.id !== s.authorClerkId ? (
                  <FollowButton
                    targetUserId={s.authorClerkId}
                    onChange={() => void load({ force: true })}
                    className="text-[9px] tracking-[0.12em] uppercase px-2 py-1 rounded-md border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50 shrink-0"
                  />
                ) : (
                  <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    aria-label="Sign in to follow"
                    className="text-stone-300 w-6 h-6 min-w-0 rounded-md"
                    isDisabled
                  >
                    <PlusIcon />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-6 flex-1">
        <SectionTitle>Trending tags</SectionTitle>
        {loading && tags.length === 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-14 bg-stone-100 rounded-full animate-pulse" />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <p className="text-[10px] text-stone-400">Add tags to posts to see trends here.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/explore?q=${encodeURIComponent(tag)}`}
                className="inline-flex items-center rounded-full border border-stone-200 bg-transparent px-2.5 py-1 text-[10px] text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-colors tracking-wide"
              >
                #{tag}
                <span className="text-stone-300 ml-1 tabular-nums">{count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-5 mt-auto border-t border-stone-200/70 bg-[#F7F6F2]/95">
        <p className="text-[9px] text-stone-300 tracking-wide leading-relaxed">
          About · Privacy · Terms · Accessibility
        </p>
        <p className="text-[9px] text-stone-200 mt-1 tracking-wide">Archive © 2026</p>
      </div>
    </aside>
  );
}
