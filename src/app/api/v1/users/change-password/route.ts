import { checkAuthorization } from "@/lib/session";
import { userController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

// Route handler for /api/v1/users/change-password
export async function POST(req: NextRequest) {
  const { authorized, error, session } = await checkAuthorization(req, [
    "FARMER",
    "AUDITOR",
    "COMMITTEE",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return userController.changePassword(req, session);
}
