import { NextRequest, NextResponse } from "next/server";
import { auditorService } from "@/utils/dependencyInjections";

export async function GET(req: NextRequest) {
  try {
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

    if (
      !decodedToken ||
      decodedToken.role !== "AUDITOR" ||
      !decodedToken.auditorId
    ) {
      return NextResponse.json(
        { message: "Access denied. Only auditors can access this resource." },
        { status: 403 }
      );
    }

    // ดึงรายชื่อ auditor อื่นๆ
    const auditors = await auditorService.getAuditorListExcept(
      decodedToken.auditorId
    );

    return NextResponse.json(auditors, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch other auditors" },
      { status: 500 }
    );
  }
}
