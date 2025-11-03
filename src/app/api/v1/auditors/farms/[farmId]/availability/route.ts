import { NextRequest, NextResponse } from "next/server";
import { auditorController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

/**
 * GET /api/v1/auditors/farms/[farmId]/availability
 * ตรวจสอบว่า rubber farm สามารถใช้งานได้หรือไม่
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
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

  return auditorController.checkFarmAvailability(req, { params });
}
