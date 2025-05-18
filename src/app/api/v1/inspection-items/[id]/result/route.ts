import { NextRequest, NextResponse } from "next/server";
import { inspectionItemController } from "@/utils/dependencyInjections";

// Route handler สำหรับอัพเดทผลการตรวจของรายการตรวจ
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return inspectionItemController.updateInspectionItemResult(req, { params });
}
