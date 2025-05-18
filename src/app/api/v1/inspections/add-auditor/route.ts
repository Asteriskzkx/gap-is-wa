import { NextRequest, NextResponse } from "next/server";
import { inspectionController } from "@/utils/dependencyInjections";

// Route handler สำหรับเพิ่มผู้ตรวจสอบในการตรวจ
export async function POST(req: NextRequest) {
  return inspectionController.addAuditorToInspection(req);
}
