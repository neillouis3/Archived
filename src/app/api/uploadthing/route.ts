import { createRouteHandler } from "uploadthing/next";
import { ensureUploadThingSecretInEnv } from "@/lib/uploadthingEnv";

import { ourFileRouter } from "./core";

ensureUploadThingSecretInEnv();

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
