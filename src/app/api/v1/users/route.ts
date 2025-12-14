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

  // Check if pagination params are provided - use new paginated endpoint
  const hasPaginationParams = url.searchParams.has("skip") || url.searchParams.has("take") || url.searchParams.has("search") || url.searchParams.has("role");
  
  if (hasPaginationParams) {
    return userController.getAllUsersWithPagination(req);
  }

  // Otherwise return all users (legacy support)
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

