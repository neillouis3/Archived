import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Posts from "@lib/models/posts";
import connection from "../../../../lib/mongo";


export async function GET(
  req: Request,
  { params }: { params: { authorClerkId: string } }
) {
  try {
    await connection();

    const { authorClerkId } = params;

    // Find all posts by this author, only selecting the media field
    const posts = await Posts.find({ authorClerkId }).select("media");

    // Flatten all media arrays and extract the URLs
    const mediaUrls = posts.flatMap((post: any) =>
      (post.media || []).map((m:any) => m.url)
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
