import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connection from "../../../../../lib/mongo";
import { getPostIfVisible } from "@lib/postAccess";
import PostReposts from "@lib/models/postReposts";
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

    if (post.authorClerkId === userId) {
      return NextResponse.json(
        { error: "Cannot repost your own post" },
        { status: 400 }
      );
    }

    const postOid = new mongoose.Types.ObjectId(id);
    const existing = await PostReposts.findOne({
      postId: postOid,
      clerkId: userId,
    })
      .select("_id")
      .lean();

    if (existing) {
      const [, repostCount] = await Promise.all([
        PostReposts.deleteOne({ _id: existing._id }),
        PostReposts.countDocuments({
          postId: postOid,
          _id: { $ne: existing._id },
        }),
      ]);
      return NextResponse.json(
        { reposted: false, repostCount },
        { status: 200 }
      );
    }

    await PostReposts.create({ postId: postOid, clerkId: userId });
    const repostCount = await PostReposts.countDocuments({ postId: postOid });

    void (async () => {
      try {
        const actor = await getActorFields(userId);
        await createNotification({
          recipientClerkId: post.authorClerkId,
          type: "repost",
          actorClerkId: userId,
          actorFullName: actor.actorFullName,
          actorUsername: actor.actorUsername,
          actorImageUrl: actor.actorImageUrl,
          postId: postOid,
        });
      } catch (err) {
        console.error("POST repost notification", err);
      }
    })();

    return NextResponse.json({ reposted: true, repostCount }, { status: 200 });
  } catch (err) {
    console.error("POST repost", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
