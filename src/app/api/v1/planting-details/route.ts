import { checkAuthorization } from "@/lib/session";
import { plantingDetailController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

// Route handlers for /api/v1/planting-details
export async function GET(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);

  // If rubberFarmId is provided, get details by rubber farm ID
  if (url.searchParams.has("rubberFarmId")) {
    return plantingDetailController.getPlantingDetailsByRubberFarmId(req);
  }

  // Otherwise, get all planting details
  return plantingDetailController.getAll(req);
}

export async function POST(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // Handle creating a new planting detail
  return plantingDetailController.createPlantingDetail(req);
}
