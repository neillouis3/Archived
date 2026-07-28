"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ImageGrid from "@/components/imageGrid";
import ArchivePost from "@/components/albumPost";
import FollowButton from "@/components/FollowButton";
import FriendButton from "@/components/FriendButton";
import {
  type FeedPost,
  feedPostMediaUrls,
  type PostsListResponse,
} from "@/types/feedPost";

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
  const [viewMode, setViewMode] = useState<"grid" | "feed">("grid");
  const [followStats, setFollowStats] = useState<{
    followerCount: number;
    followingCount: number;
  } | null>(null);

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

    (async () => {
      try {
        const qs = new URLSearchParams({
          authorClerkId: userId,
          skipTotal: "1",
        });
        if (viewMode === "grid") qs.set("skipEngagement", "1");
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
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, viewMode]);

  const removePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => String(p._id) !== id));
  }, []);

  if (!userId) {
    return (
      <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
        <p className="text-xs text-stone-400 p-8">Invalid profile link.</p>
      </div>
    );
  }

  if (!isLoaded) return null;

  if (me?.id === userId) {
    return (
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center border-x-0 sm:border-x sm:border-stone-200/80">
        <p className="text-xs text-stone-400">Opening your profile…</p>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
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
      <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
        <div className="w-full max-w-6xl px-4 py-6 text-center sm:px-6 sm:py-10">
          <p className="text-xs text-stone-300 mb-2">Profile</p>
          <p className="text-sm text-stone-500 mb-6">This user could not be found.</p>
          <NextLink
            href="/explore"
            className="text-xs text-stone-600 underline underline-offset-2"
          >
            Explore
          </NextLink>
        </div>
      </div>
    );
  }

  const handle = profile.username ? `@${profile.username}` : profile.id.slice(0, 10) + "…";

  return (
    <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
      <div className="w-full max-w-6xl">

        <div className="relative h-36 sm:h-48 bg-stone-200 overflow-hidden">
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

        <div className="px-4 pb-6 sm:px-6 border-b border-stone-200/80">
          <div className="flex items-end justify-between -mt-10 mb-4 gap-4 flex-wrap">
            <div className="relative">
              <Image
                src={profile.imageUrl}
                alt={profile.fullName}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-4 border-white"
              />
            </div>
            <div className="flex items-center gap-2 pb-1 flex-wrap justify-end">
              <FollowButton targetUserId={userId} />
              <FriendButton targetUserId={userId} />
            </div>
          </div>

          <p className="text-xl font-medium text-stone-800">
            {profile.fullName}
          </p>
          <p className="text-xs text-stone-400 mt-0.5 mb-3">{handle}</p>

          {profile.bio ? (
            <p className="text-sm text-stone-600 leading-relaxed mb-4 max-w-lg">
              {profile.bio}
            </p>
          ) : null}

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

        <div className="px-4 py-6 sm:px-6 sm:py-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-stone-400">Posts</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white ring-1 ring-inset ring-stone-200 text-stone-800" : "text-stone-400 hover:text-stone-700"
                }`}
              >
                <GridIcon />
              </button>
              <button
                type="button"
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
            <ImageGrid authorClerkId={userId} />
          ) : (
            <div className="mx-auto flex w-full max-w-[520px] flex-col gap-12">
              {posts.length === 0 ? (
                <p className="text-xs text-stone-300 text-center py-16">
                  No posts to show.
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
      </div>
    </div>
  );
}
