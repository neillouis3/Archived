import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Friendships from "@lib/models/friendships";
import connection from "../../../../lib/mongo";
import { createNotification } from "@lib/createNotification";
import { getActorFields } from "@lib/clerkActor";

export async function PATCH(req) {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const requesterClerkId =
      typeof body.requesterClerkId === "string"
        ? body.requesterClerkId.trim()
        : "";
    const accept = Boolean(body.accept);

    if (!requesterClerkId) {
      return NextResponse.json(
        { error: "requesterClerkId required" },
        { status: 400 }
      );
    }

    const doc = await Friendships.findOne({
      requesterClerkId,
      recipientClerkId: userId,
      status: "pending",
    });

    if (!doc) {
      return NextResponse.json({ error: "No pending request" }, { status: 404 });
    }

    if (accept) {
      doc.status = "accepted";
      await doc.save();
      const actor = await getActorFields(userId);
      await createNotification({
        recipientClerkId: requesterClerkId,
        type: "friend_accepted",
        actorClerkId: userId,
        actorFullName: actor.actorFullName,
        actorUsername: actor.actorUsername,
        actorImageUrl: actor.actorImageUrl,
      });
      return NextResponse.json({ ok: true, status: "accepted" }, { status: 200 });
    }

    await Friendships.deleteOne({ _id: doc._id });
    return NextResponse.json({ ok: true, status: "declined" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/friends/respond error:", err);
    return NextResponse.json({ error: "Failed to respond" }, { status: 500 });
  }
}
