import { checkAuthorization } from "@/lib/session";
import { farmerController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

// Route handlers for a specific farmer by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, session, error } = await checkAuthorization(req, [
    "FARMER",
    "ADMIN",
    "AUDITOR",
    "COMMITTEE",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // หาก role เป็น FARMER ให้ดึงข้อมูลแค่ตัวเองเท่านั้น
  if (session?.user?.role === "FARMER") {
    return farmerController.getCurrentFarmer(req);
  }

  return farmerController.getById(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // ตรวจสอบ role ก่อน
  const { authorized, session, error } = await checkAuthorization(req, [
    "FARMER",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // หาก role เป็น FARMER ต้องตรวจสอบว่าแก้ไขข้อมูลของตัวเองเท่านั้น
  if (session?.user?.role === "FARMER") {
    const requestedFarmerId = Number.parseInt(params.id, 10);
    const currentFarmerId = session.user.roleData?.farmerId;

    if (!currentFarmerId || requestedFarmerId !== currentFarmerId) {
      return NextResponse.json(
        { message: "คุณสามารถแก้ไขข้อมูลของตัวเองเท่านั้น" },
        { status: 403 }
      );
    }
  }

  return farmerController.updateFarmerProfile(req, { params });
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

  return farmerController.delete(req, { params });
}
