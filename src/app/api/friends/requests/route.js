import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Friendships from "@lib/models/friendships";
import connection from "../../../../lib/mongo";

/** Incoming pending friend requests */
export async function GET() {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await Friendships.find({
      recipientClerkId: userId,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .lean();

    const requests = rows.map((r) => ({
      requesterClerkId: r.requesterClerkId,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ requests }, { status: 200 });
  } catch (err) {
    console.error("GET /api/friends/requests error:", err);
    return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
  }
}
