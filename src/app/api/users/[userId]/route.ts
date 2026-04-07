import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const client = await clerkClient();
    const u = await client.users.getUser(userId);

    const bio =
      typeof u.publicMetadata?.bio === "string"
        ? u.publicMetadata.bio.trim()
        : "";

    const coverRaw = u.publicMetadata?.coverImageUrl;
    const coverImageUrl =
      typeof coverRaw === "string" && coverRaw.trim() ? coverRaw.trim() : null;

    return NextResponse.json(
      {
        id: u.id,
        username: u.username ?? null,
        fullName:
          u.fullName ||
          [u.firstName, u.lastName].filter(Boolean).join(" ") ||
          u.username ||
          "User",
        imageUrl: u.imageUrl,
        bio: bio || null,
        coverImageUrl,
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    const notFound =
      e &&
      typeof e === "object" &&
      "status" in e &&
      (e as { status?: number }).status === 404;
    if (notFound) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("GET /api/users/[userId]", e);
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}
