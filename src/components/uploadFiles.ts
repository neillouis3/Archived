"use server";

import { utapi } from "../../server/uploadthing";

export async function uploadFiles(formData: FormData) {
  // Filter only File instances
  const files = formData.getAll("files").filter(
    (f): f is File => f instanceof File
  );

  // Upload the files
  const response = await utapi.uploadFiles(files); // UploadedFileResult[]

  // Extract the new URL field ufsUrl
  const urls = response
    .filter(r => r.error === null) // only successful uploads
    .map(r => r.data.ufsUrl); // use ufsUrl instead of url/appUrl

  return urls; // string[]
}
