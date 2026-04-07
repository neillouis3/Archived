import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Friendships from "@lib/models/friendships";
import connection from "../../../lib/mongo";

/** GET /api/friends — accepted friends (Clerk ids) */
export async function GET() {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await Friendships.find({
      status: "accepted",
      $or: [
        { requesterClerkId: userId },
        { recipientClerkId: userId },
      ],
    }).lean();

    const friendIds = rows.map((r) =>
      r.requesterClerkId === userId ? r.recipientClerkId : r.requesterClerkId
    );

    return NextResponse.json({ friends: friendIds }, { status: 200 });
  } catch (err) {
    console.error("GET /api/friends error:", err);
    return NextResponse.json({ error: "Failed to list friends" }, { status: 500 });
  }
}
