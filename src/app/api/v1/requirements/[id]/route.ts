import { NextRequest, NextResponse } from "next/server";
import { requirementController } from "@/utils/dependencyInjections";

// Route handlers for /api/v1/requirements/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return requirementController.getById(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // ตรวจสอบว่าเป็นการอัพเดทผลการประเมิน
  const path = req.nextUrl.pathname;
  if (path.endsWith("/evaluation")) {
    return requirementController.updateRequirementEvaluation(req, { params });
  }

  // Default path สำหรับการอัพเดทข้อกำหนดทั่วไป
  return requirementController.update(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return requirementController.delete(req, { params });
}
