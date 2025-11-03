import { NextRequest, NextResponse } from "next/server";
import { adminController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

// Route handlers
export async function GET(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  const path = req.nextUrl.pathname;

  if (path.endsWith("/statistics")) {
    return adminController.getUserStatistics(req);
  } else if (path.endsWith("/config")) {
    return adminController.getSystemConfig(req);
  }

  // Default to get all admins
  return adminController.getAll(req);
}

export async function POST(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  const path = req.nextUrl.pathname;

  if (path.endsWith("/register")) {
    return adminController.registerAdmin(req);
  } else if (path.endsWith("/login")) {
    return adminController.login(req);
  } else if (path.endsWith("/change-role")) {
    return adminController.changeUserRole(req);
  } else if (path.endsWith("/config")) {
    return adminController.updateSystemConfig(req);
  }

  // Default to create a new admin
  return adminController.create(req);
}
