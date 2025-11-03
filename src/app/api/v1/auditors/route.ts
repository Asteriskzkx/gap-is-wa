import { NextRequest, NextResponse } from "next/server";
import { auditorController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers สำหรับ /api/v1/auditors เท่านั้น
export async function GET(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, [
    "AUDITOR",
    "ADMIN",
    "COMMITTEE",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // ดึงข้อมูลผู้ตรวจสอบทั้งหมด
  return auditorController.getAll(req);
}

export async function POST(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // ตรวจสอบว่าเป็นการลงทะเบียนผู้ตรวจสอบหรือไม่
  const path = req.nextUrl.pathname;

  if (path.endsWith("/register")) {
    return auditorController.registerAuditor(req);
  }

  // ถ้าไม่ใช่การลงทะเบียน ให้สร้างผู้ตรวจสอบใหม่ (สำหรับ admin)
  return auditorController.create(req);
}
