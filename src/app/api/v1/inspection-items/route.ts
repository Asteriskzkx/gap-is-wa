import { NextRequest, NextResponse } from "next/server";
import { inspectionItemController } from "@/utils/dependencyInjections";

// Route handlers for /api/v1/inspection-items
export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // ถ้ามี inspectionId parameter
  if (url.searchParams.has("inspectionId")) {
    return inspectionItemController.getInspectionItemsByInspectionId(req);
  }

  // ถ้าไม่มี filter ให้ดึงทั้งหมด
  return inspectionItemController.getAll(req);
}

export async function POST(req: NextRequest) {
  return inspectionItemController.createInspectionItem(req);
}
