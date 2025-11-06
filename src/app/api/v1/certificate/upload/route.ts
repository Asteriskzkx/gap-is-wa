import { checkAuthorization } from "@/lib/session";
import { certificateController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

// POST /api/v1/certificate/upload
export async function POST(req: NextRequest) {
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

  return certificateController.uploadCertificate(req);
}
