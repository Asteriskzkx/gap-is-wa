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

    if (!decodedToken || decodedToken.role !== "AUDITOR") {
      return NextResponse.json(
        { message: "Access denied. Only auditors can access this resource." },
        { status: 403 }
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
