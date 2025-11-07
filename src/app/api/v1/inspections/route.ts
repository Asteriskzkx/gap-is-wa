import { checkAuthorization } from "@/lib/session";
import { inspectionController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

// Route handlers for /api/v1/inspections
export async function GET(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, [
    "AUDITOR",
    "ADMIN",
    "COMMITTEE",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);

  // ถ้ามี filter parameters
  if (url.searchParams.has("rubberFarmId")) {
    return inspectionController.getInspectionsByRubberFarm(req);
  } else if (url.searchParams.has("auditorId")) {
    return inspectionController.getInspectionsByAuditor(req);
  }

  // ถ้าไม่มี filter ให้ดึงทั้งหมด
  return inspectionController.getAll(req);
}

export async function POST(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, [
    "AUDITOR",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  const path = req.nextUrl.pathname;

  if (path.endsWith("/add-auditor")) {
    return inspectionController.addAuditorToInspection(req);
  } else if (path.endsWith("/remove-auditor")) {
    return inspectionController.removeAuditorFromInspection(req);
  }

  // Default path สำหรับการสร้าง inspection ใหม่
  return inspectionController.createInspection(req);
}
