"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ArchiveLeftSidebar from "@/components/leftSideBar";
import ArchivePost from "@/components/albumPost";
import { SidebarProvider } from "@/components/sidebarContext";
import { SidebarInsetSpacer } from "@/components/sidebarInsetSpacer";
import ArchiveRightSidebar from "@/components/rightSideBar";
import { type FeedPost, feedPostMediaUrls } from "@/types/feedPost";

export default function PostPermalinkPage() {
  const params = useParams();
  const router = useRouter();
  const raw = params?.id;
  const postId = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";

  const [post, setPost] = useState<FeedPost | null>(null);
  const [error, setError] = useState<"missing" | "notfound" | "failed" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId || !mongooseObjectIdOk(postId)) {
      setError("missing");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(postId)}`, {
          credentials: "include",
        });
        if (cancelled) return;
        if (res.status === 404) {
          setPost(null);
          setError("notfound");
          return;
        }
        if (!res.ok) {
          setPost(null);
          setError("failed");
          return;
        }
        const data = (await res.json()) as FeedPost;
        if (!cancelled) {
          setPost(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setPost(null);
          setError("failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (!postId || error === "missing") {
    return (
      <SidebarProvider>
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
          <p className="text-xs text-stone-400">Invalid post link.</p>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white">
        <div className="w-full flex flex-row max-w-[1600px] mx-auto">
          <ArchiveLeftSidebar />
          <SidebarInsetSpacer />

          <div className="flex-1 min-w-0 flex flex-col items-center border-x-0 sm:border-x sm:border-stone-200/80">
            <div className="w-full max-w-[520px] px-4 py-6 sm:px-6 sm:py-8">
              <div className="flex items-center gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                >
                  ← Back
                </button>
                <Link
                  href="/home"
                  className="text-xs text-stone-300 hover:text-stone-500 transition-colors"
                >
                  Home
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-7 w-40 bg-stone-100 rounded" />
                  <div className="aspect-square w-full bg-stone-100 rounded" />
                </div>
              ) : error === "notfound" ? (
                <div className="text-center py-20">
                  <p className="text-xs text-stone-300 mb-2">
                    Not available
                  </p>
                  <p className="text-xs text-stone-400 max-w-xs mx-auto">
                    This post may be private, deleted, or the link is wrong.
                  </p>
                  <Link
                    href="/home"
                    className="inline-block mt-6 text-xs text-stone-600 underline underline-offset-4"
                  >
                    Go to feed
                  </Link>
                </div>
              ) : error === "failed" || !post ? (
                <p className="text-xs text-stone-400 text-center py-20">Could not load this post.</p>
              ) : (
                <ArchivePost
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
                  initialEngagement={post.engagement}
                  onPostDeleted={() => router.push("/home")}
                />
              )}
            </div>
          </div>

          <div className="hidden xl:block xl:w-64 2xl:w-72 flex-shrink-0">
            <ArchiveRightSidebar />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

function mongooseObjectIdOk(id: string) {
  return /^[a-fA-F0-9]{24}$/.test(id);
}
