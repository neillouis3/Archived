// app/api/media/route.js
import { NextResponse } from "next/server";
import Media from "@lib/models/media";
import connection from "../../../lib/mongo";


export async function GET(req) {
    try {
      await connection();
  
      // parse query params
      const { searchParams } = new URL(req.url);
      const postId = searchParams.get("postId");
      const clerkId = searchParams.get("clerkId");
  
      // build filter
      const filter = {};
      if (postId) filter.postId = postId;
      if (clerkId) filter.clerkId = clerkId;
  
      // query DB
      const media = await Media.find(filter).lean();
  
      return NextResponse.json(media, { status: 200 });
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: "Failed to fetch media" },
        { status: 500 }
      );
    }
  }
  
export async function POST(req) {
    try {
        await connection()
        const {clerkId, postId, url} = await request.json()
        const newMedia = new Media({clerkId, postId, url})
        await newMedia.save()
        return NextResponse.json(newMedia, {status:201})
    } catch(err) {
        console.log(err)
    }
}