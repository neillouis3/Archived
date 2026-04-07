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
