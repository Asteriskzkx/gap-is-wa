import { NextRequest, NextResponse } from "next/server";
import { userController } from "@/utils/dependencyInjections";

// Route handlers สำหรับ /api/v1/users เท่านั้น
export async function GET(req: NextRequest) {
  // Check URL params to determine if it's getting current user
  const url = new URL(req.url);
  const getCurrentUser = url.searchParams.get("current") === "true";

  if (getCurrentUser) {
    return userController.getCurrentUser(req);
  }

  // Otherwise return all users
  return userController.getAll(req);
}

export async function POST(req: NextRequest) {
  // เฉพาะสำหรับการสร้างผู้ใช้ใหม่เท่านั้น (สำหรับ admin)
  return userController.create(req);
}
