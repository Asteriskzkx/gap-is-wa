import { NextRequest, NextResponse } from "next/server";
import { requirementController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers for /api/v1/requirements
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

  // ถ้ามี inspectionItemId parameter
  if (url.searchParams.has("inspectionItemId")) {
    return requirementController.getRequirementsByInspectionItemId(req);
  }

  // ถ้าไม่มี filter ให้ดึงทั้งหมด
  return requirementController.getAll(req);
}

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

  return requirementController.createRequirement(req);
}
