"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import PostDetailModal from "@/components/postDetailModal";

type PostViewerContextValue = {
  postId: string | null;
  openPost: (postId: string) => void;
  closePost: () => void;
};

const PostViewerContext = createContext<PostViewerContextValue | null>(null);

export function PostViewerProvider({ children }: { children: ReactNode }) {
  const [postId, setPostId] = useState<string | null>(null);

  const openPost = useCallback((id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setPostId(trimmed);
  }, []);

  const closePost = useCallback(() => {
    setPostId(null);
  }, []);

  const value = useMemo(
    () => ({ postId, openPost, closePost }),
    [postId, openPost, closePost]
  );

  return (
    <PostViewerContext.Provider value={value}>
      {children}
      {postId ? (
        <PostDetailModal postId={postId} onClose={closePost} />
      ) : null}
    </PostViewerContext.Provider>
  );
}

export function usePostViewer(): PostViewerContextValue {
  const ctx = useContext(PostViewerContext);
  if (!ctx) {
    throw new Error("usePostViewer must be used within PostViewerProvider");
  }
  return ctx;
}

/** Safe hook when provider might be absent (returns no-ops). */
export function usePostViewerOptional(): PostViewerContextValue {
  const ctx = useContext(PostViewerContext);
  return (
    ctx ?? {
      postId: null,
      openPost: () => {},
      closePost: () => {},
    }
  );
}
