import { checkAuthorization } from "@/lib/session";
import { CertificateExportService } from "@/services/export/CertificateExportService";
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
    const service = new CertificateExportService();
    const result = await service.exportCertificates();
    if (result.type === "csv") {
        const encoded = encodeURIComponent(result.filename);
        return new NextResponse(result.stream as any, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${encoded}"`,
            },
        });
    }
    // XLSX
    const buffer = await result.workbook.xlsx.writeBuffer();
    const encoded = encodeURIComponent(result.filename);
    return new NextResponse(buffer, {
        headers: {
            "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${encoded}"`,
        },
    });
}