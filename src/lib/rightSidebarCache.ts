/** In-memory cache so the right sidebar does not refetch on every client navigation. */

export const SIDEBAR_CACHE_TTL_MS = 120_000;

export type SidebarTile = { url: string; postId: string; authorClerkId: string };
export type SidebarTagRow = { tag: string; count: number };
export type SidebarSuggestion = {
  authorClerkId: string;
  fullName: string;
  username: string;
  avatarUrl: string;
};

export type SidebarCachePayload = {
  tiles: SidebarTile[];
  tags: SidebarTagRow[];
  suggestions: SidebarSuggestion[];
};

type Entry = SidebarCachePayload & {
  userKey: string;
  expiresAt: number;
};

let entry: Entry | null = null;

export function getSidebarCache(userKey: string): SidebarCachePayload | null {
  if (!entry || entry.userKey !== userKey) return null;
  if (Date.now() > entry.expiresAt) {
    entry = null;
    return null;
  }
  return {
    tiles: entry.tiles,
    tags: entry.tags,
    suggestions: entry.suggestions,
  };
}

export function setSidebarCache(userKey: string, data: SidebarCachePayload): void {
  entry = {
    ...data,
    userKey,
    expiresAt: Date.now() + SIDEBAR_CACHE_TTL_MS,
  };
}

export function invalidateSidebarCache(): void {
  entry = null;
}
