"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useOverlayState } from "@heroui/react";
import ImageGrid from "@/components/imageGrid";
import { PostGridCard, PostGridSkeleton, postGridClassName } from "@/components/postGridCard";
import ProfileContentTabs, {
  type ProfileContentTab,
} from "@/components/profileContentTabs";
import FollowButton from "@/components/FollowButton";
import FollowListModal from "@/components/followListModal";
import ProfileActionsMenu from "@/components/profileActionsMenu";
import {
  type FeedPost,
  feedPostMediaUrls,
  type PostsListResponse,
} from "@/types/feedPost";

type ProfileUser = {
  id: string;
  username: string | null;
  fullName: string;
  imageUrl: string;
  bio: string | null;
  coverImageUrl: string | null;
};

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.userId;
  const userId = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";

  const { user: me, isLoaded } = useUser();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [repostPosts, setRepostPosts] = useState<FeedPost[]>([]);
  const [repostsLoading, setRepostsLoading] = useState(false);
  const [contentTab, setContentTab] = useState<ProfileContentTab>("posts");
  const [followStats, setFollowStats] = useState<{
    followerCount: number;
    followingCount: number;
  } | null>(null);
  const followersModal = useOverlayState();
  const followingModal = useOverlayState();

  const refetchFollowStats = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/follows/${encodeURIComponent(userId)}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const f = await res.json();
      setFollowStats({
        followerCount: f.followerCount ?? 0,
        followingCount: f.followingCount ?? 0,
      });
    } catch {
      // keep previous
    }
  }, [userId]);

  useEffect(() => {
    if (!isLoaded || !me || !userId || me.id !== userId) return;
    router.replace("/accounts/profile");
  }, [isLoaded, me, userId, router]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoadingProfile(true);

    (async () => {
      try {
        const [userRes, followsRes] = await Promise.all([
          fetch(`/api/users/${encodeURIComponent(userId)}`),
          fetch(`/api/follows/${encodeURIComponent(userId)}`, {
            credentials: "include",
          }),
        ]);

        if (cancelled) return;

        if (userRes.status === 404 || !userRes.ok) {
          setNotFound(true);
          setProfile(null);
        } else {
          const profileData = await userRes.json();
          setNotFound(false);
          setProfile(profileData);
        }

        if (followsRes.ok) {
          const f = await followsRes.json();
          setFollowStats({
            followerCount: f.followerCount ?? 0,
            followingCount: f.followingCount ?? 0,
          });
        }
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setPostsLoading(true);

    (async () => {
      try {
        const qs = new URLSearchParams({
          authorClerkId: userId,
          skipTotal: "1",
        });
        const postsRes = await fetch(`/api/posts?${qs.toString()}`, {
          credentials: "include",
        });
        if (cancelled) return;
        if (postsRes.ok) {
          const data = (await postsRes.json()) as PostsListResponse;
          setPosts(Array.isArray(data.results) ? data.results : []);
        } else {
          setPosts([]);
        }
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setPostsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || contentTab !== "reposts") return;
    let cancelled = false;
    setRepostsLoading(true);

    (async () => {
      try {
        const qs = new URLSearchParams({
          engagement: "reposted",
          reposterClerkId: userId,
          skipTotal: "1",
        });
        const res = await fetch(`/api/posts?${qs.toString()}`, {
          credentials: "include",
        });
        if (cancelled) return;
        if (res.ok) {
          const data = (await res.json()) as PostsListResponse;
          setRepostPosts(Array.isArray(data.results) ? data.results : []);
        } else {
          setRepostPosts([]);
        }
      } catch {
        if (!cancelled) setRepostPosts([]);
      } finally {
        if (!cancelled) setRepostsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, contentTab]);

  if (!userId) {
    return (
      <div className="flex-1 min-w-0 flex flex-col items-center">
        <p className="text-sm text-stone-400 p-8">Invalid profile link.</p>
      </div>
    );
  }

  if (!isLoaded) return null;

  if (me?.id === userId) {
    return (
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
        <p className="text-sm text-stone-400">Opening your profile…</p>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="flex-1 min-w-0 flex flex-col items-center">
        <div className="w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="h-48 bg-stone-200 rounded-lg animate-pulse mb-8" />
          <div className="h-6 w-48 bg-stone-200/80 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-stone-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex-1 min-w-0 flex flex-col items-center">
        <div className="w-full max-w-6xl px-4 py-6 text-center sm:px-6 sm:py-10">
          <p className="text-sm text-stone-300 mb-2">Profile</p>
          <p className="text-sm text-stone-500 mb-6">This user could not be found.</p>
          <NextLink
            href="/explore"
            className="text-sm text-stone-600 underline underline-offset-2"
          >
            Explore
          </NextLink>
        </div>
      </div>
    );
  }

  const handle = profile.username
    ? `@${profile.username.replace(/^@+/, "")}`
    : profile.id.slice(0, 10) + "…";
  const AVATAR_SIZE = 96;

  return (
    <div className="flex-1 min-w-0 flex flex-col items-center">
      <div className="w-full max-w-6xl pb-12">

        {/* Cover — full content width (same as posts grid) */}
        <div className="relative z-0 mt-4 h-36 w-full sm:h-48 bg-stone-200 overflow-hidden rounded-md">
          {profile.coverImageUrl ? (
            <Image
              src={profile.coverImageUrl}
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
            src={profile.imageUrl}
            alt={profile.fullName}
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
            className="shrink-0 rounded-full object-cover shadow-[0_0_0_3px_#ffffff]"
          />
        </div>

        <div className="px-4 pt-5 pb-6 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-black sm:text-xl">
                {profile.fullName}
              </h1>
              <p className="mt-0.5 text-sm text-neutral-500">{handle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-0.5">
              <FollowButton
                targetUserId={userId}
                username={profile.username}
                imageUrl={profile.imageUrl}
              />
              <ProfileActionsMenu
                userId={userId}
                username={profile.username}
              />
            </div>
          </div>

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

          <FollowListModal
            userId={userId}
            kind="followers"
            state={followersModal}
            onCountsChange={() => void refetchFollowStats()}
          />
          <FollowListModal
            userId={userId}
            kind="following"
            state={followingModal}
            onCountsChange={() => void refetchFollowStats()}
          />

          {profile.bio ? (
            <p className="mt-3 max-w-[75%] whitespace-pre-line text-sm leading-relaxed text-neutral-700">
              {profile.bio}
            </p>
          ) : null}
        </div>

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
                        `Post by ${post.username || "author"}`
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
            ) : null
          ) : contentTab === "pictures" ? (
            <ImageGrid authorClerkId={userId} />
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
                        `Repost by ${post.username || "author"}`
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
      </div>
    </div>
  );
}
