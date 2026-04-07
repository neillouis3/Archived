import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Follows from "@lib/models/follows";
import connection from "../../../../lib/mongo";
import { isFollowing } from "@lib/socialQueries";

export async function GET(_req, context) {
  try {
    await connection();
    const { userId: viewerClerkId } = await auth();
    const params = await context.params;
    const targetId = params.userId;
    if (!targetId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const [followerCount, followingCount, following, followedByTarget] =
      await Promise.all([
        Follows.countDocuments({ followingClerkId: targetId }),
        Follows.countDocuments({ followerClerkId: targetId }),
        viewerClerkId
          ? isFollowing(viewerClerkId, targetId)
          : Promise.resolve(false),
        viewerClerkId
          ? isFollowing(targetId, viewerClerkId)
          : Promise.resolve(false),
      ]);

    return NextResponse.json(
      {
        followerCount,
        followingCount,
        isFollowing: following,
        /** They follow you (for “Follow back” in UI) */
        followsYou: followedByTarget,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/follows/[userId] error:", err);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}

export async function DELETE(_req, context) {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const followingClerkId = params.userId;
    if (!followingClerkId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await Follows.deleteOne({
      followerClerkId: userId,
      followingClerkId,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/follows/[userId] error:", err);
    return NextResponse.json({ error: "Failed to unfollow" }, { status: 500 });
  }
}
