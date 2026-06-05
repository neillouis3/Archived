"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  parseSocialMedia,
  resolveSocialUrl,
  SOCIAL_FIELD_CONFIG,
} from "@/lib/socialLinks";
import ArchiveLeftSidebar from "@/components/leftSideBar";
import ArchiveRightSidebar from "@/components/rightSideBar";
import { SidebarInsetSpacer } from "@/components/sidebarInsetSpacer";
import ImageGrid from "@/components/imageGrid";
import ArchivePost from "@/components/albumPost";
import { SidebarProvider } from "@/components/sidebarContext";
import { subscribeArchiveFeedRefresh } from "@/lib/feedRefresh";
import {
  type FeedPost,
  feedPostMediaUrls,
  type PostsListResponse,
} from "@/types/feedPost";

// ── icons ──────────────────────────────────────────────────────────────────
const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const AcademicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);

const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

function formatWebsiteHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function websiteDisplayLabel(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

// ── component ──────────────────────────────────────────────────────────────
type CollectionTab = "all" | "public" | "friends" | "private";

export default function ProfilePage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [viewMode, setViewMode] = useState<"grid" | "feed">("grid");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [collectionTab, setCollectionTab] = useState<CollectionTab>("all");
  const [followStats, setFollowStats] = useState<{
    followerCount: number;
    followingCount: number;
  } | null>(null);
  const [gridRefresh, setGridRefresh] = useState(0);

  const refetchPosts = useCallback(async () => {
    if (!isLoaded || !user) return;
    const authorId = user.id;
    try {
      const qs = new URLSearchParams({
        authorClerkId: authorId,
        skipTotal: "1",
      });
      if (collectionTab !== "all") qs.set("collection", collectionTab);
      const res = await fetch(`/api/posts?${qs.toString()}`, {
        credentials: "include",
      });
      const data = (await res.json()) as PostsListResponse;
      setPosts(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      console.error(err);
    }
  }, [isLoaded, user, collectionTab]);

  useEffect(() => {
    void refetchPosts();
  }, [refetchPosts]);

  useEffect(() => {
    return subscribeArchiveFeedRefresh(() => {
      setGridRefresh((n) => n + 1);
      void refetchPosts();
    });
  }, [refetchPosts]);

  const removePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => String(p._id) !== id));
  }, []);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/follows/${encodeURIComponent(user.id)}`,
          { credentials: "include" }
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) {
          setFollowStats({
            followerCount: data.followerCount ?? 0,
            followingCount: data.followingCount ?? 0,
          });
        }
      } catch {
        if (!cancelled) setFollowStats(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.id]);

  if (!isLoaded) return null;

  const birthday = user?.publicMetadata?.birthday
    ? new Date(user.publicMetadata.birthday as string).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  const locationRaw =
    ((user?.publicMetadata?.location as string | undefined) ?? "").trim();
  const schoolOrWorkRaw =
    ((user?.publicMetadata?.schoolOrWork as string | undefined) ?? "").trim();
  const websiteRaw =
    ((user?.publicMetadata?.website as string | undefined) ?? "").trim();
  const websiteHref = websiteRaw ? formatWebsiteHref(websiteRaw) : "";
  const social = parseSocialMedia(user?.publicMetadata?.socialMedia);

  const coverImageUrl =
    typeof user?.publicMetadata?.coverImageUrl === "string"
      ? user.publicMetadata.coverImageUrl.trim()
      : "";

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white">
        <div className="w-full flex flex-row max-w-[1600px] mx-auto">

        <ArchiveLeftSidebar />
        <SidebarInsetSpacer />

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
          <div className="w-full max-w-6xl">
          {!isSignedIn ? (
            <div className="px-4 py-6 sm:px-6 sm:py-10">
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <p className="text-xs text-stone-400">Sign in to view your profile.</p>
              </div>
            </div>
          ) : (
          <>
          {/* Cover / hero area */}
          <div className="relative h-36 sm:h-48 bg-stone-200 overflow-hidden">
            {coverImageUrl ? (
              <Image
                src={coverImageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, #d6d3cc 0%, #c8c4bb 50%, #b8b4ac 100%)",
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
            <NextLink
              href="/accounts/settings#profile-banner"
              className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-stone-600 bg-white/80 backdrop-blur-sm border border-stone-200/60 rounded-lg px-2.5 py-1.5 hover:bg-white transition-colors"
            >
              <PencilIcon />
              Edit cover
            </NextLink>
          </div>

          {/* Profile info bar */}
          <div className="px-4 pb-6 sm:px-6 border-b border-stone-200/80">
            {/* Avatar — overlaps cover */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                <Image
                  src={user.imageUrl}
                  alt={user.fullName ?? "Profile"}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white"
                />
              </div>
              <div className="flex items-center gap-2 pb-1">
                <NextLink href="/accounts/settings">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs text-stone-600 border border-stone-300 rounded-lg px-3 py-1.5 hover:bg-stone-100 transition-colors"
                  >
                    <PencilIcon />
                    Edit profile
                  </button>
                </NextLink>
              </div>
            </div>

            {/* Name + handle */}
            <p className="text-xl font-medium font-sans text-stone-800">
              {user.fullName}
            </p>
            <p className="text-xs text-stone-400 mt-0.5 mb-3">@{user.username}</p>

            {/* Bio */}
            {typeof user.publicMetadata?.bio === "string" && user.publicMetadata.bio.trim() ? (
              <p className="text-sm text-stone-600 leading-relaxed mb-4 max-w-lg">
                {user.publicMetadata.bio}
              </p>
            ) : null}

            {/* Meta row */}
            <div className="flex items-center gap-5 flex-wrap mb-3">
              {birthday && (
                <div className="flex items-center gap-1.5 text-stone-400">
                  <CalendarIcon />
                  <span className="text-xs">{birthday}</span>
                </div>
              )}
              {locationRaw && (
                <div className="flex items-center gap-1.5 text-stone-400">
                  <AcademicIcon />
                  <span className="text-xs">{locationRaw}</span>
                </div>
              )}
              {schoolOrWorkRaw && (
                <div className="flex items-center gap-1.5 text-stone-400">
                  <BriefcaseIcon />
                  <span className="text-xs">{schoolOrWorkRaw}</span>
                </div>
              )}
              {websiteHref && (
                <div className="flex items-center gap-1.5 text-stone-400">
                  <LinkIcon />
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2 transition-colors"
                  >
                    {websiteDisplayLabel(websiteRaw)}
                  </a>
                </div>
              )}
            </div>

            {SOCIAL_FIELD_CONFIG.some(({ key }) => social[key].trim() && resolveSocialUrl(key, social[key])) && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-stone-300 w-full sm:w-auto sm:mr-1">Social</span>
                {SOCIAL_FIELD_CONFIG.map(({ key, short }) => {
                  const raw = social[key].trim();
                  if (!raw) return null;
                  const href = resolveSocialUrl(key, raw);
                  if (!href) return null;
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-md border border-stone-200/90 text-stone-500 hover:bg-stone-100/90 hover:text-stone-700 transition-colors"
                    >
                      {short}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6">
              {[
                { value: posts.length, label: "posts" },
                {
                  value: followStats?.followerCount ?? "—",
                  label: "followers",
                },
                {
                  value: followStats?.followingCount ?? "—",
                  label: "following",
                },
              ].map(({ value, label }) => (
                <div key={label} className="flex items-baseline gap-1">
                  <span className="text-sm font-medium text-stone-800">{value}</span>
                  <span className="text-xs text-stone-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Posts section */}
          <div className="px-4 py-6 sm:px-6 sm:py-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {(
                [
                  { id: "all" as const, label: "All" },
                  { id: "public" as const, label: "Public" },
                  { id: "friends" as const, label: "Friends" },
                  { id: "private" as const, label: "Private" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCollectionTab(id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    collectionTab === id
                      ? "border-stone-600 text-stone-800 bg-white"
                      : "border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-stone-400">Posts</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "grid" ? "bg-white ring-1 ring-inset ring-stone-200 text-stone-800" : "text-stone-400 hover:text-stone-700"
                  }`}
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setViewMode("feed")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "feed" ? "bg-white ring-1 ring-inset ring-stone-200 text-stone-800" : "text-stone-400 hover:text-stone-700"
                  }`}
                >
                  <ListIcon />
                </button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <ImageGrid
                authorClerkId={user.id}
                collection={
                  collectionTab === "all" ? undefined : collectionTab
                }
                refreshNonce={gridRefresh}
              />
            ) : (
              // Feed view
              <div className="flex flex-col gap-12 max-w-[520px]">
                {posts.length === 0 ? (
                  <p className="text-xs text-stone-300 text-center py-16">
                    No posts yet.
                  </p>
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
            )}
          </div>
          </>
          )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden xl:block xl:w-64 2xl:w-72 flex-shrink-0">
          <ArchiveRightSidebar />
        </div>
      </div>
    </div>
    </SidebarProvider>
  );
}