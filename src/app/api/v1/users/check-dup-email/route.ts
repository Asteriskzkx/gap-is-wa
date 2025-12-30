import { userController } from "@/utils/dependencyInjections";
import { NextRequest } from "next/server";

// Route handler for /api/v1/users/check-dup-email
export async function GET(req: NextRequest) {
  return userController.checkDuplicateEmail(req);
}
