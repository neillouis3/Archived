import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Posts from "@lib/models/posts";
import GalleryLayouts from "@lib/models/galleryLayouts";
import connection from "../../../../lib/mongo";
import { buildAuthorPostsFilter, areMutualFollows } from "@lib/socialQueries";

const VIS = ["public", "friends", "private"] as const;

function applyGalleryOrder<T extends { id: string }>(
  items: T[],
  orderedIds: string[]
): T[] {
  if (!orderedIds.length || !items.length) return items;
  const byId = new Map(items.map((item) => [item.id, item]));
  const used = new Set<string>();
  const next: T[] = [];
  for (const id of orderedIds) {
    const item = byId.get(id);
    if (!item || used.has(id)) continue;
    next.push(item);
    used.add(id);
  }
  for (const item of items) {
    if (used.has(item.id)) continue;
    next.push(item);
  }
  return next;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ authorClerkId: string }> }
) {
  try {
    await connection();

    const { authorClerkId } = await params;
    const { userId: viewerClerkId } = await auth();
    const { searchParams } = new URL(req.url);
    const collection = searchParams.get("collection");
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "60", 10) || 60, 1),
      120
    );

    const friend =
      viewerClerkId && viewerClerkId !== authorClerkId
        ? await areMutualFollows(viewerClerkId, authorClerkId)
        : false;

    let filter: Record<string, unknown> = buildAuthorPostsFilter(
      viewerClerkId ?? null,
      authorClerkId,
      friend
    );

    if (
      viewerClerkId === authorClerkId &&
      collection &&
      (VIS as readonly string[]).includes(collection)
    ) {
      filter = { ...filter, visibility: collection };
    }

    const posts = await Posts.find(filter)
      .select("media createdAt aspectRatio")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Newest posts first; within each post, media left→right.
    let items: {
      id: string;
      url: string;
      postId: string;
      aspectRatio: number | null;
    }[] = [];
    for (const post of posts) {
      const postId = String(post._id);
      const rawAr = (post as { aspectRatio?: unknown }).aspectRatio;
      const aspectRatio =
        typeof rawAr === "number" && rawAr > 0 ? rawAr : null;
      const media = (post as { media?: { url?: string }[] }).media || [];
      media.forEach((m, i) => {
        const url = typeof m?.url === "string" ? m.url.trim() : "";
        if (!url) return;
        items.push({
          id: `${postId}-${i}`,
          url,
          postId,
          aspectRatio,
        });
      });
    }

    // Apply owner's saved gallery order when present.
    const layout = await GalleryLayouts.findOne({
      ownerClerkId: authorClerkId,
    })
      .select("orderedIds")
      .lean();
    const orderedIds = Array.isArray(
      (layout as { orderedIds?: string[] } | null)?.orderedIds
    )
      ? ((layout as { orderedIds: string[] }).orderedIds)
      : [];
    items = applyGalleryOrder(items, orderedIds);

    const mediaUrls = items.map((item) => item.url);

    return NextResponse.json({ success: true, items, mediaUrls });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
