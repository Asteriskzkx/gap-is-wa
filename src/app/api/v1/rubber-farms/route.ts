import { NextRequest, NextResponse } from "next/server";
import { rubberFarmController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers for /api/v1/rubber-farms
export async function GET(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, [
    "FARMER",
    "ADMIN",
    "AUDITOR",
    "COMMITTEE",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);

  // If farmerId is provided, get farms by farmer ID
  if (url.searchParams.has("farmerId")) {
    return rubberFarmController.getRubberFarmsByFarmerId(req);
  }

  // Otherwise, get all farms
  return rubberFarmController.getAll(req);
}

export async function POST(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, [
    "FARMER",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // Handle creating a new rubber farm with planting details
  return rubberFarmController.createRubberFarmWithDetails(req);
}
