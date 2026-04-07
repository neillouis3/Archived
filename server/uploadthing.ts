import { UTApi } from "uploadthing/server";
import { ensureUploadThingSecretInEnv } from "../src/lib/uploadthingEnv";

let utapiInstance: UTApi | null = null;

export function getUtapi() {
  if (!utapiInstance) {
    ensureUploadThingSecretInEnv();
    const apiKey = process.env.UPLOADTHING_SECRET?.trim();
    if (!apiKey?.startsWith("sk_")) {
      throw new Error(
        "UploadThing: set UPLOADTHING_SECRET to your API key (starts with sk_live_ or sk_test_). " +
          "Or set UPLOADTHING_TOKEN to the base64 blob from the dashboard — it will be decoded automatically."
      );
    }
    utapiInstance = new UTApi({ apiKey });
  }
  return utapiInstance;
}
