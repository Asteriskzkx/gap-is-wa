import { checkAuthorization } from "@/lib/session";
import { farmerController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return farmerController.registerFarmer(req);
}
