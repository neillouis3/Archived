import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Posts from "@lib/models/posts";
import connection from "../../../../lib/mongo";
import { buildAuthorPostsFilter, areFriends } from "@lib/socialQueries";

const VIS = ["public", "friends", "private"] as const;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ authorClerkId: string }> }
) {
  try {
    await connection();

    const { authorClerkId } = await params;
    const { userId: viewerClerkId } = await auth();
    const collection = new URL(req.url).searchParams.get("collection");

    const friend =
      viewerClerkId && viewerClerkId !== authorClerkId
        ? await areFriends(viewerClerkId, authorClerkId)
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

    const posts = await Posts.find(filter).select("media").lean();

    const mediaUrls = posts.flatMap((post) =>
      ((post as { media?: { url: string }[] }).media || []).map((m) => m.url)
    );

    return NextResponse.json({ success: true, mediaUrls });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
