import { NextResponse } from "next/server";
import Posts from "@lib/models/posts";
import connection from "../../../lib/mongo";


export async function GET(req) {
  try {
    await connection();

    const { searchParams } = new URL(req.url);
    const authorClerkId = searchParams.get("authorClerkId");
    const tag = searchParams.get("tag");
    const visibility = searchParams.get("visibility");
    const clerkId = searchParams.get("clerkId");

    // Pagination
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {}; // start empty
    if (authorClerkId) filter.authorClerkId = authorClerkId;
    if (tag) filter.tags = { $in: [tag] };
    if (visibility) filter.visibility = visibility;

    // Fetch posts
    const results = await Posts.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Optionally filter media by clerkId
    if (clerkId) {
      results.forEach(post => {
        post.media = post.media.filter(m => m.clerkId === clerkId);
      });
    }

    const total = await Posts.countDocuments(filter);

    return NextResponse.json({ results, page, limit, total }, { status: 200 });
  } catch (err) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connection();

    const body = await req.json();
    
    const {
      authorClerkId,
      username,
      avatarUrl,
      title,
      body: postBody,
      media = [],
      tags = [],
      visibility,
      pinned,
      status,
    } = body;

    // Basic validations
    if (!authorClerkId) {
      return NextResponse.json(
        { error: "authorClerkId required" },
        { status: 400 }
      );
    }

    if (!postBody) {
      return NextResponse.json(
        { error: "body required" },
        { status: 400 }
      );
    }

    // Attach clerkId to media
    const mediaWithClerkId = media.map((url) => ({
      url,
      clerkId: authorClerkId,
    }));

    const newPost = await Posts.create({
      authorClerkId,
      username,
      avatarUrl,
      title,
      body: postBody,
      media: mediaWithClerkId,
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