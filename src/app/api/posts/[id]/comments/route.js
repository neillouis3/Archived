import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connection from "../../../../../lib/mongo";
import { getPostIfVisible } from "@lib/postAccess";
import PostComments from "@lib/models/postComments";
import { createNotification } from "@lib/createNotification";
import { getActorFields } from "@lib/clerkActor";

const MAX_BODY = 2000;

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
    const rows = await PostComments.find({ postId: postOid })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      comments: rows.map((c) => ({
        _id: c._id,
        authorClerkId: c.authorClerkId,
        fullName: c.fullName,
        username: c.username,
        avatarUrl: c.avatarUrl,
        body: c.body,
        createdAt: c.createdAt,
      })),
    });
  } catch (err) {
    console.error("GET comments", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req, context) {
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

    const body = await req.json();
    const text =
      typeof body.body === "string" ? body.body.trim().slice(0, MAX_BODY) : "";
    if (!text) {
      return NextResponse.json({ error: "body required" }, { status: 400 });
    }

    const client = await clerkClient();
    const u = await client.users.getUser(userId);
    const fullName =
      u.fullName ||
      [u.firstName, u.lastName].filter(Boolean).join(" ") ||
      u.username ||
      "User";
    const username = u.username
      ? `@${String(u.username).replace(/^@+/, "")}`
      : "";

    const postOid = new mongoose.Types.ObjectId(id);
    const doc = await PostComments.create({
      postId: postOid,
      authorClerkId: userId,
      fullName,
      username,
      avatarUrl: u.imageUrl,
      body: text,
    });

    const actor = await getActorFields(userId);
    const snippet = text.length > 120 ? `${text.slice(0, 117)}…` : text;
    await createNotification({
      recipientClerkId: post.authorClerkId,
      type: "comment",
      actorClerkId: userId,
      actorFullName: actor.actorFullName,
      actorUsername: actor.actorUsername,
      actorImageUrl: actor.actorImageUrl,
      postId: postOid,
      commentId: doc._id,
      snippet,
    });

    return NextResponse.json(
      {
        comment: {
          _id: doc._id,
          authorClerkId: doc.authorClerkId,
          fullName: doc.fullName,
          username: doc.username,
          avatarUrl: doc.avatarUrl,
          body: doc.body,
          createdAt: doc.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST comments", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
