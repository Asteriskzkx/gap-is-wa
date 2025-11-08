import { NextRequest } from "next/server";
import { fileController } from "@/utils/dependencyInjections";

export const runtime = "nodejs";

export async function GET(req: Request) {
  return fileController.getFiles(req as unknown as NextRequest);
}
