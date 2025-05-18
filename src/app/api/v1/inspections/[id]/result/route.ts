import { NextRequest, NextResponse } from "next/server";
import { inspectionController } from "@/utils/dependencyInjections";

// Route handler สำหรับอัพเดทผลการตรวจ
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return inspectionController.updateInspectionResult(req, { params });
}
