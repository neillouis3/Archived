import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Friendships from "@lib/models/friendships";
import connection from "../../../../../lib/mongo";

export async function GET(_req, context) {
  try {
    await connection();
    const { userId: viewerId } = await auth();
    const params = await context.params;
    const otherId = params.userId;
    if (!otherId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!viewerId) {
      return NextResponse.json({
        isFriend: false,
        outgoingPending: false,
        incomingPending: false,
        blocked: false,
      });
    }

    if (viewerId === otherId) {
      return NextResponse.json({
        isFriend: false,
        outgoingPending: false,
        incomingPending: false,
        blocked: false,
      });
    }

    const doc = await Friendships.findOne({
      $or: [
        { requesterClerkId: viewerId, recipientClerkId: otherId },
        { requesterClerkId: otherId, recipientClerkId: viewerId },
      ],
    }).lean();

    if (!doc) {
      return NextResponse.json({
        isFriend: false,
        outgoingPending: false,
        incomingPending: false,
        blocked: false,
      });
    }

    if (doc.status === "blocked") {
      return NextResponse.json({
        isFriend: false,
        outgoingPending: false,
        incomingPending: false,
        blocked: true,
      });
    }

    if (doc.status === "accepted") {
      return NextResponse.json({
        isFriend: true,
        outgoingPending: false,
        incomingPending: false,
        blocked: false,
      });
    }

    const outgoingPending =
      doc.requesterClerkId === viewerId && doc.status === "pending";
    const incomingPending =
      doc.recipientClerkId === viewerId && doc.status === "pending";

    return NextResponse.json({
      isFriend: false,
      outgoingPending,
      incomingPending,
      blocked: false,
    });
  } catch (err) {
    console.error("GET /api/friends/status error:", err);
    return NextResponse.json({ error: "Failed to load status" }, { status: 500 });
  }
}
