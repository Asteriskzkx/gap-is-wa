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
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam && endDateParam) {
      // Parse date as local time (YYYY-MM-DD -> local midnight)
      const [startYear, startMonth, startDay] = startDateParam.split("-").map(Number);
      const [endYear, endMonth, endDay] = endDateParam.split("-").map(Number);

      startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
      endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { message: "Invalid date format" },
          { status: 400 }
        );
      }
    }

    // If pagination params provided, use paginated endpoint
    if (limitParam !== null || offsetParam !== null) {
      const limit = limitParam ? parseInt(limitParam, 10) : 10;
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

      const result = await adminReportService.getAuditorPerformancePaginated({
        limit,
        offset,
        startDate,
        endDate,
      });
      return NextResponse.json(result);
    }

    // Otherwise return full report (backward compatible)
    const report = await adminReportService.getAuditorPerformanceReport(startDate, endDate);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching auditor performance report:", error);
    return NextResponse.json(
      { message: "Failed to fetch auditor performance report" },
      { status: 500 }
    );
  }
}
