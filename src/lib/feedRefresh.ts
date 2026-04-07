/** Fired after creating a post so open pages can refetch without `location.reload()`. */
export const ARCHIVE_FEED_REFRESH = "archive:feed-refresh";

export function dispatchArchiveFeedRefresh(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ARCHIVE_FEED_REFRESH));
  }
}

export function subscribeArchiveFeedRefresh(handler: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const wrapped = () => {
    handler();
  };
  window.addEventListener(ARCHIVE_FEED_REFRESH, wrapped);
  return () => window.removeEventListener(ARCHIVE_FEED_REFRESH, wrapped);
}
