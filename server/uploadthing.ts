import { UTApi } from "uploadthing/server";
import { assertUploadThingTokenConfigured } from "../src/lib/uploadthingEnv";

let utapiInstance: UTApi | null = null;

export function getUtapi() {
  if (!utapiInstance) {
    assertUploadThingTokenConfigured();
    utapiInstance = new UTApi();
  }
  return utapiInstance;
}
