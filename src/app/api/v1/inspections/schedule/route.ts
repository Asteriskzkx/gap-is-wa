import { NextRequest, NextResponse } from "next/server";
import { inspectionController } from "@/utils/dependencyInjections";
import { auditorService } from "@/utils/dependencyInjections";

// Route handler สำหรับการสร้างการตรวจประเมินตามประเภทที่เลือก
export async function POST(req: NextRequest) {
  // ตรวจสอบสิทธิ์ว่าเป็น Auditor จริงหรือไม่
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { message: "Authorization required" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  const decodedToken = auditorService.verifyToken(token);

  if (!decodedToken || decodedToken.role !== "AUDITOR") {
    return NextResponse.json(
      { message: "Access denied. Only auditors can schedule inspections." },
      { status: 403 }
    );
  }

  // ดำเนินการต่อเมื่อผ่านการตรวจสอบสิทธิ์
  return inspectionController.scheduleInspection(req);
}
