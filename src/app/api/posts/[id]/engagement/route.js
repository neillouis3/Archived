import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connection from "../../../../../lib/mongo";
import { getPostIfVisible } from "@lib/postAccess";
import PostLikes from "@lib/models/postLikes";
import PostSaves from "@lib/models/postSaves";
import PostComments from "@lib/models/postComments";

export async function GET(_req, context) {
  try {
    await connection();
    const { userId: viewerClerkId } = await auth();
    const params = await context.params;
    const id = params.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const post = await getPostIfVisible(id, viewerClerkId);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const postOid = new mongoose.Types.ObjectId(id);

    const [likeCount, commentCount, liked, saved, comments] = await Promise.all([
      PostLikes.countDocuments({ postId: postOid }),
      PostComments.countDocuments({ postId: postOid }),
      viewerClerkId
        ? PostLikes.countDocuments({ postId: postOid, clerkId: viewerClerkId })
        : 0,
      viewerClerkId
        ? PostSaves.countDocuments({ postId: postOid, clerkId: viewerClerkId })
        : 0,
      PostComments.find({ postId: postOid })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
    ]);

    return NextResponse.json(
      {
        likeCount,
        commentCount,
        likedByMe: liked > 0,
        savedByMe: saved > 0,
        comments: comments.map((c) => ({
          _id: c._id,
          authorClerkId: c.authorClerkId,
          fullName: c.fullName,
          username: c.username,
          avatarUrl: c.avatarUrl,
          body: c.body,
          createdAt: c.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET engagement", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
