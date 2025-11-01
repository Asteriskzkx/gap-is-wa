import { NextRequest, NextResponse } from "next/server";
import { auditorService } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    // ตรวจสอบสิทธิ์ว่าเป็น Auditor จริงหรือไม่
    const authResult = await checkAuthorization(req, ["AUDITOR"]);
    if (!authResult.authorized) {
      return NextResponse.json(
        { message: authResult.error || "Unauthorized" },
        { status: authResult.session ? 403 : 401 }
      );
    }

    // ดึงข้อมูลประเภทการตรวจประเมิน
    const types = await auditorService.getInspectionTypes();

    return NextResponse.json(types, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch inspection types" },
      { status: 500 }
    );
  }
}
