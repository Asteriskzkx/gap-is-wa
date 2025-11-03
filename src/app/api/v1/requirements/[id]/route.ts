import { NextRequest, NextResponse } from "next/server";
import { requirementController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers for /api/v1/requirements/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, error } = await checkAuthorization(req, [
    "AUDITOR",
    "ADMIN",
    "COMMITTEE",
    "FARMER",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return requirementController.getById(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
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
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return requirementController.delete(req, { params });
}
