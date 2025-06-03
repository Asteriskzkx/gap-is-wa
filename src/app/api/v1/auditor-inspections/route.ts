import { NextRequest, NextResponse } from "next/server";
import { auditorInspectionController } from "@/utils/dependencyInjections";

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const auditorId = searchParams.get("auditorId");
    const inspectionId = searchParams.get("inspectionId");

    if (auditorId) {
      return auditorInspectionController.getAuditorInspectionsByAuditorId(req);
    } else if (inspectionId) {
      return auditorInspectionController.getAuditorInspectionsByInspectionId(
        req
      );
    } else {
      return auditorInspectionController.getAll(req);
    }
  } catch (error) {
    console.error("Error in auditor-inspections route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    return auditorInspectionController.createAuditorInspection(req);
  } catch (error) {
    console.error("Error in auditor-inspections route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
