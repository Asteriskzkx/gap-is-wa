import { NextRequest, NextResponse } from "next/server";
import { adviceAndDefectController } from "@/utils/dependencyInjections";

// Route handlers for /api/v1/advice-and-defects
export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // ถ้ามี inspectionId parameter
  if (url.searchParams.has("inspectionId")) {
    return adviceAndDefectController.getAdviceAndDefectByInspectionId(req);
  }

  // ถ้าไม่มี filter ให้ดึงทั้งหมด
  return adviceAndDefectController.getAll(req);
}

export async function POST(req: NextRequest) {
  return adviceAndDefectController.createAdviceAndDefect(req);
}
