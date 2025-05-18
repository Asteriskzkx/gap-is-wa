import { NextRequest, NextResponse } from "next/server";
import { dataRecordController } from "@/utils/dependencyInjections";

// Route handlers for /api/v1/data-records
export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // ถ้ามี inspectionId parameter
  if (url.searchParams.has("inspectionId")) {
    return dataRecordController.getDataRecordByInspectionId(req);
  }

  // ถ้าไม่มี filter ให้ดึงทั้งหมด
  return dataRecordController.getAll(req);
}

export async function POST(req: NextRequest) {
  return dataRecordController.createDataRecord(req);
}
