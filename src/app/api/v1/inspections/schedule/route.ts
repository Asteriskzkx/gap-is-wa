import { NextRequest, NextResponse } from "next/server";
import { inspectionController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handler สำหรับการสร้างการตรวจประเมินตามประเภทที่เลือก
export async function POST(req: NextRequest) {
  // ตรวจสอบสิทธิ์ว่าเป็น Auditor จริงหรือไม่
  const authResult = await checkAuthorization(req, ["AUDITOR"]);
  if (!authResult.authorized) {
    return NextResponse.json(
      { message: authResult.error || "Unauthorized" },
      { status: authResult.session ? 403 : 401 }
    );
  }

  // ดำเนินการต่อเมื่อผ่านการตรวจสอบสิทธิ์
  return inspectionController.scheduleInspection(req);
}
