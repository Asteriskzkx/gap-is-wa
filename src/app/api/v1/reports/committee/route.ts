import { checkAuthorization } from "@/lib/session";
import { CommitteeReportService } from "@/services/CommitteeReportService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { authorized, error, session } = await checkAuthorization(request, [
    "COMMITTEE",
  ]);

  if (!authorized) {
    return NextResponse.json(
      { message: error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Parse dates as local time (not UTC)
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateParam) {
      // Parse YYYY-MM-DD as local time
      const [year, month, day] = startDateParam.split("-").map(Number);
      startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    if (endDateParam) {
      // Parse YYYY-MM-DD as local time
      const [year, month, day] = endDateParam.split("-").map(Number);
      endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
    }

    // Get userId from session for personal committee stats
    const userId = session.user.id ? Number(session.user.id) : undefined;

    const report = await CommitteeReportService.getCommitteeReport(
      startDate,
      endDate,
      userId
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching committee report:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
