import { NextRequest, NextResponse } from "next/server";
import { checkAuthorization } from "@/lib/session";
import { FileService } from "@/services/FileService";
import { FileModel } from "@/models/FileModel";

export class FileController {
  private readonly fileService: FileService;

  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  async uploadFiles(req: NextRequest): Promise<NextResponse> {
    try {
      const allowedRoles = ["BASIC", "FARMER", "AUDITOR", "COMMITTEE", "ADMIN"];
      const { authorized, error } = await checkAuthorization(req, allowedRoles);
      if (!authorized)
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );

      let tableReference = "";
      let idReference: number | undefined;
      const files: { buffer: Buffer; filename: string; mimeType: string }[] =
        [];

      if (typeof (req as any).formData === "function") {
        const formData = await (req as any).formData();
        const tableVal = formData.get("tableReference");
        if (tableVal != null) tableReference = String(tableVal);
        const idVal = formData.get("idReference");
        if (idVal != null) idReference = Number(String(idVal));

        const fileField = formData.get("file") as any;
        if (fileField && typeof fileField.arrayBuffer === "function") {
          const ab = await fileField.arrayBuffer();
          files.push({
            buffer: Buffer.from(ab),
            filename: fileField.name || "file",
            mimeType: fileField.type || "application/octet-stream",
          });
        }

        const allFiles = formData.getAll("files") as any[];
        if (allFiles && Array.isArray(allFiles) && allFiles.length) {
          for (const f of allFiles) {
            if (f && typeof f.arrayBuffer === "function") {
              const ab = await f.arrayBuffer();
              files.push({
                buffer: Buffer.from(ab),
                filename: f.name || "file",
                mimeType: f.type || "application/octet-stream",
              });
            }
          }
        }
      }

      // Fallback parsing if needed
      if (!files.length) {
        const Busboy: any = (await import("busboy")).default;
        const contentType = req.headers.get("content-type") || "";
        const headers: any = { "content-type": contentType };
        const bb = new Busboy({ headers });

        const bodyBuffer = Buffer.from(await req.arrayBuffer());
        const { Readable } = await import("node:stream");
        const stream = Readable.from(bodyBuffer);

        await new Promise<void>((resolve, reject) => {
          bb.on("file", (_name: string, file: any, info: any) => {
            const filename = info.filename;
            const mimeType = info.mimeType || "application/octet-stream";
            const fileChunks: Buffer[] = [];
            file.on("data", (d: Buffer) => fileChunks.push(d));
            file.on("end", () => {
              if (fileChunks.length)
                files.push({
                  buffer: Buffer.concat(fileChunks),
                  filename,
                  mimeType,
                });
            });
          });

          bb.on("field", (name: string, val: string) => {
            if (name === "tableReference") tableReference = val;
            if (name === "idReference") idReference = Number(val);
          });

          bb.on("error", (err: any) => reject(err));
          bb.on("finish", () => resolve());
          stream.pipe(bb);
        });
      }

      if (!tableReference)
        return NextResponse.json(
          { message: "tableReference is required" },
          { status: 400 }
        );
      if (!idReference && idReference !== 0)
        return NextResponse.json(
          { message: "idReference is required" },
          { status: 400 }
        );
      if (!files.length)
        return NextResponse.json(
          { message: "No files uploaded" },
          { status: 400 }
        );

      const { uploadBufferToUploadThing } = await import(
        "@/lib/uploadthingServer"
      );
      const createdFiles: any[] = [];

      for (const f of files) {
        const uploadedUrl = await uploadBufferToUploadThing(
          f.buffer,
          f.filename,
          f.mimeType
        );
        if (!uploadedUrl) {
          console.error("Failed to upload file to UploadThing for", f.filename);
          continue;
        }

        const model = FileModel.createFile(
          tableReference,
          idReference!,
          f.filename,
          uploadedUrl,
          f.mimeType,
          f.buffer.length
        );
        const created = await this.fileService.createFile(model);
        createdFiles.push(created);
      }

      return NextResponse.json({ created: createdFiles }, { status: 201 });
    } catch (err: any) {
      console.error("FileController.uploadFiles error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  async getFiles(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const tableReference =
        url.searchParams.get("tableReference") || undefined;
      const idReferenceStr = url.searchParams.get("idReference") || undefined;

      if (!tableReference || !idReferenceStr)
        return NextResponse.json(
          { message: "tableReference and idReference are required" },
          { status: 400 }
        );
      const idReference = Number(idReferenceStr);
      if (Number.isNaN(idReference))
        return NextResponse.json(
          { message: "idReference must be a number" },
          { status: 400 }
        );

      const files = await this.fileService.findByReference(
        tableReference,
        idReference
      );
      return NextResponse.json({ files });
    } catch (err: any) {
      console.error("FileController.getFiles error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }
}
