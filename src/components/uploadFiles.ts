"use server";

import { getUtapi } from "../../server/uploadthing";

export async function uploadFiles(formData: FormData) {
  // Filter only File instances
  const files = formData.getAll("files").filter(
    (f): f is File => f instanceof File
  );

  // Get UTApi instance (lazy initialization)
  const utapi = getUtapi();

  // Upload the files
  const response = await utapi.uploadFiles(files); // UploadedFileResult[]

  const list = Array.isArray(response) ? response : [response];
  const urls: string[] = [];
  for (const r of list) {
    if (r && r.error === null && r.data && typeof r.data.url === "string") {
      urls.push(r.data.url);
    }
  }

  return urls;
}
