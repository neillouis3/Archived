import { clerkClient } from "@clerk/nextjs/server";

/** @param {string} userId */
export async function getActorFields(userId) {
  try {
    const client = await clerkClient();
    const u = await client.users.getUser(userId);
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

  const client = await clerkClient();
  const chunkSize = 100;

  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    try {
      const res = await client.users.getUserList({ userId: chunk, limit: chunk.length });
      for (const u of res.data) {
        if (u.imageUrl) map.set(u.id, u.imageUrl);
      }
    } catch {
      await Promise.all(
        chunk.map(async (id) => {
          try {
            const u = await client.users.getUser(id);
            if (u.imageUrl) map.set(id, u.imageUrl);
          } catch {
            /* ignore */
          }
        })
      );
    }
  }

  return map;
}
