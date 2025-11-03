import { NextRequest, NextResponse } from "next/server";
import { auditorController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

/**
 * GET /api/v1/auditors/available-farms
 * ดึงรายการ rubber farm ที่พร้อมใช้งาน (ไม่มี inspection รอการตรวจประเมิน)
 */
export async function GET(req: NextRequest) {
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

  return auditorController.getAvailableFarms(req);
}
