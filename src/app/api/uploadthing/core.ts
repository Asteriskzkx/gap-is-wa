import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/session";
import { fileService } from "@/utils/dependencyInjections";
import { FileModel } from "@/models/FileModel";

const f = createUploadthing();

// UploadThing router for direct client uploads. Clients using @uploadthing/react
// should call the `files` key and pass `{ tableReference, idReference }` as
// the input. onUploadComplete will persist metadata to our File table.
export const ourFileRouter = {
  files: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    image: { maxFileSize: "16MB", maxFileCount: 5 },
    // Don't use a wildcard key; declare the presets you need. If you need
    // other types, add them above.
  })
    .input(
      z.object({ tableReference: z.string().min(1), idReference: z.number() })
    )
    .middleware(async ({ input }) => {
      const session = await getSessionFromRequest();
      if (!session?.user) {
        throw new UploadThingError("Unauthorized");
      }

      // Attach minimal metadata for onUploadComplete
      return {
        tableReference: input.tableReference,
        idReference: input.idReference,
        uploaderId: session.user.id,
        uploaderRole: session.user.role,
      } as const;
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const url = (file as any).ufsUrl || (file as any).url || null;
        if (!url) {
          console.warn("UploadThing file missing URL", file);
          return { success: false } as const;
        }

        const filename = (file as any).name || (file as any).filename || "file";
        const mimeType =
          (file as any).mimeType || (file as any).type || undefined;
        const size = (file as any).size || undefined;

        const model = FileModel.createFile(
          metadata.tableReference,
          metadata.idReference,
          filename,
          url,
          mimeType,
          size
        );

        try {
          await fileService.createFile(model);
        } catch (err) {
          console.error(
            "Failed to persist file metadata from UploadThing:",
            err
          );
        }

        return { success: true } as const;
      } catch (err) {
        console.error("onUploadComplete error:", err);
        return { success: false } as const;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
