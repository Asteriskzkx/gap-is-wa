import { NextRequest, NextResponse } from "next/server";
import { inspectionController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handler สำหรับลบผู้ตรวจประเมินออกจากการตรวจ
export async function POST(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, [
    "AUDITOR",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return inspectionController.removeAuditorFromInspection(req);
}
