import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connection from "@lib/mongo";
import {
  PhotoCollections,
  serializeCollection,
} from "@lib/photoCollections";

type Ctx = { params: Promise<{ id: string }> };

/** Add photos to a collection. */
export async function POST(req: Request, { params }: Ctx) {
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
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (!rawItems.length) {
      return NextResponse.json(
        { success: false, message: "No items to add" },
        { status: 400 }
      );
    }

    const existingUrls = new Set(
      (doc.items || []).map((item: { url?: string }) => String(item.url || ""))
    );
    let added = 0;
    for (const raw of rawItems) {
      const url = typeof raw?.url === "string" ? raw.url.trim() : "";
      if (!url || existingUrls.has(url)) continue;
      existingUrls.add(url);
      doc.items.push({
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
      added += 1;
    }

    if (added > 0) await doc.save();

    return NextResponse.json({
      success: true,
      added,
      collection: serializeCollection(doc, { includeItems: true }),
    });
  } catch (error) {
    console.error("Error adding collection items:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/** Remove photos from a collection. Body: { itemIds: string[] } */
export async function DELETE(req: Request, { params }: Ctx) {
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
    const itemIds = Array.isArray(body.itemIds)
      ? body.itemIds.map(String)
      : [];
    if (!itemIds.length) {
      return NextResponse.json(
        { success: false, message: "No itemIds provided" },
        { status: 400 }
      );
    }

    const remove = new Set(itemIds);
    const before = doc.items.length;
    doc.items = doc.items.filter(
      (item: { _id?: { toString(): string } }) => !remove.has(String(item._id))
    );
    const removed = before - doc.items.length;
    if (removed > 0) await doc.save();

    return NextResponse.json({
      success: true,
      removed,
      collection: serializeCollection(doc, { includeItems: true }),
    });
  } catch (error) {
    console.error("Error removing collection items:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
