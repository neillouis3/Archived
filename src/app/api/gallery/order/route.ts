import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connection from "@lib/mongo";
import GalleryLayouts from "@lib/models/galleryLayouts";

/** Get the viewer's custom gallery photo order. */
export async function GET() {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const doc = await GalleryLayouts.findOne({ ownerClerkId: userId }).lean();
    return NextResponse.json({
      success: true,
      orderedIds: Array.isArray(doc?.orderedIds) ? doc.orderedIds : [],
    });
  } catch (error) {
    console.error("GET /api/gallery/order:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

/** Replace the viewer's gallery photo order. Body: { orderedIds: string[] } */
export async function PUT(req: Request) {
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
    const raw = Array.isArray(body.orderedIds) ? body.orderedIds : [];
    const seen = new Set<string>();
    const orderedIds: string[] = [];
    for (const id of raw) {
      if (typeof id !== "string") continue;
      const trimmed = id.trim();
      if (!trimmed || seen.has(trimmed)) continue;
      seen.add(trimmed);
      orderedIds.push(trimmed);
      if (orderedIds.length >= 500) break;
    }

    await GalleryLayouts.findOneAndUpdate(
      { ownerClerkId: userId },
      { $set: { orderedIds } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, orderedIds });
  } catch (error) {
    console.error("PUT /api/gallery/order:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
