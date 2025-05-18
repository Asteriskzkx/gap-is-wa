import { NextRequest, NextResponse } from "next/server";
import { inspectionController } from "@/utils/dependencyInjections";

// Route handlers for /api/v1/inspections/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return inspectionController.getById(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // ตรวจสอบว่าเป็นการอัพเดทสถานะหรือผลการตรวจ
  const path = req.nextUrl.pathname;
  if (path.endsWith("/status")) {
    return inspectionController.updateInspectionStatus(req, { params });
  } else if (path.endsWith("/result")) {
    return inspectionController.updateInspectionResult(req, { params });
  }

  // Default path สำหรับการอัพเดท inspection ทั่วไป
  return inspectionController.update(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return inspectionController.delete(req, { params });
}
