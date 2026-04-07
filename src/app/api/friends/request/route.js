import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Friendships from "@lib/models/friendships";
import connection from "../../../../lib/mongo";
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
    const recipientClerkId =
      typeof body.recipientClerkId === "string"
        ? body.recipientClerkId.trim()
        : "";
    if (!recipientClerkId) {
      return NextResponse.json(
        { error: "recipientClerkId required" },
        { status: 400 }
      );
    }
    if (recipientClerkId === userId) {
      return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
    }

    const reverse = await Friendships.findOne({
      requesterClerkId: recipientClerkId,
      recipientClerkId: userId,
      status: "pending",
    });

    if (reverse) {
      reverse.status = "accepted";
      await reverse.save();
      const actor = await getActorFields(userId);
      await createNotification({
        recipientClerkId: reverse.requesterClerkId,
        type: "friend_accepted",
        actorClerkId: userId,
        actorFullName: actor.actorFullName,
        actorUsername: actor.actorUsername,
        actorImageUrl: actor.actorImageUrl,
      });
      return NextResponse.json({ ok: true, status: "accepted" }, { status: 200 });
    }

    const r = await Friendships.updateOne(
      { requesterClerkId: userId, recipientClerkId },
      {
        $setOnInsert: {
          requesterClerkId: userId,
          recipientClerkId,
          status: "pending",
        },
      },
      { upsert: true }
    );

    if (r.upsertedCount) {
      const actor = await getActorFields(userId);
      await createNotification({
        recipientClerkId,
        type: "friend_request",
        actorClerkId: userId,
        actorFullName: actor.actorFullName,
        actorUsername: actor.actorUsername,
        actorImageUrl: actor.actorImageUrl,
      });
    }

    return NextResponse.json({ ok: true, status: "pending" }, { status: 201 });
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: "Request already exists" }, { status: 409 });
    }
    console.error("POST /api/friends/request error:", err);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
