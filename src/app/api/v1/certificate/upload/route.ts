import { checkAuthorization } from "@/lib/session";
import { certificateService } from "@/utils/dependencyInjections";
import { NextResponse } from "next/server";

// Use supported runtime for Next.js server-side Node APIs in App Router
export const runtime = "nodejs"; // supported value: 'nodejs'

// POST /api/v1/certificate/upload
export async function POST(req: Request) {
  try {
    // Authorize first
    const { authorized, session, error } = await checkAuthorization(
      req as any,
      ["COMMITTEE", "ADMIN"]
    );

    if (!authorized) {
      return NextResponse.json(
        { message: error || "Unauthorized" },
        { status: 401 }
      );
    }

    // Try Web standard formData() first (supported in Next.js 'nodejs' runtime)
    let filename = "file";
    let mimeType = "application/pdf";
    let inspectionId: number | undefined;
    let fileBuffer: Buffer | undefined;

    if (typeof (req as any).formData === "function") {
      const formData = await (req as any).formData();
      const inspectionVal = formData.get("inspectionId");
      if (inspectionVal != null) {
        inspectionId = Number(String(inspectionVal));
      }

      const fileField = formData.get("file") as any;
      if (fileField && typeof fileField.arrayBuffer === "function") {
        const ab = await fileField.arrayBuffer();
        fileBuffer = Buffer.from(ab);
        filename = fileField.name || filename;
        mimeType = fileField.type || mimeType;
      }
    }

    // Fallback to busboy if formData isn't available or file wasn't parsed
    if (!fileBuffer) {
      const Busboy: any = (await import("busboy")).default;

      const contentType = req.headers.get("content-type") || "";
      const headers: any = { "content-type": contentType };

      const bb = new Busboy({ headers });

      const chunks: Buffer[] = [];

      const bodyBuffer = Buffer.from(await req.arrayBuffer());
      const { Readable } = await import("node:stream");
      const stream = Readable.from(bodyBuffer);

      await new Promise<void>((resolve, reject) => {
        bb.on("file", (_name: string, file: any, info: any) => {
          filename = info.filename || filename;
          mimeType = info.mimeType || mimeType;
          file.on("data", (data: Buffer) => chunks.push(data));
          file.on("end", () => {});
        });

        bb.on("field", (name: string, val: string) => {
          if (name === "inspectionId") inspectionId = Number(val);
        });

        bb.on("error", (err: any) => reject(err));
        bb.on("finish", () => resolve());

        stream.pipe(bb);
      });

      if (chunks.length) fileBuffer = Buffer.concat(chunks);
    }

    if (!inspectionId) {
      return NextResponse.json(
        { message: "inspectionId is required" },
        { status: 400 }
      );
    }

    if (!fileBuffer) {
      return NextResponse.json(
        { message: "File not provided or could not be parsed" },
        { status: 400 }
      );
    }

    // Upload to UploadThing using server helper
    const { uploadBufferToUploadThing } = await import(
      "@/lib/uploadthingServer"
    );

    const uploadedUrl = await uploadBufferToUploadThing(
      fileBuffer,
      filename,
      mimeType
    );

    if (!uploadedUrl) {
      return NextResponse.json(
        { message: "Failed to upload file to UploadThing" },
        { status: 500 }
      );
    }

    // If session role is COMMITTEE, try to find committeeId
    let committeeId: number | undefined;
    if (session && session.user && session.user.role === "COMMITTEE") {
      committeeId =
        session.user.roleData?.committeeId || session.user.roleData?.id;
    }

    const created = await certificateService.uploadCertificate({
      inspectionId: inspectionId,
      pdfFileUrl: uploadedUrl,
      committeeId,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("Certificate upload error:", err);
    return NextResponse.json(
      { message: err?.message || "Internal server error", stack: err?.stack },
      { status: 500 }
    );
  }
}
