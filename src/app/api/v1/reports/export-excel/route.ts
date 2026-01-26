import { NextRequest, NextResponse } from "next/server";
import { checkAuthorization } from "@/lib/session";
import archiver from "archiver";
import { UserExportService } from "@/services/export/UserExportService";
import { InspectionsExportService } from "@/services/export/InspectionsExportService";
import { RubberFarmExportService } from "@/services/export/RubberFarmExportService";
import { CertificateExportService } from "@/services/export/CertificateExportService";
import { AuditorPerformanceExportService } from "@/services/export/AuditorPerformanceExportService";
import { appendExportResult } from "@/lib/export/appendExportResult";
import { PassThrough } from "stream";


export const runtime = "nodejs";


export async function POST(req: NextRequest) {
  const { authorized, error, session } = await checkAuthorization(req, ["ADMIN","AUDITOR","COMMITTEE"]);
  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 },
    );
  }
  let committeeId: number | undefined;


  /**
   * body example:
   * {
   *   users: true,
   *   inspections: false,
   *   rubberFarms: true,
   *   certificates: false,
   *   auditors: true
   * }
   */
  const body = await req.json();
  const sections: string[] = body.sections ?? [];

  if (sections.length === 0) {
    return NextResponse.json(
      { message: "No report selected" },
      { status: 400 },
    );
  }

  if (session?.user?.role === "COMMITTEE") {
    committeeId = session.user.roleData?.committeeId;
  }

  if (!committeeId && body.committeeId) {
    committeeId = body.committeeId; // ADMIN / AUDITOR
  }

  if (sections.includes("committeePerformances") && !committeeId) {
    return NextResponse.json(
      { message: "committeeId is required" },
      { status: 400 }
    );
  }

  // === ZIP STREAM ===
  const archive = archiver("zip", { zlib: { level: 9 } });

  const passThrough = new PassThrough();
  archive.pipe(passThrough); // ⭐ จุดสำคัญที่สุด

  // ===== USERS =====
  if (sections.includes("users")) {
    const service = new UserExportService();
    const result = await service.exportUsers();
    await appendExportResult(archive, result);
  }

  // ===== INSPECTIONS =====
  if (sections.includes("inspections")) {
    const service = new InspectionsExportService();
    const result = await service.exportInspections();
    await appendExportResult(archive, result);
  }

  // ===== RUBBER FARMS =====
  if (sections.includes("rubberFarms")) {
    const service = new RubberFarmExportService();
    const result = await service.exportRubberFarms();
    await appendExportResult(archive, result);
  }

  // ===== CERTIFICATES =====
  if (sections.includes("certificates")) {
    const service = new CertificateExportService();
    const result = await service.exportCertificates();
    await appendExportResult(archive, result);
  }

  // ===== AUDITORS =====
  if (sections.includes("auditors")) {
    const service = new AuditorPerformanceExportService();
    const result = await service.exportAuditorPerformances();
    await appendExportResult(archive, result);
  }

  // ===== COMMITTEE PERFORMANCES =====
  if (sections.includes("committeePerformances")) {
    // 🔒 allow COMMITTEE only
    if (session?.user?.role !== "COMMITTEE") {
      return NextResponse.json(
        { message: "committee performance report is allowed for COMMITTEE only" },
        { status: 403 }
      );
    }

    const committeeId = session.user.roleData?.committeeId;
    if (!committeeId) {
      return NextResponse.json(
        { message: "committeeId not found in session" },
        { status: 400 }
      );
    }

    const { CommitteePerformanceExportService } = await import(
      "@/services/export/CommitteePerformanceExportService"
    );

    const service = new CommitteePerformanceExportService();
    const result = await service.exportCommitteePerformances(committeeId, session.user.name || "");
    await appendExportResult(archive, result);
  }


  await archive.finalize();

  return new NextResponse(passThrough as any, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename*=UTF-8''export-excel.zip",
    },
  });
}
