import { clerkClient } from "@clerk/nextjs/server";

const AVATAR_CACHE_TTL_MS = 15 * 60 * 1000;

/** @type {Map<string, { url: string, expires: number }>} */
const avatarCache = globalThis.__archiveAvatarCache ?? new Map();
globalThis.__archiveAvatarCache = avatarCache;

/** @param {string} userId @param {string} url */
export function setCachedActorImageUrl(userId, url) {
  if (!userId || !url) return;
  avatarCache.set(userId, { url, expires: Date.now() + AVATAR_CACHE_TTL_MS });
}

/** @param {string} userId */
export async function getActorFields(userId) {
  try {
    const client = await clerkClient();
    const u = await client.users.getUser(userId);
    if (u.imageUrl) setCachedActorImageUrl(userId, u.imageUrl);
    return {
      actorFullName:
        u.fullName ||
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.username ||
        "Someone",
      actorUsername: u.username ?? undefined,
      actorImageUrl: u.imageUrl || undefined,
    };
  } catch {
    return {
      actorFullName: "Someone",
      actorUsername: undefined,
      actorImageUrl: undefined,
    };
  }
}

/** @param {string[]} userIds */
export async function getActorImageUrls(userIds) {
  const unique = [...new Set(userIds.filter(Boolean))];
  /** @type {Map<string, string>} */
  const map = new Map();
  if (unique.length === 0) return map;

  const now = Date.now();
  /** @type {string[]} */
  const missing = [];
  for (const id of unique) {
    const hit = avatarCache.get(id);
    if (hit && hit.expires > now && hit.url) {
      map.set(id, hit.url);
    } else {
      missing.push(id);
    }
  }

  if (missing.length === 0) return map;

  const client = await clerkClient();
  const chunkSize = 100;
  const chunks = [];
  for (let i = 0; i < missing.length; i += chunkSize) {
    chunks.push(missing.slice(i, i + chunkSize));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const res = await client.users.getUserList({
          userId: chunk,
          limit: chunk.length,
        });
        for (const u of res.data) {
          if (u.imageUrl) {
            map.set(u.id, u.imageUrl);
            setCachedActorImageUrl(u.id, u.imageUrl);
          }
        }
      } catch {
        await Promise.all(
          chunk.map(async (id) => {
            try {
              const u = await client.users.getUser(id);
              if (u.imageUrl) {
                map.set(id, u.imageUrl);
                setCachedActorImageUrl(id, u.imageUrl);
              }
            } catch {
              /* ignore */
            }
          })
        );
      }
    })
  );

  return map;
}

/**
 * Overwrite denormalized `avatarUrl` on lean post docs with live Clerk image URLs.
 * Uses a short in-memory TTL cache so feed requests don't hit Clerk every time.
 * @param {object[]} posts
 */
export async function enrichPostsAuthorAvatars(posts) {
  if (!posts?.length) return;
  const authorIds = [
    ...new Set(posts.map((p) => p.authorClerkId).filter(Boolean)),
  ];
  if (authorIds.length === 0) return;

  const images = await getActorImageUrls(authorIds);
  for (const p of posts) {
    const live = images.get(p.authorClerkId);
    if (live) p.avatarUrl = live;
  }
}
