import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Posts from "@lib/models/posts";
import connection from "../../../../lib/mongo";
import { setCachedActorImageUrl } from "@lib/clerkActor";

/** POST — update denormalized avatarUrl on all of the signed-in user's posts. */
export async function POST(req) {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const avatarUrl =
      typeof body?.avatarUrl === "string" ? body.avatarUrl.trim() : "";
    if (!avatarUrl || !/^https?:\/\//i.test(avatarUrl)) {
      return NextResponse.json({ error: "Invalid avatarUrl" }, { status: 400 });
    }

    setCachedActorImageUrl(userId, avatarUrl);

    const result = await Posts.updateMany(
      { authorClerkId: userId },
      { $set: { avatarUrl } }
    );

    return NextResponse.json(
      { updated: result.modifiedCount ?? 0 },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/posts/sync-avatar", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
