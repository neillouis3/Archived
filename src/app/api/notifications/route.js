import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connection from "../../../lib/mongo";
import Notifications from "@lib/models/notifications";
import Posts from "@lib/models/posts";
import { getActorImageUrls } from "@lib/clerkActor";

async function enrichNotifications(rows) {
  const missingActorIds = [
    ...new Set(
      rows
        .filter((n) => n.actorClerkId && !n.actorImageUrl)
        .map((n) => n.actorClerkId)
    ),
  ];

  const postIds = [
    ...new Set(
      rows
        .filter((n) => n.postId && (n.type === "like" || n.type === "comment"))
        .map((n) => n.postId)
    ),
  ];

  const [actorImages, posts] = await Promise.all([
    missingActorIds.length > 0
      ? getActorImageUrls(missingActorIds)
      : Promise.resolve(new Map()),
    postIds.length > 0
      ? Posts.find({ _id: { $in: postIds } }).select("media").lean()
      : Promise.resolve([]),
  ]);

  const postImages = new Map();
  for (const p of posts) {
    postImages.set(String(p._id), p.media?.[0]?.url ?? null);
  }

  return rows.map((n) => ({
    ...n,
    actorImageUrl:
      n.actorImageUrl || actorImages.get(n.actorClerkId) || undefined,
    postImageUrl: n.postId
      ? postImages.get(String(n.postId)) ?? undefined
      : undefined,
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
