import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUtapi } from "../../../../server/uploadthing";

/**
 * Next.js / Undici can supply Blob-like parts that don't pass `instanceof File`
 * (different realm or polyfill). UTApi still accepts real File instances.
 */
function filesFromFormData(formData: FormData): File[] {
  const out: File[] = [];
  for (const entry of formData.getAll("files")) {
    if (typeof entry === "string") continue;
    if (!(entry instanceof Blob)) continue;
    if (entry instanceof File) {
      out.push(entry);
      continue;
    }
    const plainBlob = entry as Blob;
    out.push(
      new File([plainBlob], "upload", {
        type: plainBlob.type || "image/jpeg",
      })
    );
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = filesFromFormData(formData);

    if (files.length === 0) {
      return NextResponse.json({ urls: [] as string[] });
    }

    const utapi = getUtapi();
    const response = await utapi.uploadFiles(files);
    const list = Array.isArray(response) ? response : [response];
    const urls: string[] = [];
    const failures: string[] = [];
    for (const r of list) {
      if (r && r.error != null) {
        const msg =
          typeof r.error === "object" && r.error !== null && "message" in r.error
            ? String((r.error as { message: unknown }).message)
            : String(r.error);
        if (msg) failures.push(msg);
        continue;
      }
      if (r && r.data) {
        const u = r.data.ufsUrl ?? r.data.url ?? r.data.appUrl;
        if (typeof u === "string" && u.trim()) urls.push(u.trim());
      }
    }

    if (urls.length === 0) {
      console.error("POST /api/upload-files: no URLs from UploadThing", { failures });
      return NextResponse.json(
        {
          error:
            failures.join("; ") ||
            "Upload finished but no file URLs were returned. Check UPLOADTHING_SECRET and dashboard app ID.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ urls });
  } catch (err: unknown) {
    console.error("POST /api/upload-files error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
