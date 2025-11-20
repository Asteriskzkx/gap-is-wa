import { NextRequest } from "next/server";
import { fileController } from "@/utils/dependencyInjections";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
  return fileController.deleteFilesByReference(req as unknown as NextRequest);
}
