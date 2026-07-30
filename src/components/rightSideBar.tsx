"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@heroui/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import FollowButton from "./FollowButton";
import { ExploreSearchBar } from "@/components/exploreSearchBar";
import { usePostViewerOptional } from "@/components/postViewerContext";
import type { UserSearchHit } from "@/components/UserSearch";
import { subscribeArchiveFeedRefresh } from "@/lib/feedRefresh";
import {
  getSidebarCache,
  setSidebarCache,
  type SidebarSuggestion,
  type SidebarTagRow,
  type SidebarTile,
} from "@/lib/rightSidebarCache";

function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex h-5 items-center justify-between gap-2">
      <h2 className="text-[13px] font-medium leading-none text-black">
        {children}
      </h2>
      {action ? (
        <div className="flex h-full shrink-0 items-center">{action}</div>
      ) : null}
    </div>
  );
}

type SidebarPostThumb = { url: string; postId: string };

function FeedThumb({
  postId,
  src,
  title,
}: {
  postId: string;
  src: string;
  title?: string;
}) {
  const { openPost } = usePostViewerOptional();
  return (
    <button
      type="button"
      onClick={() => openPost(postId)}
      title={title}
      className="group relative aspect-square overflow-hidden rounded-md bg-neutral-100 ring-1 ring-neutral-200/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover will-change-transform [transform:translateZ(0)] transition-transform duration-200 ease-out group-hover:scale-105 group-focus-visible:scale-105"
      />
    </button>
  );
}

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
      const qs = new URLSearchParams({ skipTotal: "1", search: debouncedQ, skipEngagement: "1" });
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
  const showSidebarPeopleSearch =
    isLoaded && isSignedIn && debouncedQ.length >= 2;
  const sidebarSearchComplete = !sidebarSearchLoading;
  const hasSidebarPeople =
    showSidebarPeopleSearch && sidebarPeople.length > 0;
  const hasSidebarPosts = sidebarPosts.length > 0;
  const sidebarNoResults =
    !!debouncedQ &&
    sidebarSearchComplete &&
    !hasSidebarPeople &&
    !hasSidebarPosts;
  const exploreHref = debouncedQ
    ? `/explore?q=${encodeURIComponent(debouncedQ)}`
    : "/explore";

  return (
    <aside className="fixed right-0 top-0 flex h-screen w-[300px] flex-col overflow-y-auto bg-white">
      <div className="px-5 pt-4 pb-5">
        <ExploreSearchBar
          variant="sidebar"
          inputId="sidebar-explore-search"
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={applySidebarSearch}
          showReset={!!searchInput.trim()}
          onReset={clearSidebarSearch}
          placeholder="Search Archive"
        />
        {debouncedQ ? (
          <div className="mt-4 space-y-3">
            {sidebarSearchLoading ? (
              <>
                {showSidebarPeopleSearch ? (
                  <div className="space-y-2.5">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-2.5 animate-pulse">
                        <div className="size-8 rounded-full bg-neutral-200/80" />
                        <div className="h-3 flex-1 rounded bg-neutral-100" />
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-square animate-pulse rounded-md bg-neutral-100"
                    />
                  ))}
                </div>
              </>
            ) : sidebarNoResults ? (
              <p className="text-sm leading-snug text-neutral-500">
                No results for &ldquo;{debouncedQ}&rdquo;.
              </p>
            ) : (
              <>
                {hasSidebarPeople ? (
                  <ul className="flex flex-col gap-0.5 overflow-hidden rounded-lg">
                    {sidebarPeople.map((u) => (
                      <li key={u.id}>
                        <Link
                          href={`/profile/${encodeURIComponent(u.id)}`}
                          className="flex items-center gap-2.5 rounded-lg px-1.5 py-2 transition-colors hover:bg-neutral-50"
                        >
                          <img
                            src={u.imageUrl}
                            alt=""
                            className="size-8 shrink-0 rounded-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium leading-tight text-black">
                              {u.fullName}
                            </p>
                            <p className="truncate text-xs leading-tight text-neutral-500">
                              {u.username ? `@${u.username}` : "Member"}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {hasSidebarPosts ? (
                  <div className="grid grid-cols-3 gap-1">
                    {sidebarPosts.map((t, i) => (
                      <FeedThumb
                        key={`${t.postId}-${i}`}
                        postId={t.postId}
                        src={t.url}
                      />
                    ))}
                  </div>
                ) : null}
              </>
            )}

            <Link
              href={exploreHref}
              className="inline-flex text-sm font-medium text-black transition-colors hover:text-neutral-600"
            >
              Open explore
            </Link>
          </div>
        ) : null}
      </div>

      <div className="px-5 py-5">
        <SectionTitle
          action={
            <Link
              href="/explore"
              className="text-[13px] leading-none text-neutral-500 transition-colors hover:text-black"
            >
              See all
            </Link>
          }
        >
          From the feed
        </SectionTitle>
        <div className="grid grid-cols-3 gap-1">
          {placeholderTiles > 0
            ? [...Array(placeholderTiles)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-md bg-neutral-100"
                />
              ))
            : tiles.length === 0
              ? (
                  <div className="col-span-3 rounded-lg border border-dashed border-neutral-200 px-3 py-8 text-center">
                    <p className="text-sm text-neutral-500">No public posts yet</p>
                    <Link
                      href="/explore"
                      className="mt-2 inline-block text-sm font-medium text-black hover:underline"
                    >
                      Explore
                    </Link>
                  </div>
                )
              : tiles.map((t, i) => (
                  <FeedThumb
                    key={`${t.postId}-${i}`}
                    postId={t.postId}
                    src={t.url}
                    title="Open post"
                  />
                ))}
        </div>
      </div>

      <div className="px-5 py-5">
        <SectionTitle>People to follow</SectionTitle>
        {!isLoaded || loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2.5 animate-pulse">
                <div className="size-8 rounded-full bg-neutral-200/80" />
                <div className="h-3 flex-1 rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-sm leading-relaxed text-neutral-500">
            {user
              ? "You follow everyone we found here, or there aren’t enough authors yet."
              : "Sign in to follow people from your community."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {suggestions.map((s) => (
              <div key={s.authorClerkId} className="flex items-center gap-2.5">
                <Link
                  href={`/profile/${encodeURIComponent(s.authorClerkId)}`}
                  className="shrink-0"
                >
                  <img
                    src={s.avatarUrl || "https://i.pravatar.cc/150?u=placeholder"}
                    alt=""
                    className="size-8 rounded-full object-cover"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/profile/${encodeURIComponent(s.authorClerkId)}`}
                    className="truncate text-sm font-medium leading-tight text-black hover:text-neutral-600"
                  >
                    {s.fullName}
                  </Link>
                  <span className="truncate text-xs leading-tight text-neutral-500">
                    {s.username ? `@${s.username}` : "Member"}
                  </span>
                </div>
                {user && user.id !== s.authorClerkId ? (
                  <FollowButton
                    targetUserId={s.authorClerkId}
                    initialFollowing={false}
                    onChange={() => void load({ force: true })}
                    className="shrink-0 rounded-md border border-neutral-200 px-2.5 py-1 text-xs text-black transition-colors hover:bg-neutral-100 disabled:opacity-50"
                  />
                ) : (
                  <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    aria-label="Sign in to follow"
                    className="size-6 min-w-0 rounded-md text-neutral-400"
                    isDisabled
                  >
                    <HugeiconsIcon icon={Add01Icon} size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 px-5 py-5">
        <SectionTitle>Trending tags</SectionTitle>
        {loading && tags.length === 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-neutral-100" />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Add tags to posts to see trends here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/explore?q=${encodeURIComponent(tag)}`}
                className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-black transition-colors hover:bg-neutral-200 hover:text-black"
              >
                #{tag}
                <span className="ml-1 tabular-nums text-neutral-500">{count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto px-5 pb-4 pt-5">
        <p className="text-xs leading-relaxed text-neutral-400">
          About · Privacy · Terms · Accessibility
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.08em] text-[#737373]">
          © 2026 Archive
        </p>
      </div>
    </aside>
  );
}
