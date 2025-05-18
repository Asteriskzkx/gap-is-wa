import { NextRequest, NextResponse } from "next/server";
import { requirementController } from "@/utils/dependencyInjections";

// Route handler สำหรับอัพเดทผลการประเมินข้อกำหนด
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return requirementController.updateRequirementEvaluation(req, { params });
}
