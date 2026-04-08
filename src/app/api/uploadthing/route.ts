import { createRouteHandler } from "uploadthing/next";
import { ensureUploadThingTokenInEnv } from "@/lib/uploadthingEnv";

import { ourFileRouter } from "./core";

ensureUploadThingTokenInEnv();

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
