import { checkAuthorization } from "@/lib/session";
import { AdminReportService } from "@/services/AdminReportService";
import { NextRequest, NextResponse } from "next/server";

const adminReportService = new AdminReportService();

export async function GET(req: NextRequest) {
  const { authorized, error } = await checkAuthorization(req, ["ADMIN"]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const url = new URL(req.url);
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { message: "Invalid date format" },
          { status: 400 }
        );
      }
    }

    const summary = await adminReportService.getUserReportSummary(startDate, endDate);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching user report summary:", error);
    return NextResponse.json(
      { message: "Failed to fetch user report summary" },
      { status: 500 }
    );
  }
}
