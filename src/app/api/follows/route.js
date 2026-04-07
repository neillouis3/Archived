import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Follows from "@lib/models/follows";
import connection from "../../../lib/mongo";
import { createNotification } from "@lib/createNotification";
import { getActorFields } from "@lib/clerkActor";

export async function POST(req) {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const followingClerkId =
      typeof body.followingClerkId === "string"
        ? body.followingClerkId.trim()
        : "";
    if (!followingClerkId) {
      return NextResponse.json(
        { error: "followingClerkId required" },
        { status: 400 }
      );
    }
    if (followingClerkId === userId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    const r = await Follows.updateOne(
      { followerClerkId: userId, followingClerkId },
      { $setOnInsert: { followerClerkId: userId, followingClerkId } },
      { upsert: true }
    );

    if (r.upsertedCount) {
      const actor = await getActorFields(userId);
      await createNotification({
        recipientClerkId: followingClerkId,
        type: "follow",
        actorClerkId: userId,
        actorFullName: actor.actorFullName,
        actorUsername: actor.actorUsername,
        actorImageUrl: actor.actorImageUrl,
      });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("POST /api/follows error:", err);
    return NextResponse.json({ error: "Failed to follow" }, { status: 500 });
  }
}
