import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

function trimStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * POST /api/profile/banner
 * - Saves coverImageUrl + coverImageKey in Clerk publicMetadata
 * - Deletes previous banner from UploadThing when replacing
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as { url?: string; key?: string | null };
    const url = trimStr(body.url);
    const key = typeof body.key === "string" ? body.key.trim() : body.key ?? null;
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const client = await clerkClient();
    const existing = await client.users.getUser(userId);
    const prev = { ...(existing.publicMetadata as Record<string, unknown>) };
    const prevKey = typeof prev.coverImageKey === "string" ? prev.coverImageKey : null;

    const publicMetadata: Record<string, unknown> = {
      ...prev,
      coverImageUrl: url,
    };
    if (key) {
      publicMetadata.coverImageKey = key;
    } else {
      delete publicMetadata.coverImageKey;
    }
    await client.users.updateUserMetadata(userId, { publicMetadata });

    if (key && prevKey && prevKey !== key) {
      const utapi = new UTApi();
      await utapi.deleteFiles(prevKey);
    }

    return NextResponse.json({ success: true, coverImageUrl: url }, { status: 200 });
  } catch (e) {
    console.error("POST /api/profile/banner", e);
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

/**
 * DELETE /api/profile/banner
 * - Removes coverImageUrl + coverImageKey from Clerk publicMetadata
 * - Deletes existing banner file from UploadThing
 */
export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clerkClient();
    const existing = await client.users.getUser(userId);
    const prev = { ...(existing.publicMetadata as Record<string, unknown>) };
    const prevKey = typeof prev.coverImageKey === "string" ? prev.coverImageKey : null;

    delete prev.coverImageUrl;
    delete prev.coverImageKey;

    await client.users.updateUserMetadata(userId, { publicMetadata: prev });

    if (prevKey) {
      const utapi = new UTApi();
      await utapi.deleteFiles(prevKey);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("DELETE /api/profile/banner", e);
    return NextResponse.json({ error: "Failed to remove banner" }, { status: 500 });
  }
}

