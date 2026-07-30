import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Follows from "@lib/models/follows";
import connection from "../../../../lib/mongo";

/** Remove someone who follows you (own profile only). */
export async function DELETE(_req, context) {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const followerClerkId = params.followerId;
    if (!followerClerkId) {
      return NextResponse.json({ error: "Missing followerId" }, { status: 400 });
    }

    await Follows.deleteOne({
      followerClerkId,
      followingClerkId: userId,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/follows/followers/[followerId] error:", err);
    return NextResponse.json({ error: "Failed to remove follower" }, { status: 500 });
  }
}
