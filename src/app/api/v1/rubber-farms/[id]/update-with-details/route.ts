import { checkAuthorization } from "@/lib/session";
import { rubberFarmController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

  return rubberFarmController.updateRubberFarmWithDetails(req, { params });
}
