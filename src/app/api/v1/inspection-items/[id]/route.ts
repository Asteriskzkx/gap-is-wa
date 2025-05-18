import { NextRequest, NextResponse } from "next/server";
import { inspectionItemController } from "@/utils/dependencyInjections";

// Route handlers for /api/v1/inspection-items/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return inspectionItemController.getById(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // ตรวจสอบว่าเป็นการอัพเดทผลการตรวจ
  const path = req.nextUrl.pathname;
  if (path.endsWith("/result")) {
    return inspectionItemController.updateInspectionItemResult(req, { params });
  }

  // Default path สำหรับการอัพเดทรายการตรวจทั่วไป
  return inspectionItemController.update(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return inspectionItemController.delete(req, { params });
}
