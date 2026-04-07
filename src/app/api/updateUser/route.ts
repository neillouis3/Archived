import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { SocialMediaFields } from "@/lib/socialLinks";

function trimStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      birthday?: string | null;
      bio?: string;
      website?: string;
      location?: string;
      schoolOrWork?: string;
      socialMedia?: Partial<SocialMediaFields>;
      /** Profile banner URL, or `null` / `""` to remove */
      coverImageUrl?: string | null;
    };

    const { birthday, bio, website, location, schoolOrWork, socialMedia, coverImageUrl } =
      body;

    const client = await clerkClient();
    const existing = await client.users.getUser(userId);
    const prev = { ...(existing.publicMetadata as Record<string, unknown>) };

    const publicMetadata: Record<string, unknown> = {
      ...prev,
      bio: trimStr(bio),
      website: trimStr(website),
      location: trimStr(location),
      schoolOrWork: trimStr(schoolOrWork),
    };

    if (Object.prototype.hasOwnProperty.call(body, "socialMedia") && socialMedia) {
      publicMetadata.socialMedia = {
        twitter: trimStr(socialMedia.twitter),
        instagram: trimStr(socialMedia.instagram),
        linkedin: trimStr(socialMedia.linkedin),
        github: trimStr(socialMedia.github),
        tiktok: trimStr(socialMedia.tiktok),
        youtube: trimStr(socialMedia.youtube),
      } satisfies SocialMediaFields;
    }
    if (Object.prototype.hasOwnProperty.call(body, "birthday")) {
      publicMetadata.birthday = birthday;
    }

    if (Object.prototype.hasOwnProperty.call(body, "coverImageUrl")) {
      if (coverImageUrl === null || coverImageUrl === "") {
        delete publicMetadata.coverImageUrl;
      } else {
        publicMetadata.coverImageUrl = trimStr(coverImageUrl);
      }
    }

    await client.users.updateUserMetadata(userId, { publicMetadata });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
