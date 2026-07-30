"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import PostDetailModal from "@/components/postDetailModal";

/**
 * Shared / deep-linked /post/[id] URL.
 * In-app opens use PostViewerProvider instead (no routing).
 */
export default function PostPermalinkPage() {
  const router = useRouter();
  const params = useParams();
  const raw = params?.id;
  const postId = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";

  const onClose = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace("/home");
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-white" aria-hidden>
      {postId ? <PostDetailModal postId={postId} onClose={onClose} /> : null}
    </div>
  );
}
