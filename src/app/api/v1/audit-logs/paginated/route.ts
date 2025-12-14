import { checkAuthorization } from "@/lib/session";
import { UserRole } from "@/models/UserModel";
import { auditLogController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, [UserRole.ADMIN]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return auditLogController.getLogsWithPagination(req);
}
