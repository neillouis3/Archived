import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Posts from "@lib/models/posts";
import connection from "../../../../lib/mongo";
import { getPostIfVisible } from "@lib/postAccess";
import { embedEngagementInPosts } from "@lib/postEngagementBatch";

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

    await embedEngagementInPosts([post], viewerClerkId);
    return NextResponse.json(post, { status: 200 });
  } catch (err) {
    console.error("GET /api/posts/[id] error:", err);
    return NextResponse.json({ error: "Failed to load post" }, { status: 500 });
  }
}

export async function DELETE(_req, context) {
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

    const post = await Posts.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (post.authorClerkId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Posts.deleteOne({ _id: id });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/posts/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

export async function PATCH(req, context) {
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

    const post = await Posts.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (post.authorClerkId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, body: postBody, visibility: rawVisibility, location: rawLocation } = body;

    const $set = {};
    const $unset = {};
    if (title !== undefined) {
      $set.title = typeof title === "string" ? title.trim() : "";
    }
    if (postBody !== undefined) {
      if (typeof postBody !== "string" || !postBody.trim()) {
        return NextResponse.json({ error: "body must be a non-empty string" }, { status: 400 });
      }
      $set.body = postBody.trim();
    }
    if (rawVisibility !== undefined) {
      const allowedVis = ["public", "friends", "private"];
      if (!allowedVis.includes(rawVisibility)) {
        return NextResponse.json({ error: "Invalid visibility" }, { status: 400 });
      }
      $set.visibility = rawVisibility;
    }
    if (rawLocation !== undefined) {
      const loc = typeof rawLocation === "string" ? rawLocation.trim() : "";
      if (loc) $set.location = loc;
      else $unset.location = "";
    }

    const mongoOp = {};
    if (Object.keys($set).length) mongoOp.$set = $set;
    if (Object.keys($unset).length) mongoOp.$unset = $unset;

    if (Object.keys(mongoOp).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await Posts.findByIdAndUpdate(id, mongoOp, { new: true }).lean();
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/posts/[id] error:", err);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
