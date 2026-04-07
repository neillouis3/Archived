import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Friendships from "@lib/models/friendships";
import connection from "../../../../lib/mongo";

export async function DELETE(_req, context) {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const otherId = params.userId;
    if (!otherId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const result = await Friendships.deleteMany({
      status: "accepted",
      $or: [
        { requesterClerkId: userId, recipientClerkId: otherId },
        { requesterClerkId: otherId, recipientClerkId: userId },
      ],
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "No friendship found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/friends/[userId] error:", err);
    return NextResponse.json({ error: "Failed to remove friend" }, { status: 500 });
  }
}
