import { NextRequest, NextResponse } from "next/server";
import { committeeController } from "@/utils/dependencyInjections";

// Route handlers for /api/v1/committees/current
export async function GET(req: NextRequest) {
  return committeeController.getCurrentCommittee(req);
}
