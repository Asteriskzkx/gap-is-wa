import { NextRequest, NextResponse } from "next/server";
import { auditorInspectionController } from "@/utils/dependencyInjections";

// Route handlers for /api/v1/auditor-inspections
export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // ถ้ามี filter parameters
  if (url.searchParams.has("auditorId")) {
    return auditorInspectionController.getAuditorInspectionsByAuditorId(req);
  } else if (url.searchParams.has("inspectionId")) {
    return auditorInspectionController.getAuditorInspectionsByInspectionId(req);
  }

  // ถ้าไม่มี filter ให้ดึงทั้งหมด
  return auditorInspectionController.getAll(req);
}

export async function POST(req: NextRequest) {
  return auditorInspectionController.createAuditorInspection(req);
}
