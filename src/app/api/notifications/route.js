import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connection from "../../../lib/mongo";
import Notifications from "@lib/models/notifications";
import Posts from "@lib/models/posts";
import { getActorImageUrls } from "@lib/clerkActor";

async function enrichNotifications(rows) {
  const actorIds = [...new Set(rows.map((n) => n.actorClerkId).filter(Boolean))];
  const actorImages = await getActorImageUrls(actorIds);

  const postIds = [
    ...new Set(
      rows
        .filter((n) => n.postId && (n.type === "like" || n.type === "comment"))
        .map((n) => n.postId)
    ),
  ];

  const postImages = new Map();
  if (postIds.length > 0) {
    const posts = await Posts.find({ _id: { $in: postIds } }).select("media").lean();
    for (const p of posts) {
      postImages.set(String(p._id), p.media?.[0]?.url ?? null);
    }
  }

  return rows.map((n) => ({
    ...n,
    actorImageUrl: actorImages.get(n.actorClerkId) || n.actorImageUrl || undefined,
    postImageUrl: n.postId ? postImages.get(String(n.postId)) ?? undefined : undefined,
  }));
}

export async function GET(req) {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    if (searchParams.get("unreadCount") === "1") {
      const unread = await Notifications.countDocuments({
        recipientClerkId: userId,
        read: false,
      });
      return NextResponse.json({ unread }, { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get("limit") || "40", 10), 100);
    const rows = await Notifications.find({ recipientClerkId: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const enriched = await enrichNotifications(rows);

    return NextResponse.json({
      notifications: enriched.map((n) => ({
        _id: n._id,
        type: n.type,
        actorClerkId: n.actorClerkId,
        actorFullName: n.actorFullName,
        actorUsername: n.actorUsername,
        actorImageUrl: n.actorImageUrl,
        postId: n.postId ? String(n.postId) : null,
        commentId: n.commentId ? String(n.commentId) : null,
        snippet: n.snippet,
        postImageUrl: n.postImageUrl,
        read: n.read,
        createdAt: n.createdAt,
      })),
    });
  } catch (err) {
    console.error("GET notifications", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
