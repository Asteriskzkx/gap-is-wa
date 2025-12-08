import { NextRequest, NextResponse } from "next/server";
import { farmerController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers สำหรับ /api/v1/farmers เท่านั้น
export async function GET(req: NextRequest) {
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

  // สำหรับ ADMIN, AUDITOR, COMMITTEE สามารถใช้ filter ได้
  const url = new URL(req.url);

  if (url.searchParams.has("district")) {
    return farmerController.getFarmersByDistrict(req);
  } else if (url.searchParams.has("province")) {
    return farmerController.getFarmersByProvince(req);
  }

  // ถ้าไม่มี filter ให้ดึงข้อมูลเกษตรกรทั้งหมด
  return farmerController.getAll(req);
}

export async function POST(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // ถ้าไม่ใช่การลงทะเบียน ให้สร้างเกษตรกรใหม่ (สำหรับ admin)
  return farmerController.create(req);
}
