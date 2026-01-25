import archiver from "archiver";
import { ExportResult } from "./types";
import { Readable } from "stream";

export async function appendExportResult(
  archive: archiver.Archiver,
  result: ExportResult
) {
  if (result.type === "csv") {
    const nodeStream =
      result.stream instanceof Readable
        ? result.stream
        : Readable.fromWeb(result.stream as any);

    archive.append(nodeStream, { name: result.filename });
    return;
  }

  const buffer = await result.workbook.xlsx.writeBuffer();
  archive.append(Buffer.from(buffer), { name: result.filename });
}
