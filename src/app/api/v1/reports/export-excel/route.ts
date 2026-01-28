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

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "user report is allowed for ADMIN only" },
        { status: 403 }
      );
    }

    console.log("Exporting users...");
    const service = new UserExportService();
    const result = await service.exportUsers();
    await appendExportResult(archive, result);
  }

  // ===== INSPECTIONS =====
  if (sections.includes("inspections")) {
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "COMMITTEE") {
      return NextResponse.json(
        { message: "inspection report is allowed for ADMIN and COMMITTEE only" },
        { status: 403 }
      );
    }
    console.log("Exporting inspections...");
    const service = new InspectionsExportService();
    const result = await service.exportInspections();
    await appendExportResult(archive, result);
  }

  // ===== RUBBER FARMS =====
  if (sections.includes("rubberFarms")) {
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "rubber farm report is allowed for ADMIN only" },
        { status: 403 }
      );
    }

    console.log("Exporting rubber farms...");
    const service = new RubberFarmExportService();
    const result = await service.exportRubberFarms();
    await appendExportResult(archive, result);
  }

  // ===== CERTIFICATES =====
  if (sections.includes("certificates")) {

    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "COMMITTEE") {
      return NextResponse.json(
        { message: "certificate report is allowed for ADMIN and COMMITTEE only" },
        { status: 403 }
      );
    }
    console.log("Exporting certificates...");
    const service = new CertificateExportService();
    const result = await service.exportCertificates();
    await appendExportResult(archive, result);
  }

  // ===== AUDITORS =====
  if (sections.includes("auditors")) {
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "auditor report is allowed for ADMIN only" },
        { status: 403 }
      );
    }
    console.log("Exporting auditors...");
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

  if (sections.includes("specificAuditorPerformance")) {
    // 🔒 allow AUDITOR only
    if (session?.user?.role !== "AUDITOR") {
      return NextResponse.json(
        { message: "specific auditor performance report is allowed for AUDITOR only" },
        { status: 403 }
      );
    }
    const auditorId = session.user.roleData?.auditorId;
    if (!auditorId) {
      return NextResponse.json(
        { message: "auditorId not found in session" },
        { status: 400 }
      );
    }

    const { SpecificAuditorPerformanceExportService } = await import(
      "@/services/export/SpecificAuditorPerformanceExportService"
    );
    const service = new SpecificAuditorPerformanceExportService();
    const result = await service.exportSpecificAuditorPerformance(auditorId, session.user.name || "");
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
