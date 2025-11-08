import { NextResponse, NextRequest } from "next/server";
import { fileController } from "@/utils/dependencyInjections";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Delegate to controller
  return fileController.uploadFiles(req as unknown as NextRequest);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
