import { checkAuthorization } from "@/lib/session";
import { InspectionsExportService } from "@/services/export/InspectionsExportService";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 },
    );
  }
  const service = new InspectionsExportService();
  const result = await service.exportInspections();
  const encoded = encodeURIComponent(result.filename);
  if (result.type === "csv") {
    return new NextResponse(result.stream as any, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${encoded}"`,
      },
    });
  }
  // XLSX
  const buffer = await result.workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encoded}"`,
    },
  });
}
