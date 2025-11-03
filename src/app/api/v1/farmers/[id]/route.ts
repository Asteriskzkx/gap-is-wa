import { NextRequest, NextResponse } from "next/server";
import { farmerController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers for a specific farmer by ID
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

  return farmerController.getById(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // ตรวจสอบ role ก่อน
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

  return farmerController.updateFarmerProfile(req, { params });
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

  return farmerController.delete(req, { params });
}
