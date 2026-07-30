import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Follows from "@lib/models/follows";
import connection from "../../../../../lib/mongo";
import { isFollowing } from "@lib/socialQueries";

/**
 * GET /api/follows/[userId]/list?type=followers|following
 * Returns profile rows for people who follow `userId`, or who `userId` follows.
 */
export async function GET(req, context) {
  try {
    await connection();
    const { userId: viewerClerkId } = await auth();
    const params = await context.params;
    const targetId = params.userId;
    if (!targetId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") === "following" ? "following" : "followers";
    const limit = Math.min(parseInt(searchParams.get("limit") || "60", 10) || 60, 100);

    const rows =
      type === "following"
        ? await Follows.find({ followerClerkId: targetId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("followingClerkId")
            .lean()
        : await Follows.find({ followingClerkId: targetId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("followerClerkId")
            .lean();

    const ids = rows
      .map((r) =>
        type === "following" ? r.followingClerkId : r.followerClerkId
      )
      .filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    const client = await clerkClient();
    const { data } = await client.users.getUserList({
      userId: ids,
      limit: ids.length,
    });
    const byId = new Map(data.map((u) => [u.id, u]));

    const viewerFollowFlags = await Promise.all(
      ids.map(async (id) => {
        if (!viewerClerkId || viewerClerkId === id) {
          return { id, viewerFollows: false };
        }
        return {
          id,
          viewerFollows: await isFollowing(viewerClerkId, id),
        };
      })
    );
    const followMap = new Map(
      viewerFollowFlags.map((f) => [f.id, f.viewerFollows])
    );

    const users = ids.map((id) => {
      const u = byId.get(id);
      return {
        id,
        username: u?.username ?? null,
        fullName:
          u?.fullName ||
          [u?.firstName, u?.lastName].filter(Boolean).join(" ") ||
          u?.username ||
          "User",
        imageUrl:
          u?.imageUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(id)}`,
        viewerFollows: followMap.get(id) ?? false,
        isSelf: viewerClerkId === id,
      };
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error("GET /api/follows/[userId]/list error:", err);
    return NextResponse.json({ error: "Failed to load list" }, { status: 500 });
  }
}
