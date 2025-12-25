import { NextRequest, NextResponse } from "next/server";
import { requirementController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

export async function PUT(req: NextRequest) {
  const { authorized, error, session } = await checkAuthorization(req, [
    "AUDITOR",
    "ADMIN",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  return requirementController.updateRequirementsEvaluations(req, session);
}
