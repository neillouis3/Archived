import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connection from "../../../../../lib/mongo";
import { getPostIfVisible } from "@lib/postAccess";
import PostSaves from "@lib/models/postSaves";

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
    const existing = await PostSaves.findOne({ postId: postOid, clerkId: userId });

    if (existing) {
      await PostSaves.deleteOne({ _id: existing._id });
      return NextResponse.json({ saved: false }, { status: 200 });
    }

    await PostSaves.create({ postId: postOid, clerkId: userId });
    return NextResponse.json({ saved: true }, { status: 200 });
  } catch (err) {
    console.error("POST save", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
