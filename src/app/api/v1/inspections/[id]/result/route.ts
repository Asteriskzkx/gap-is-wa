import { NextRequest, NextResponse } from "next/server";
import { inspectionController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handler สำหรับอัพเดทผลการตรวจ
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

  return inspectionController.updateInspectionResult(req, { params }, session);
}
