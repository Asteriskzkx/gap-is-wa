import { NextRequest, NextResponse } from "next/server";
import { committeeController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers for /api/v1/committees
export async function GET(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, [
    "COMMITTEE",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // Get all committees
  return committeeController.getAll(req);
}

export async function POST(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // Check if it's a registration request
  const path = req.nextUrl.pathname;

  if (path.endsWith("/register")) {
    return committeeController.registerCommittee(req);
  }

  if (path.endsWith("/login")) {
    return committeeController.login(req);
  }

  // If not registration or login, create a new committee (admin only)
  return committeeController.create(req);
}
