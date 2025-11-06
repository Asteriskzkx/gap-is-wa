import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/session";
import { certificateService } from "@/utils/dependencyInjections";

const f = createUploadthing();

// Define a FileRouter for certificate PDFs
export const ourFileRouter = {
  // UploadThing types only accept certain preset sizes; 10MB isn't in the allowed literal union.
  // Use 16MB (closest larger preset) to allow uploads up to 10MB safely.
  certificate: f({ pdf: { maxFileSize: "16MB", maxFileCount: 1 } }) // accept pdf files up to ~16MB
    .input(z.object({ inspectionId: z.number() }))
    .middleware(async ({ input }) => {
      // authorize COMMITTEE or ADMIN
      const session = await getSessionFromRequest();
      if (!session || !session.user) {
        throw new UploadThingError("Unauthorized");
      }

      if (!["COMMITTEE", "ADMIN"].includes(session.user.role)) {
        throw new UploadThingError("Forbidden");
      }

      // Return metadata that will be available in onUploadComplete
      return {
        inspectionId: input.inspectionId,
        committeeId:
          session.user.role === "COMMITTEE"
            ? session.user.roleData?.committeeId || session.user.roleData?.id
            : undefined,
      } as const;
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // file.ufsUrl is provided by UploadThing per docs
        const pdfFileUrl = (file as any).ufsUrl || (file as any).url;

        await certificateService.uploadCertificate({
          inspectionId: metadata.inspectionId,
          pdfFileUrl,
          committeeId: (metadata as any).committeeId,
        });
      } catch (error) {
        console.error("Failed to persist certificate after upload:", error);
      }

      // You can return data to the client if needed
      return { success: true } as const;
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
