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
      // parse + validate
      const parsed = await this.parseRequestForFiles(req);

      // role policy per tableReference
      const allowedRoles = this.getAllowedRolesForTable(parsed.tableReference);
      const { authorized, error } = await checkAuthorization(req, allowedRoles);
      if (!authorized)
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );

      const { uploadBufferToUploadThing } = await import(
        "@/lib/uploadthingServer"
      );
      const createdFiles: any[] = [];

      for (const f of parsed.files) {
        const uploaded = await uploadBufferToUploadThing(
          f.buffer,
          f.filename,
          f.mimeType
        );
        if (!uploaded?.url) {
          console.error("Failed to upload file to UploadThing for", f.filename);
          continue;
        }

        const model = FileModel.createFile(
          parsed.tableReference,
          parsed.idReference,
          f.filename,
          uploaded.url,
          f.mimeType,
          f.buffer.length,
          uploaded.fileKey ?? undefined
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

      // authorization based on table
      const allowedRoles = this.getAllowedRolesForTable(tableReference);
      const { authorized, error } = await checkAuthorization(req, allowedRoles);
      if (!authorized)
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
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

  // Delete a file by its fileId. Returns deleted record (if existed) and boolean success
  async deleteFileById(
    fileId: number,
    req?: Request | NextRequest
  ): Promise<NextResponse> {
    try {
      const existing = await this.fileService.getById(fileId);
      if (!existing)
        return NextResponse.json(
          { message: "File not found" },
          { status: 404 }
        );

      // Authorization based on the table this file belongs to
      const allowedRoles = this.getAllowedRolesForTable(
        existing.tableReference
      );
      const { authorized, error } = await checkAuthorization(
        req as NextRequest,
        allowedRoles
      );
      if (!authorized)
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );

      let remoteDeleted = false;
      try {
        if (existing.fileKey) {
          try {
            // Prefer calling UTApi.deleteFiles directly with the key.
            const { UTApi } = await import("uploadthing/server");
            const utapi: any = new UTApi();
            if (typeof utapi.deleteFiles === "function") {
              const resp = await utapi.deleteFiles([existing.fileKey]);
              remoteDeleted = !!(resp && resp.success);
            } else if (typeof utapi.delete === "function") {
              // Some SDKs may expose a different method name.
              await utapi.delete(existing.fileKey);
              remoteDeleted = true;
            } else {
              // If no delete method available on this SDK, fall through to URL helper.
              remoteDeleted = false;
            }
          } catch (err) {
            console.warn(
              "delete by fileKey failed, will try URL-based delete",
              err
            );
            // fallback to url-based deletion below
            remoteDeleted = false;
          }
        }

        if (!remoteDeleted) {
          const { deleteUploadThingFile } = await import(
            "@/lib/uploadthingServer"
          );
          if (existing.url) {
            remoteDeleted = await deleteUploadThingFile(existing.url);
          }
        }
      } catch (err) {
        console.error("Error while attempting remote deletion:", err);
        remoteDeleted = false;
      }

      const ok = await this.fileService.delete(fileId);
      return NextResponse.json({ deleted: ok, file: existing, remoteDeleted });
    } catch (err: any) {
      console.error("FileController.deleteFileById error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  // ---------------- helpers ----------------
  private getAllowedRolesForTable(tableReference: string) {
    const policy: Record<string, string[]> = {
      Certificate: ["COMMITTEE", "ADMIN"],
      Inspection: ["AUDITOR", "COMMITTEE", "ADMIN"],
      RubberFarm: ["FARMER", "ADMIN"],
      DataRecord: ["AUDITOR", "ADMIN"],
    };

    return (
      policy[tableReference] ?? [
        "BASIC",
        "FARMER",
        "AUDITOR",
        "COMMITTEE",
        "ADMIN",
      ]
    );
  }

  private async parseRequestForFiles(req: NextRequest): Promise<{
    tableReference: string;
    idReference: number;
    files: { buffer: Buffer; filename: string; mimeType: string }[];
  }> {
    // try formData first
    const fromForm = await this.parseFormData(req);
    let tableReference = fromForm.tableReference;
    let idReference = fromForm.idReference;
    const files = fromForm.files || [];

    // if no files found, fallback to busboy
    if (!files.length) {
      const fromBusboy = await this.parseWithBusboy(req);
      tableReference = tableReference || fromBusboy.tableReference;
      idReference = idReference ?? fromBusboy.idReference;
      files.push(...fromBusboy.files);
    }

    if (!tableReference) throw new Error("tableReference is required");
    if (idReference === undefined || idReference === null)
      throw new Error("idReference is required");

    const finalId = idReference;
    return { tableReference, idReference: finalId, files };
  }

  private async parseFormData(req: NextRequest): Promise<{
    tableReference?: string;
    idReference?: number;
    files?: { buffer: Buffer; filename: string; mimeType: string }[];
  }> {
    if (typeof (req as any).formData !== "function") return {};
    const formData = await (req as any).formData();
    const tableVal = formData.get("tableReference");
    const idVal = formData.get("idReference");
    const tableReference =
      tableVal !== null && tableVal !== undefined
        ? String(tableVal)
        : undefined;
    const idReference =
      idVal !== null && idVal !== undefined ? Number(String(idVal)) : undefined;

    const files: { buffer: Buffer; filename: string; mimeType: string }[] = [];
    const pushFile = async (f: any) => {
      if (f && typeof f.arrayBuffer === "function") {
        const ab = await f.arrayBuffer();
        files.push({
          buffer: Buffer.from(ab),
          filename: f.name || "file",
          mimeType: f.type || "application/octet-stream",
        });
      }
    };

    // Support multiple conventions used by clients:
    // - multiple files under the same key "file" (formData.getAll('file'))
    // - files under the key "files" (formData.getAll('files'))
    // - single file under "file" (formData.get('file'))
    const allFileInputs = formData.getAll("file") as any[];
    if (allFileInputs && Array.isArray(allFileInputs) && allFileInputs.length) {
      for (const f of allFileInputs) await pushFile(f);
    }

    const all = formData.getAll("files") as any[];
    if (all && Array.isArray(all) && all.length) {
      for (const f of all) await pushFile(f);
    }

    // Backwards-compatible single file check (if no getAll was used)
    if (!files.length) {
      const single = formData.get("file");
      if (single) await pushFile(single);
    }

    return { tableReference, idReference, files };
  }

  private async parseWithBusboy(req: NextRequest): Promise<{
    tableReference?: string;
    idReference?: number;
    files: { buffer: Buffer; filename: string; mimeType: string }[];
  }> {
    const files: { buffer: Buffer; filename: string; mimeType: string }[] = [];
    const Busboy: any = (await import("busboy")).default;
    const contentType = req.headers.get("content-type") || "";
    const headers: any = { "content-type": contentType };
    const bb = new Busboy({ headers });

    let tableReference: string | undefined;
    let idReference: number | undefined;

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
          if (fileChunks.length) {
            files.push({
              buffer: Buffer.concat(fileChunks),
              filename,
              mimeType,
            });
          }
        });
      });

      bb.on("field", (name: string, val: string) => {
        if (name === "tableReference") {
          tableReference = val;
        }
        if (name === "idReference") {
          idReference = Number(val);
        }
      });

      bb.on("error", (err: any) => reject(err));
      bb.on("finish", () => resolve());
      stream.pipe(bb);
    });

    return { tableReference, idReference, files };
  }
}
