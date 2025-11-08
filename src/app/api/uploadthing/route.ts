// This route used to proxy UploadThing direct upload handlers. The project
// now centralizes file handling under `/api/v1/files`. To avoid accidental
// usage of the legacy UploadThing route, we return a 410 Gone with an
// instruction for clients to use the server-side files endpoint.

import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
