/**
 * UploadThing reads `UPLOADTHING_SECRET` (must start with `sk_test_` or `sk_live_`).
 * The dashboard sometimes shows a base64 `UPLOADTHING_TOKEN` instead — decode it here.
 */
export function resolveUploadThingSecret(): string | undefined {
  const secret = process.env.UPLOADTHING_SECRET?.trim();
  if (secret?.startsWith("sk_")) return secret;

  const token = process.env.UPLOADTHING_TOKEN?.trim();
  if (token?.startsWith("sk_")) return token;

  if (token) {
    try {
      const json = JSON.parse(Buffer.from(token, "base64").toString("utf8")) as {
        apiKey?: string;
      };
      if (typeof json.apiKey === "string" && json.apiKey.startsWith("sk_")) {
        return json.apiKey;
      }
    } catch {
      /* not a base64 JSON token */
    }
  }

  return undefined;
}

/** Sets `process.env.UPLOADTHING_SECRET` so UploadThing route + UTApi see a valid key. */
export function ensureUploadThingSecretInEnv(): void {
  const key = resolveUploadThingSecret();
  if (key) process.env.UPLOADTHING_SECRET = key;
}
