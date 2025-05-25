import { NextRequest, NextResponse } from "next/server";
import { auditorController } from "@/utils/dependencyInjections";

/**
 * GET /api/v1/auditors/available-farms
 * ดึงรายการ rubber farm ที่พร้อมใช้งาน (ไม่มี inspection รอการตรวจประเมิน)
 */
export async function GET(req: NextRequest) {
  return auditorController.getAvailableFarms(req);
}
