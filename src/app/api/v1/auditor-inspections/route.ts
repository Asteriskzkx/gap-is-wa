import { NextRequest, NextResponse } from "next/server";
import { auditorInspectionController } from "@/utils/dependencyInjections";
import { checkAuthorization } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { authorized, error } = await checkAuthorization(req, [
      "AUDITOR",
      "ADMIN",
      "COMMITTEE",
    ]);

    if (!authorized) {
      return NextResponse.json(
        { message: error || "Unauthorized" },
        { status: 401 }
      );
    }

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
    const { authorized, error } = await checkAuthorization(req, [
      "AUDITOR",
      "ADMIN",
    ]);

    if (!authorized) {
      return NextResponse.json(
        { message: error || "Unauthorized" },
        { status: 401 }
      );
    }

    return auditorInspectionController.createAuditorInspection(req);
  } catch (error) {
    console.error("Error in auditor-inspections route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
