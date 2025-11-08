import { fileController } from "@/utils/dependencyInjections";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return fileController.uploadFiles(req as unknown as NextRequest);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
