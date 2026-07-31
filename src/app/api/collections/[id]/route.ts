import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connection from "@lib/mongo";
import {
  PhotoCollections,
  allocateCollectionSlug,
  canViewerSeeCollection,
  isValidVisibility,
  serializeCollection,
} from "@lib/photoCollections";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await connection();
    const { id } = await params;
    const { userId: viewerClerkId } = await auth();

    const doc = await PhotoCollections.findById(id).lean();
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }

    const allowed = await canViewerSeeCollection(
      doc as Record<string, unknown>,
      viewerClerkId
    );
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      collection: serializeCollection(doc, { includeItems: true }),
    });
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await connection();
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const doc = await PhotoCollections.findById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }
    if (doc.ownerClerkId !== userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    if (typeof body.name === "string") {
      const name = body.name.trim().slice(0, 80);
      if (!name) {
        return NextResponse.json(
          { success: false, message: "Name is required" },
          { status: 400 }
        );
      }
      doc.name = name;
      doc.slug = await allocateCollectionSlug(userId, name, String(doc._id));
    }
    if (typeof body.description === "string") {
      doc.description = body.description.trim().slice(0, 500);
    }
    if (isValidVisibility(body.visibility)) {
      doc.visibility = body.visibility;
    }
    if (typeof body.coverUrl === "string") {
      doc.coverUrl = body.coverUrl.trim();
    }
    if (Array.isArray(body.items)) {
      const next = [];
      const seen = new Set();
      for (const raw of body.items) {
        const url = typeof raw?.url === "string" ? raw.url.trim() : "";
        if (!url || seen.has(url)) continue;
        seen.add(url);
        next.push({
          url,
          sourceId:
            typeof raw.sourceId === "string"
              ? raw.sourceId
              : typeof raw.id === "string"
                ? raw.id
                : undefined,
          postId: typeof raw.postId === "string" ? raw.postId : undefined,
          aspectRatio:
            typeof raw.aspectRatio === "number" && raw.aspectRatio > 0
              ? raw.aspectRatio
              : undefined,
          addedAt: new Date(),
        });
      }
      doc.items = next;
      if (!doc.coverUrl && next[0]?.url) {
        doc.coverUrl = next[0].url;
      }
    }

    if (!doc.slug) {
      doc.slug = await allocateCollectionSlug(
        userId,
        doc.name,
        String(doc._id)
      );
    }

    await doc.save();

    return NextResponse.json({
      success: true,
      collection: serializeCollection(doc, { includeItems: true }),
    });
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    await connection();
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const doc = await PhotoCollections.findById(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }
    if (doc.ownerClerkId !== userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    await doc.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
