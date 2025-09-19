// app/api/posts/route.js
import { NextResponse } from "next/server";
import Posts from "@lib/models/posts"; // adjust if your model path/name differs
import connection from "../../../lib/mongo";

export async function GET(req) {
  try {
    await connection();

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("id"); // single post by id
    const authorClerkId = searchParams.get("authorClerkId");
    const tag = searchParams.get("tag"); // filter by a single tag
    const visibility = searchParams.get("visibility");
    const populateMedia = searchParams.get("populate") === "true";

    // pagination
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;

    // build filter
    const filter = { deleted: false };
    if (postId) filter._id = postId;
    if (authorClerkId) filter.authorClerkId = authorClerkId;
    if (tag) filter.tags = tag;
    if (visibility) filter.visibility = visibility;

    let query = Posts.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

    if (populateMedia) {
      query = query.populate("media");
    }

    const results = await query.lean();

    return NextResponse.json(
      { results, page, limit },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connection();

    const body = await req.json();
    const {
      authorClerkId,
      title,
      body: postBody,
      media = [], // expect array of media ObjectId strings (optional)
      tags = [],
      visibility = "public",
      pinned = false,
      status = "active",
    } = body;

    // basic validation
    if (!authorClerkId) {
      return NextResponse.json({ error: "authorClerkId is required" }, { status: 400 });
    }
    if (!postBody || typeof postBody !== "string") {
      return NextResponse.json({ error: "body is required and must be a string" }, { status: 400 });
    }

    const newPost = await Posts.create({
      authorClerkId,
      title,
      body: postBody,
      media,
      tags,
      visibility,
      pinned,
      status,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
