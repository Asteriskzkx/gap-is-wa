import { checkAuthorization } from "@/lib/session";
import { certificateController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { authorized, error, session } = await checkAuthorization(req, [
    "COMMITTEE",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return certificateController.revokeCertificate(req, session);
}
