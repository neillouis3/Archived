import type { PostEngagementSnapshot } from "@/components/albumPost";

/** One media slot from GET /api/posts (object with url / ufsUrl or legacy string). */
export type FeedPostMediaEntry = { url?: string; ufsUrl?: string } | string;

function normalizeMediaUrl(u: string): string {
  const t = u.trim();
  if (!t) return "";
  if (t.startsWith("//")) return `https:${t}`;
  return t;
}

export type FeedPost = {
  _id: string;
  authorClerkId?: string;
  fullName: string;
  title?: string;
  body?: string;
  media?: FeedPostMediaEntry[];
  username: string;
  avatarUrl: string;
  createdAt?: string;
  visibility?: string;
  location?: string;
  /** Stored frame ratio: 4/5, 1, 5/4, or 1.91 */
  aspectRatio?: number;
  engagement?: PostEngagementSnapshot | null;
};

export function feedPostMediaEntryUrl(m: FeedPostMediaEntry): string {
  if (typeof m === "string") return normalizeMediaUrl(m);
  const raw = m.url ?? m.ufsUrl ?? "";
  return normalizeMediaUrl(typeof raw === "string" ? raw : "");
}

export function feedPostMediaUrls(media: FeedPostMediaEntry[] | undefined): string[] {
  if (!media?.length) return [];
  return media
    .map(feedPostMediaEntryUrl)
    .filter((u) => u.length > 0);
}

export type PostsListResponse = { results?: FeedPost[] };
