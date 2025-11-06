import { checkAuthorization } from "@/lib/session";
import { committeeController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

// Route handlers for /api/v1/committees/register
export async function POST(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return committeeController.registerCommittee(req);
}
