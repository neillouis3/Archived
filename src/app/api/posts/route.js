import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Posts from "@lib/models/posts";
import PostLikes from "@lib/models/postLikes";
import PostSaves from "@lib/models/postSaves";
import connection from "../../../lib/mongo";
import { embedEngagementInPosts } from "@lib/postEngagementBatch";
import { enrichPostsAuthorAvatars } from "@lib/clerkActor";
import {
  buildPostsListFilter,
  filterPostsVisibleToViewer,
  getAcceptedFriendClerkIdsSet,
} from "@lib/socialQueries";
import { parsePostAspectRatio } from "@lib/postAspectRatio";

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
    const suggestedParam =
      searchParams.get("suggested") === "true" ||
      searchParams.get("feed") === "suggested";
    const clerkId = searchParams.get("clerkId");
    const rawSearch =
      searchParams.get("search") || searchParams.get("q") || "";
    const search = rawSearch.trim();
    const sinceDaysRaw = parseInt(searchParams.get("sinceDays") || "", 10);
    const sinceDays =
      Number.isFinite(sinceDaysRaw) && sinceDaysRaw > 0
        ? Math.min(sinceDaysRaw, 90)
        : 0;

    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;
    const skipTotal =
      searchParams.get("skipTotal") === "1" ||
      searchParams.get("skipTotal") === "true";

    const engagementRaw = searchParams.get("engagement");
    const engagementType =
      engagementRaw === "saved" || engagementRaw === "liked" ? engagementRaw : null;
    const skipEngagement =
      searchParams.get("skipEngagement") === "1" ||
      searchParams.get("skipEngagement") === "true" ||
      engagementRaw === "0";

    if (engagementType) {
      if (!viewerClerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const Model = engagementType === "saved" ? PostSaves : PostLikes;
      const fetchRows = Math.min(Math.max(limit * 20, limit), 500);
      const rows = await Model.find({ clerkId: viewerClerkId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(fetchRows)
        .select("postId")
        .lean();

      if (rows.length === 0) {
        return NextResponse.json(
          { results: [], page, limit, total: skipTotal ? -1 : 0 },
          { status: 200 }
        );
      }

      const uniqueIds = [...new Set(rows.map((r) => r.postId).filter(Boolean))];
      const [postsRaw, friendSet] = await Promise.all([
        Posts.find({ _id: { $in: uniqueIds } }).lean(),
        getAcceptedFriendClerkIdsSet(viewerClerkId),
      ]);
      const visiblePosts = filterPostsVisibleToViewer(
        postsRaw,
        viewerClerkId,
        friendSet
      );
      const visibleById = new Map(
        visiblePosts.map((p) => [String(p._id), p])
      );

      const ordered = [];
      const seen = new Set();
      for (const row of rows) {
        const id = String(row.postId);
        if (seen.has(id)) continue;
        const p = visibleById.get(id);
        if (!p) continue;
        seen.add(id);
        ordered.push(p);
        if (ordered.length >= limit) break;
      }

      const jobs = [enrichPostsAuthorAvatars(ordered)];
      if (!skipEngagement) jobs.push(embedEngagementInPosts(ordered, viewerClerkId));
      await Promise.all(jobs);
      return NextResponse.json(
        { results: ordered, page, limit, total: skipTotal ? -1 : ordered.length },
        { status: 200 }
      );
    }

    let baseFilter;
    try {
      baseFilter = await buildPostsListFilter({
        authorClerkId,
        followingFeed: followingParam,
        suggestedFeed: suggestedParam,
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
    if (sinceDays > 0) {
      const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
      parts.push({ createdAt: { $gte: since } });
    }
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

    const jobs = [enrichPostsAuthorAvatars(results)];
    if (!skipEngagement) jobs.push(embedEngagementInPosts(results, viewerClerkId));
    await Promise.all(jobs);

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
      aspectRatio: rawAspectRatio,
      hideLikeCount: rawHideLikeCount,
      commentsDisabled: rawCommentsDisabled,
      altText: rawAltText,
      pinned,
      status,
    } = body;

    if (!authorClerkId || authorClerkId !== userId) {
      return NextResponse.json(
        { error: "authorClerkId must match signed-in user" },
        { status: 403 }
      );
    }

    const bodyText = typeof postBody === "string" ? postBody.trim() : "";

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

    const normalizedUsername =
      typeof username === "string" ? username.replace(/^@+/, "").trim() : username;

    const createPayload = {
      authorClerkId,
      fullName,
      username: normalizedUsername,
      avatarUrl,
      body: bodyText,
      location,
      media: mediaWithClerkId,
      tags,
      visibility,
      hideLikeCount: Boolean(rawHideLikeCount),
      commentsDisabled: Boolean(rawCommentsDisabled),
      pinned,
      status,
    };
    const aspectRatio = parsePostAspectRatio(rawAspectRatio);
    if (aspectRatio != null) {
      createPayload.aspectRatio = aspectRatio;
    }
    if (typeof title === "string" && title.trim()) {
      createPayload.title = title.trim();
    }
    if (typeof rawAltText === "string" && rawAltText.trim()) {
      createPayload.altText = rawAltText.trim();
    }

    const newPost = await Posts.create(createPayload);

    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
