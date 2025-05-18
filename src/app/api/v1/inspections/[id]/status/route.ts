import { NextRequest, NextResponse } from "next/server";
import { inspectionController } from "@/utils/dependencyInjections";

// Route handler สำหรับอัพเดทสถานะการตรวจ
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return inspectionController.updateInspectionStatus(req, { params });
}
