import { InspectionsExportService } from "@/services/export/InspectionsExportService";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export async function GET() {
  const service = new InspectionsExportService();
  const result = await service.exportInspections();
    if (result.type === "csv") {
    return new NextResponse(result.stream as any, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  }
    // XLSX
    const buffer = await result.workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
        headers: {
            "Content-Type":
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${result.filename}"`,
        },
    });
}
