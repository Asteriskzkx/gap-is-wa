import { NextRequest, NextResponse } from "next/server";
import { rubberFarmController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers for /api/v1/rubber-farms/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

  return rubberFarmController.getRubberFarmWithDetails(req, { params });
}

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

  return rubberFarmController.updateRubberFarm(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return rubberFarmController.deleteRubberFarm(req, { params });
}
