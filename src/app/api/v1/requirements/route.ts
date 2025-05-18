import { NextRequest, NextResponse } from "next/server";
import { requirementController } from "@/utils/dependencyInjections";

// Route handlers for /api/v1/requirements
export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // ถ้ามี inspectionItemId parameter
  if (url.searchParams.has("inspectionItemId")) {
    return requirementController.getRequirementsByInspectionItemId(req);
  }

  // ถ้าไม่มี filter ให้ดึงทั้งหมด
  return requirementController.getAll(req);
}

export async function POST(req: NextRequest) {
  return requirementController.createRequirement(req);
}
