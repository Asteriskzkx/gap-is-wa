import { NextRequest, NextResponse } from "next/server";
import { auditorService } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    // ตรวจสอบสิทธิ์ว่าเป็น Auditor จริงหรือไม่
    const authResult = await checkAuthorization(req, ["AUDITOR"]);
    if (!authResult.authorized || !authResult.session) {
      return NextResponse.json(
        { message: authResult.error || "Unauthorized" },
        { status: authResult.session ? 403 : 401 }
      );
    }

    const auditorId = authResult.session.user.roleData?.auditorId;
    if (!auditorId) {
      return NextResponse.json(
        { message: "Auditor ID not found in session" },
        { status: 403 }
      );
    }

    // ดึงรายชื่อ auditor อื่นๆ
    const auditors = await auditorService.getAuditorListExcept(auditorId);

    return NextResponse.json(auditors, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch other auditors" },
      { status: 500 }
    );
  }
}
