import { checkAuthorization } from "@/lib/session";
import { rubberFarmController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

// Route handlers for /api/v1/rubber-farms/get-all
export async function GET(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // Otherwise, get all farms
  return rubberFarmController.getAll(req);
}
