import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connection from "../../../lib/mongo";
import Posts from "@lib/models/posts";
import Follows from "@lib/models/follows";

export async function GET() {
  try {
    await connection();
    const { userId: viewerClerkId } = await auth();

    const publicMatch = { visibility: "public" };
    const postProjection =
      "media.url authorClerkId fullName username avatarUrl createdAt";

    const followsPromise = viewerClerkId
      ? Follows.find({ followerClerkId: viewerClerkId })
          .select("followingClerkId")
          .lean()
      : Promise.resolve([]);

    const [followingRows, recent, tagAgg] = await Promise.all([
      followsPromise,
      Posts.find(publicMatch)
        .select(postProjection)
        .sort({ createdAt: -1 })
        .limit(24)
        .lean(),
      Posts.aggregate([
        { $match: { ...publicMatch, tags: { $exists: true, $ne: [] } } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 10 },
      ]).catch(() => []),
    ]);

    const followingSet = new Set(
      followingRows.map((r) => r.followingClerkId)
    );

    const tiles = [];
    for (const post of recent) {
      if (tiles.length >= 9) break;
      const urls = (post.media || []).map((m) => m.url).filter(Boolean);
      for (const url of urls) {
        if (tiles.length >= 9) break;
        tiles.push({
          url,
          postId: String(post._id),
          authorClerkId: post.authorClerkId,
        });
      }
    }

    const tags = tagAgg
      .filter((t) => t._id && String(t._id).trim())
      .map((t) => ({ tag: String(t._id).trim(), count: t.count }));

    const seenAuthors = new Set();
    const suggestions = [];
    for (const post of recent) {
      const aid = post.authorClerkId;
      if (!aid || seenAuthors.has(aid)) continue;
      if (viewerClerkId && aid === viewerClerkId) continue;
      if (followingSet.has(aid)) continue;
      seenAuthors.add(aid);
      suggestions.push({
        authorClerkId: aid,
        fullName: post.fullName || "Member",
        username: post.username || "",
        avatarUrl: post.avatarUrl || "",
        isFollowing: false,
      });
      if (suggestions.length >= 5) break;
    }

    return NextResponse.json({ tiles, tags, suggestions }, { status: 200 });
  } catch (err) {
    console.error("GET /api/sidebar", err);
    return NextResponse.json(
      { tiles: [], tags: [], suggestions: [] },
      { status: 200 }
    );
  }
}
