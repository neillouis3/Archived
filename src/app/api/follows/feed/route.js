import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Posts from "@lib/models/posts";
import connection from "../../../../lib/mongo";
import { enrichPostsAuthorAvatars } from "@lib/clerkActor";
import {
  buildFollowingFeedFilter,
  getAcceptedFriendClerkIdsSet,
  getFollowingClerkIds,
} from "@lib/socialQueries";

export async function GET(req) {
  try {
    await connection();
    const { userId: viewerClerkId } = await auth();
    if (!viewerClerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;

    const [followingIds, friendSet] = await Promise.all([
      getFollowingClerkIds(viewerClerkId),
      getAcceptedFriendClerkIdsSet(viewerClerkId),
    ]);
    const filter = buildFollowingFeedFilter(viewerClerkId, followingIds, friendSet);

    const [results, total] = await Promise.all([
      Posts.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Posts.countDocuments(filter),
    ]);

    await enrichPostsAuthorAvatars(results);

    return NextResponse.json({ results, page, limit, total }, { status: 200 });
  } catch (err) {
    console.error("GET /api/follows/feed error:", err);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
