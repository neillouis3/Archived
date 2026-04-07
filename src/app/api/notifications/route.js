import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connection from "../../../lib/mongo";
import Notifications from "@lib/models/notifications";

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

    return NextResponse.json({
      notifications: rows.map((n) => ({
        _id: n._id,
        type: n.type,
        actorClerkId: n.actorClerkId,
        actorFullName: n.actorFullName,
        actorUsername: n.actorUsername,
        actorImageUrl: n.actorImageUrl,
        postId: n.postId ? String(n.postId) : null,
        commentId: n.commentId ? String(n.commentId) : null,
        snippet: n.snippet,
        read: n.read,
        createdAt: n.createdAt,
      })),
    });
  } catch (err) {
    console.error("GET notifications", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
