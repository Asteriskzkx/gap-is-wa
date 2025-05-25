import { NextRequest, NextResponse } from "next/server";
import { auditorController } from "@/utils/dependencyInjections";

/**
 * GET /api/v1/auditors/farms/[farmId]/availability
 * ตรวจสอบว่า rubber farm สามารถใช้งานได้หรือไม่
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { farmId: string } }
) {
  return auditorController.checkFarmAvailability(req, { params });
}
