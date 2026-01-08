import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuditorReportService } from "@/services/AuditorReportService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse date parameters
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateStr && endDateStr) {
      // Parse as local time
      const [startYear, startMonth, startDay] = startDateStr.split("-").map(Number);
      const [endYear, endMonth, endDay] = endDateStr.split("-").map(Number);

      startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
      endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
    }

    const userId = parseInt(session.user.id);
    const report = await AuditorReportService.getMyInspectionReport(userId, startDate, endDate);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching auditor report:", error);
    return NextResponse.json(
      { error: "Failed to fetch auditor report" },
      { status: 500 }
    );
  }
}
