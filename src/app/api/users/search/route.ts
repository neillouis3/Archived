import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (q.length < 2) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 25);

    const client = await clerkClient();
    const { data } = await client.users.getUserList({
      query: q,
      limit,
    });

    const users = data
      .filter((u) => u.id !== userId)
      .map((u) => ({
        id: u.id,
        username: u.username ?? null,
        fullName:
          u.fullName ||
          [u.firstName, u.lastName].filter(Boolean).join(" ") ||
          u.username ||
          "User",
        imageUrl: u.imageUrl,
      }));

    return NextResponse.json({ users }, { status: 200 });
  } catch (e) {
    console.error("GET /api/users/search", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
