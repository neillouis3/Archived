import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Posts from "@lib/models/posts";
import connection from "../../../lib/mongo";
import { embedEngagementInPosts } from "@lib/postEngagementBatch";
import { buildPostsListFilter } from "@lib/socialQueries";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Non-empty image URLs only; `null` if there is nothing to attach (invalid for new posts). */
function normalizePostMediaForCreate(media, authorClerkId) {
  const raw = Array.isArray(media) ? media : [];
  const urls = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const u = item.trim();
      if (u) urls.push(u);
      continue;
    }
    if (item && typeof item === "object" && typeof item.url === "string") {
      const u = item.url.trim();
      if (u) urls.push(u);
    }
  }
  if (urls.length === 0) return null;
  return urls.map((url) => ({ url, clerkId: authorClerkId }));
}

export async function GET(req) {
  try {
    await connection();

    const { userId: viewerClerkId } = await auth();

    const { searchParams } = new URL(req.url);
    const authorClerkId = searchParams.get("authorClerkId");
    const tag = searchParams.get("tag");
    const collection = searchParams.get("collection");
    const followingParam =
      searchParams.get("following") === "true" ||
      searchParams.get("feed") === "following";
    const clerkId = searchParams.get("clerkId");
    const rawSearch =
      searchParams.get("search") || searchParams.get("q") || "";
    const search = rawSearch.trim();

    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;
    const skipTotal =
      searchParams.get("skipTotal") === "1" ||
      searchParams.get("skipTotal") === "true";

    let baseFilter;
    try {
      baseFilter = await buildPostsListFilter({
        authorClerkId,
        followingFeed: followingParam,
        viewerClerkId,
        collectionVisibility: collection,
      });
    } catch (e) {
      if (e?.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (e?.message === "FORBIDDEN_COLLECTION") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      throw e;
    }

    const parts = [baseFilter];
    if (tag) parts.push({ tags: { $in: [tag] } });
    if (search) {
      const rx = new RegExp(escapeRegex(search), "i");
      parts.push({
        $or: [
          { title: rx },
          { body: rx },
          { username: rx },
          { fullName: rx },
          { tags: rx },
        ],
      });
    }

    const filter = parts.length === 1 ? parts[0] : { $and: parts };

    const query = Posts.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const [results, total] = await Promise.all([
      query,
      skipTotal ? Promise.resolve(-1) : Posts.countDocuments(filter),
    ]);

    if (clerkId) {
      for (const post of results) {
        post.media = post.media.filter((m) => m.clerkId === clerkId);
      }
    }

    await embedEngagementInPosts(results, viewerClerkId);

    return NextResponse.json({ results, page, limit, total }, { status: 200 });
  } catch (err) {
    console.error("GET /api/posts error:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connection();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      authorClerkId,
      fullName,
      username,
      avatarUrl,
      title,
      body: postBody,
      media = [],
      tags = [],
      visibility: rawVisibility,
      location: rawLocation,
      pinned,
      status,
    } = body;

    if (!authorClerkId || authorClerkId !== userId) {
      return NextResponse.json(
        { error: "authorClerkId must match signed-in user" },
        { status: 403 }
      );
    }

    if (!postBody) {
      return NextResponse.json({ error: "body required" }, { status: 400 });
    }

    const allowedVis = ["public", "friends", "private"];
    const visibility = allowedVis.includes(rawVisibility)
      ? rawVisibility
      : "public";

    const mediaWithClerkId = normalizePostMediaForCreate(media, authorClerkId);
    if (!mediaWithClerkId) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    const location =
      typeof rawLocation === "string" && rawLocation.trim() ? rawLocation.trim() : undefined;

    const newPost = await Posts.create({
      authorClerkId,
      fullName,
      username,
      avatarUrl,
      title,
      body: postBody,
      location,
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
