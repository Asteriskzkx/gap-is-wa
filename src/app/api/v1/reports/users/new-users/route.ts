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

    let startDate: Date;
    let endDate: Date;

    if (!startDateParam || !endDateParam) {
      // If no date range provided, fetch all time data
      // Get the earliest user creation date
      const earliestUser = await adminReportService.getEarliestUserDate();
      startDate = earliestUser || new Date("2020-01-01");
      endDate = new Date();
    } else {
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

    const report = await adminReportService.getNewUsersByDateRange(
      startDate,
      endDate
    );
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching new users time series:", error);
    return NextResponse.json(
      { message: "Failed to fetch new users time series" },
      { status: 500 }
    );
  }
}
