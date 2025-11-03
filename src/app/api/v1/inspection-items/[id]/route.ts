import { NextRequest, NextResponse } from "next/server";
import { inspectionItemController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers for /api/v1/inspection-items/[id]
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

  return inspectionItemController.getById(req, { params });
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
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return inspectionItemController.delete(req, { params });
}
