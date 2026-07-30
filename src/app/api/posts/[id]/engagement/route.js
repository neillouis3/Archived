import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connection from "../../../../../lib/mongo";
import { getPostIfVisible } from "@lib/postAccess";
import PostLikes from "@lib/models/postLikes";
import PostSaves from "@lib/models/postSaves";
import PostComments from "@lib/models/postComments";
import { setCachedActorImageUrl } from "@lib/clerkActor";

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

    const [likeCount, commentCount, liked, saved, comments, recentLikeDocs] =
      await Promise.all([
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
        PostLikes.find({ postId: postOid })
          .sort({ createdAt: -1 })
          .limit(3)
          .select("clerkId")
          .lean(),
      ]);

    /** @type {{ clerkId: string, username: string, imageUrl: string }[]} */
    let recentLikers = [];
    const likerIds = recentLikeDocs.map((d) => d.clerkId).filter(Boolean);
    if (likerIds.length > 0) {
      try {
        const client = await clerkClient();
        const res = await client.users.getUserList({
          userId: likerIds,
          limit: likerIds.length,
        });
        const byId = new Map(res.data.map((u) => [u.id, u]));
        recentLikers = likerIds.map((clerkId) => {
          const u = byId.get(clerkId);
          if (u?.imageUrl) setCachedActorImageUrl(clerkId, u.imageUrl);
          return {
            clerkId,
            username: (u?.username || u?.firstName || "user").replace(/^@+/, ""),
            imageUrl: u?.imageUrl || `https://i.pravatar.cc/150?u=${clerkId}`,
          };
        });
      } catch {
        recentLikers = likerIds.map((clerkId) => ({
          clerkId,
          username: "user",
          imageUrl: `https://i.pravatar.cc/150?u=${clerkId}`,
        }));
      }
    }

    return NextResponse.json(
      {
        likeCount,
        commentCount,
        likedByMe: liked > 0,
        savedByMe: saved > 0,
        recentLikers,
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
