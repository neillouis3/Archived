/**
 * Uploads files via POST /api/upload-files (Route Handler).
 * Avoids calling a "use server" action from the client, which requires an RSC
 * response — HTML/JSON error pages surface as "An unexpected response was received from the server."
 */
export async function uploadFiles(formData: FormData): Promise<string[]> {
  const res = await fetch("/api/upload-files", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = (await res.json().catch(() => null)) as
    | { urls?: string[]; error?: string }
    | null;

  if (!res.ok) {
    const msg =
      (data && typeof data.error === "string" && data.error) ||
      `Upload failed (${res.status})`;
    throw new Error(msg);
  }

  if (!data || !Array.isArray(data.urls)) {
    throw new Error("Invalid upload response");
  }

  return data.urls;
}
