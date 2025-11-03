import { NextRequest, NextResponse } from "next/server";
import { requirementController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handler สำหรับอัพเดทผลการประเมินข้อกำหนด
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

  return requirementController.updateRequirementEvaluation(req, { params });
}
