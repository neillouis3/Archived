import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connection from "@lib/mongo";
import { areMutualFollows } from "@lib/socialQueries";
import {
  PhotoCollections,
  allocateCollectionSlug,
  buildCollectionsVisibilityFilter,
  isValidVisibility,
  serializeCollection,
  slugifyCollectionName,
} from "@lib/photoCollections";

/** List collections for a user, or create a collection. */
export async function GET(req: Request) {
  try {
    await connection();
    const { userId: viewerClerkId } = await auth();
    const { searchParams } = new URL(req.url);
    const ownerClerkId =
      searchParams.get("ownerClerkId") ||
      searchParams.get("userId") ||
      viewerClerkId;
    const slug = searchParams.get("slug")?.trim().toLowerCase() || "";

    if (!ownerClerkId) {
      return NextResponse.json(
        { success: false, message: "ownerClerkId required" },
        { status: 400 }
      );
    }

    const friend =
      viewerClerkId && viewerClerkId !== ownerClerkId
        ? await areMutualFollows(viewerClerkId, ownerClerkId)
        : false;

    const filter = buildCollectionsVisibilityFilter(
      viewerClerkId ?? null,
      ownerClerkId,
      friend
    );

    if (slug) {
      type LeanCollection = {
        _id: unknown;
        name?: string;
        slug?: string;
        [key: string]: unknown;
      };

      let doc =
        (await PhotoCollections.findOne({
          ...filter,
          slug,
        }).lean()) as LeanCollection | null;

      if (!doc) {
        const rows = (await PhotoCollections.find(filter).lean()) as LeanCollection[];
        doc =
          rows.find((row) => {
            const rowSlug =
              (typeof row.slug === "string" && row.slug.trim()) ||
              slugifyCollectionName(row.name);
            return rowSlug === slug;
          }) || null;
      }
      if (!doc) {
        return NextResponse.json(
          { success: false, message: "Not found" },
          { status: 404 }
        );
      }
      // Persist slug for older docs that never had one
      if (!doc.slug) {
        const nextSlug = await allocateCollectionSlug(
          ownerClerkId,
          String(doc.name || ""),
          String(doc._id)
        );
        await PhotoCollections.updateOne(
          { _id: doc._id },
          { $set: { slug: nextSlug } }
        );
        doc = { ...doc, slug: nextSlug };
      }
      return NextResponse.json({
        success: true,
        collection: serializeCollection(doc, { includeItems: true }),
      });
    }

    const rows = await PhotoCollections.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      collections: rows.map((row) => serializeCollection(row)),
    });
  } catch (error) {
    console.error("Error listing collections:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    const description =
      typeof body.description === "string"
        ? body.description.trim().slice(0, 500)
        : "";
    const visibility = isValidVisibility(body.visibility)
      ? body.visibility
      : "public";

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = [];
    const seen = new Set();
    for (const raw of rawItems) {
      const url = typeof raw?.url === "string" ? raw.url.trim() : "";
      if (!url || seen.has(url)) continue;
      seen.add(url);
      items.push({
        url,
        sourceId:
          typeof raw.sourceId === "string" ? raw.sourceId : undefined,
        postId: typeof raw.postId === "string" ? raw.postId : undefined,
        aspectRatio:
          typeof raw.aspectRatio === "number" && raw.aspectRatio > 0
            ? raw.aspectRatio
            : undefined,
        addedAt: new Date(),
      });
    }

    const slug = await allocateCollectionSlug(userId, name);

    const doc = await PhotoCollections.create({
      ownerClerkId: userId,
      name,
      slug,
      description,
      visibility,
      coverUrl:
        typeof body.coverUrl === "string" ? body.coverUrl.trim() : "",
      items,
    });

    return NextResponse.json({
      success: true,
      collection: serializeCollection(doc, { includeItems: true }),
    });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
