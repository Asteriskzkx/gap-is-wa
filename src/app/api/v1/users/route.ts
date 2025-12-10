import { checkAuthorization } from "@/lib/session";
import { userController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

// Route handlers สำหรับ /api/v1/users
export async function GET(req: NextRequest) {
  // Check URL params to determine if it's getting current user
  const url = new URL(req.url);
  const getCurrentUser = url.searchParams.get("current") === "true";

  if (getCurrentUser) {
    return userController.getCurrentUser(req);
  }

  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  // Otherwise return all users
  return userController.getAll(req);
}

export async function POST(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);
  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  } 
  return userController.createUser(req);
}