"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useOverlayState } from "@heroui/react";
import {
  formatSocialHandle,
  parseSocialMedia,
  resolveSocialUrl,
  SOCIAL_FIELD_CONFIG,
} from "@/lib/socialLinks";
import ImageGrid from "@/components/imageGrid";
import AddPostModal from "@/components/addPostModal";
import FollowListModal from "@/components/followListModal";
import {
  CreateFirstPostTile,
  PostGridCard,
  PostGridSkeleton,
  postGridClassName,
} from "@/components/postGridCard";
import ProfileContentTabs, {
  type ProfileContentTab,
} from "@/components/profileContentTabs";
import { subscribeArchiveFeedRefresh } from "@/lib/feedRefresh";
import {
  type FeedPost,
  feedPostMediaUrls,
  type PostsListResponse,
} from "@/types/feedPost";

// ── icons ──────────────────────────────────────────────────────────────────
const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
    <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 0 0-5.304 0l-4.5 4.5a3.75 3.75 0 0 0 1.035 6.037.75.75 0 0 1-.646 1.353 5.25 5.25 0 0 1-1.449-8.45l4.5-4.5a5.25 5.25 0 1 1 7.424 7.424l-1.757 1.757a.75.75 0 1 1-1.06-1.06l1.757-1.757a3.75 3.75 0 0 0 0-5.304Zm-7.389 4.267a.75.75 0 0 1 1-.353 5.25 5.25 0 0 1 1.449 8.45l-4.5 4.5a5.25 5.25 0 1 1-7.424-7.424l1.757-1.757a.75.75 0 1 1 1.06 1.06l-1.757 1.757a3.75 3.75 0 1 0 5.304 5.304l4.5-4.5a3.75 3.75 0 0 0-1.035-6.037.75.75 0 0 1-.354-1Z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

const AcademicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
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

// ── component ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [contentTab, setContentTab] = useState<ProfileContentTab>("posts");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [repostPosts, setRepostPosts] = useState<FeedPost[]>([]);
  const [repostsLoading, setRepostsLoading] = useState(false);
  const [followStats, setFollowStats] = useState<{
    followerCount: number;
    followingCount: number;
  } | null>(null);
  const [gridRefresh, setGridRefresh] = useState(0);
  const followersModal = useOverlayState();
  const followingModal = useOverlayState();

  const refetchFollowStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/follows/${encodeURIComponent(user.id)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setFollowStats({
        followerCount: data.followerCount ?? 0,
        followingCount: data.followingCount ?? 0,
      });
    } catch {
      // keep previous
    }
  }, [user?.id]);

  const refetchPosts = useCallback(async () => {
    if (!isLoaded || !user) return;
    const authorId = user.id;
    setPostsLoading(true);
    try {
      const qs = new URLSearchParams({
        authorClerkId: authorId,
        skipTotal: "1",
      });
      const res = await fetch(`/api/posts?${qs.toString()}`, {
        credentials: "include",
      });
      const data = (await res.json()) as PostsListResponse;
      setPosts(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [isLoaded, user]);

  const refetchReposts = useCallback(async () => {
    if (!user?.id) return;
    setRepostsLoading(true);
    try {
      const qs = new URLSearchParams({
        engagement: "reposted",
        reposterClerkId: user.id,
        skipTotal: "1",
      });
      const res = await fetch(`/api/posts?${qs.toString()}`, {
        credentials: "include",
      });
      const data = (await res.json()) as PostsListResponse;
      setRepostPosts(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      console.error(err);
      setRepostPosts([]);
    } finally {
      setRepostsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refetchPosts();
  }, [refetchPosts]);

  useEffect(() => {
    if (contentTab === "reposts") void refetchReposts();
  }, [contentTab, refetchReposts]);

  useEffect(() => {
    return subscribeArchiveFeedRefresh(() => {
      setGridRefresh((n) => n + 1);
      void refetchPosts();
      if (contentTab === "reposts") void refetchReposts();
    });
  }, [refetchPosts, refetchReposts, contentTab]);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    void refetchFollowStats();
  }, [isLoaded, user?.id, refetchFollowStats]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center">
        <p className="text-sm text-neutral-500">Loading profile…</p>
      </div>
    );
  }

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

  const AVATAR_SIZE = 96;

  return (
    <div className="flex-1 min-w-0 flex flex-col items-center">
      <div className="w-full max-w-6xl pb-12">
      {!isSignedIn ? (
        <div className="px-4 py-6 sm:px-6 sm:py-10">
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <p className="text-sm text-stone-400">Sign in to view your profile.</p>
          </div>
        </div>
      ) : (
      <>
      {/* Cover — full content width (same as posts grid) */}
      <div className="relative z-0 mt-4 h-36 w-full sm:h-48 bg-stone-200 overflow-hidden rounded-md">
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
      </div>

      {/* Avatar row — pulled up by exactly half the avatar height */}
      <div
        className="relative z-20 px-4 sm:px-6"
        style={{ marginTop: -Math.round(AVATAR_SIZE * 0.62) }}
      >
        <Image
          src={user.imageUrl}
          alt={user.fullName ?? "Profile"}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          className="shrink-0 rounded-full object-cover shadow-[0_0_0_3px_#ffffff]"
        />
      </div>

      {/* Profile info bar */}
      <div className="px-4 pt-5 pb-6 sm:px-6">

        {/* Name + handle */}
        <h1 className="text-lg font-semibold tracking-tight text-black sm:text-xl">
          {user.fullName}
        </h1>
        <p className="mt-0.5 text-sm text-neutral-500">@{user.username}</p>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-5">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold tabular-nums text-black">
              {posts.length}
            </span>
            <span className="text-sm text-neutral-500">posts</span>
          </div>
          <button
            type="button"
            onClick={() => followersModal.open()}
            className="flex items-baseline gap-1 transition-opacity hover:opacity-70"
          >
            <span className="text-sm font-semibold tabular-nums text-black">
              {followStats?.followerCount ?? "—"}
            </span>
            <span className="text-sm text-neutral-500">followers</span>
          </button>
          <button
            type="button"
            onClick={() => followingModal.open()}
            className="flex items-baseline gap-1 transition-opacity hover:opacity-70"
          >
            <span className="text-sm font-semibold tabular-nums text-black">
              {followStats?.followingCount ?? "—"}
            </span>
            <span className="text-sm text-neutral-500">following</span>
          </button>
        </div>

        {user?.id ? (
          <>
            <FollowListModal
              userId={user.id}
              kind="followers"
              state={followersModal}
              isOwnProfile
              onCountsChange={() => void refetchFollowStats()}
            />
            <FollowListModal
              userId={user.id}
              kind="following"
              state={followingModal}
              isOwnProfile
              onCountsChange={() => void refetchFollowStats()}
            />
          </>
        ) : null}

        {/* Bio */}
        {typeof user.publicMetadata?.bio === "string" && user.publicMetadata.bio.trim() ? (
          <p className="mt-3 max-w-[75%] whitespace-pre-line text-sm leading-relaxed text-neutral-700">
            {user.publicMetadata.bio}
          </p>
        ) : null}

        {/* Meta row — social first, then birthday / location / school / website */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {SOCIAL_FIELD_CONFIG.map(({ key }) => {
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
                className="inline-flex items-center rounded-full border border-neutral-200 bg-transparent px-2.5 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-800"
              >
                {formatSocialHandle(key, raw)}
              </a>
            );
          })}
          {birthday && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-transparent px-2.5 py-1 text-xs text-neutral-500">
              <CalendarIcon />
              <span>{birthday}</span>
            </div>
          )}
          {locationRaw && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-transparent px-2.5 py-1 text-xs text-neutral-500">
              <AcademicIcon />
              <span>{locationRaw}</span>
            </div>
          )}
          {schoolOrWorkRaw && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-transparent px-2.5 py-1 text-xs text-neutral-500">
              <BriefcaseIcon />
              <span>{schoolOrWorkRaw}</span>
            </div>
          )}
          {websiteHref && (
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-transparent px-2.5 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-800"
            >
              <LinkIcon />
              <span>{websiteDisplayLabel(websiteRaw)}</span>
            </a>
          )}
        </div>
      </div>

      {/* Content tabs + grid */}
      <ProfileContentTabs value={contentTab} onChange={setContentTab} />
      <div className="mt-4">
        {contentTab === "posts" ? (
          postsLoading ? (
            <PostGridSkeleton />
          ) : posts.length > 0 ? (
            <div className={postGridClassName}>
              {posts
                .map((post) => {
                  const urls = feedPostMediaUrls(post.media);
                  const src = urls[0];
                  if (!src) return null;
                  return { post, urls, src };
                })
                .filter(
                  (row): row is { post: (typeof posts)[number]; urls: string[]; src: string } =>
                    row != null
                )
                .map(({ post, urls, src }, index) => (
                  <PostGridCard
                    key={String(post._id)}
                    postId={String(post._id)}
                    src={src}
                    alt={
                      (post.body && String(post.body).trim().slice(0, 60)) ||
                      `Post by ${post.username || "you"}`
                    }
                    hasMultiple={urls.length > 1}
                    likeCount={post.engagement?.likeCount ?? 0}
                    commentCount={post.engagement?.commentCount ?? 0}
                    className={
                      index === 0
                        ? "rounded-tl-md"
                        : index === 2
                          ? "rounded-tr-md"
                          : ""
                    }
                  />
                ))}
            </div>
          ) : (
            <div className={postGridClassName}>
              <AddPostModal
                username={user.username ?? undefined}
                fullName={user.fullName ?? undefined}
                imageUrl={user.imageUrl}
              >
                <CreateFirstPostTile />
              </AddPostModal>
            </div>
          )
        ) : contentTab === "pictures" ? (
          <ImageGrid authorClerkId={user.id} refreshNonce={gridRefresh} />
        ) : contentTab === "reposts" ? (
          repostsLoading ? (
            <PostGridSkeleton />
          ) : repostPosts.length > 0 ? (
            <div className={postGridClassName}>
              {repostPosts
                .map((post) => {
                  const urls = feedPostMediaUrls(post.media);
                  const src = urls[0];
                  if (!src) return null;
                  return { post, urls, src };
                })
                .filter(
                  (row): row is { post: (typeof repostPosts)[number]; urls: string[]; src: string } =>
                    row != null
                )
                .map(({ post, urls, src }, index) => (
                  <PostGridCard
                    key={String(post._id)}
                    postId={String(post._id)}
                    src={src}
                    alt={
                      (post.body && String(post.body).trim().slice(0, 60)) ||
                      `Repost by ${post.username || "you"}`
                    }
                    hasMultiple={urls.length > 1}
                    likeCount={post.engagement?.likeCount ?? 0}
                    commentCount={post.engagement?.commentCount ?? 0}
                    className={
                      index === 0
                        ? "rounded-tl-md"
                        : index === 2
                          ? "rounded-tr-md"
                          : ""
                    }
                  />
                ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-stone-300">
              No reposts yet.
            </p>
          )
        ) : (
          <p className="py-16 text-center text-sm text-stone-300">
            No tagged posts yet.
          </p>
        )}
      </div>
      </>
      )}
      </div>
    </div>
  );
}