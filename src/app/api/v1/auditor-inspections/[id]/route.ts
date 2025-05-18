import { NextRequest, NextResponse } from "next/server";
import { auditorInspectionController } from "@/utils/dependencyInjections";

// Route handlers for /api/v1/auditor-inspections/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return auditorInspectionController.getById(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return auditorInspectionController.update(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return auditorInspectionController.delete(req, { params });
}
