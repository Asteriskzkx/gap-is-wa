import { NextRequest, NextResponse } from "next/server";
import { adviceAndDefectController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers for /api/v1/advice-and-defects
export async function GET(req: NextRequest) {
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

  const url = new URL(req.url);

  // ถ้ามี inspectionId parameter
  if (url.searchParams.has("inspectionId")) {
    return adviceAndDefectController.getAdviceAndDefectByInspectionId(req);
  }

  // ถ้าไม่มี filter ให้ดึงทั้งหมด
  return adviceAndDefectController.getAll(req);
}

export async function POST(req: NextRequest) {
  const { authorized, error, session } = await checkAuthorization(req, [
    "AUDITOR",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return adviceAndDefectController.createAdviceAndDefect(req, session);
}
