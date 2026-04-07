import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connection from "../../../../../lib/mongo";
import { getPostIfVisible } from "@lib/postAccess";
import PostLikes from "@lib/models/postLikes";
import { createNotification } from "@lib/createNotification";
import { getActorFields } from "@lib/clerkActor";

export async function POST(_req, context) {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const id = params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const post = await getPostIfVisible(id, userId);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const postOid = new mongoose.Types.ObjectId(id);
    const existing = await PostLikes.findOne({ postId: postOid, clerkId: userId });

    if (existing) {
      await PostLikes.deleteOne({ _id: existing._id });
      const likeCount = await PostLikes.countDocuments({ postId: postOid });
      return NextResponse.json({ liked: false, likeCount }, { status: 200 });
    }

    await PostLikes.create({ postId: postOid, clerkId: userId });
    const likeCount = await PostLikes.countDocuments({ postId: postOid });

    const actor = await getActorFields(userId);
    await createNotification({
      recipientClerkId: post.authorClerkId,
      type: "like",
      actorClerkId: userId,
      actorFullName: actor.actorFullName,
      actorUsername: actor.actorUsername,
      actorImageUrl: actor.actorImageUrl,
      postId: postOid,
    });

    return NextResponse.json({ liked: true, likeCount }, { status: 200 });
  } catch (err) {
    console.error("POST like", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
