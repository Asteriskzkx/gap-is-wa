import { NextRequest, NextResponse } from "next/server";
import { adviceAndDefectController } from "@/utils/dependencyInjections";

// Route handlers for /api/v1/advice-and-defects/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return adviceAndDefectController.getById(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return adviceAndDefectController.updateAdviceAndDefect(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return adviceAndDefectController.delete(req, { params });
}
