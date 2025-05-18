import { NextRequest, NextResponse } from "next/server";
import { inspectionController } from "@/utils/dependencyInjections";

// Route handler สำหรับลบผู้ตรวจสอบออกจากการตรวจ
export async function POST(req: NextRequest) {
  return inspectionController.removeAuditorFromInspection(req);
}
