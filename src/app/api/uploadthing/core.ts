import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  postMedia: f({
    image: { maxFileSize: "32MB", maxFileCount: 12 },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      // Include `key` so mobile can reuse this slug for single-image uploads (e.g. banners)
      // and still support server-side deletion.
      return { uploadedBy: metadata.userId, url, key: (file as { key?: string }).key };
    }),
  bannerMedia: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new UploadThingError("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl ?? file.url;
      // file.key exists in UploadThing response (used for deletion)
      return { uploadedBy: metadata.userId, url, key: (file as { key?: string }).key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
