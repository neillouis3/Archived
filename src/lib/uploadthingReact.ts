import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

/**
 * Browser uploads go to UploadThing via `/api/uploadthing` (small JSON + presigned flow),
 * not through a Vercel route that accepts multipart bodies (413 on large images).
 */
export const { useUploadThing, uploadFiles: uploadFilesToUploadThing } =
  generateReactHelpers<OurFileRouter>({
    url: "/api/uploadthing",
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        credentials: "include",
      }),
  });

export function pickUploadThingPublicUrl(
  item:
    | {
        ufsUrl?: string;
        url?: string;
        appUrl?: string;
        key?: string;
        serverData?: unknown;
      }
    | undefined
): string {
  if (!item) return "";
  for (const k of ["ufsUrl", "url", "appUrl"] as const) {
    const v = item[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const sd = item.serverData;
  if (sd && typeof sd === "object" && sd !== null && "url" in sd) {
    const u = (sd as { url?: unknown }).url;
    if (typeof u === "string" && u.trim()) return u.trim();
  }
  if (typeof item.key === "string" && item.key.trim()) {
    return `https://utfs.io/f/${item.key}`;
  }
  return "";
}
