import { checkAuthorization } from "@/lib/session";
import { UserRole } from "@/models/UserModel";
import { AuditLogService } from "@/services/AuditLogService";
import { NextRequest, NextResponse } from "next/server";

export class AuditLogController {
  private readonly auditLogService: AuditLogService;

  constructor(auditLogService: AuditLogService) {
    this.auditLogService = auditLogService;
  }

  /**
   * GET /api/audit-logs - ดึง audit logs ทั้งหมด (Admin only)
   */
  async getAllLogs(req: NextRequest): Promise<NextResponse> {
    try {
      const { authorized, error } = await checkAuthorization(req, [
        UserRole.ADMIN,
      ]);

      if (!authorized) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      const logs = await this.auditLogService.getAllLogs();

      return NextResponse.json({ logs }, { status: 200 });
    } catch (err: any) {
      console.error("AuditLogController.getAllLogs error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/audit-logs/record?tableName=XXX&recordId=YYY - ดึงประวัติของ record
   */
  async getRecordHistory(req: NextRequest): Promise<NextResponse> {
    try {
      const { authorized, error } = await checkAuthorization(req, [
        UserRole.ADMIN,
      ]);

      if (!authorized) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      const { searchParams } = new URL(req.url);
      const tableName = searchParams.get("tableName");
      const recordId = searchParams.get("recordId");

      if (!tableName || !recordId) {
        return NextResponse.json(
          { message: "tableName and recordId are required" },
          { status: 400 }
        );
      }

      const logs = await this.auditLogService.getRecordHistory(
        tableName,
        parseInt(recordId)
      );

      return NextResponse.json({ logs }, { status: 200 });
    } catch (err: any) {
      console.error("AuditLogController.getRecordHistory error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/audit-logs/user/:userId - ดึงประวัติของ user
   */
  async getUserActivity(
    req: NextRequest,
    params: { userId: string }
  ): Promise<NextResponse> {
    try {
      const { authorized, error, session } = await checkAuthorization(req, [
        UserRole.ADMIN,
      ]);

      if (!authorized) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      const userId = parseInt(params.userId);

      if (isNaN(userId)) {
        return NextResponse.json(
          { message: "Invalid user ID" },
          { status: 400 }
        );
      }

      const logs = await this.auditLogService.getUserActivity(userId);

      return NextResponse.json({ logs }, { status: 200 });
    } catch (err: any) {
      console.error("AuditLogController.getUserActivity error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/audit-logs/action/:action - ดึง logs ตาม action
   */
  async getLogsByAction(
    req: NextRequest,
    params: { action: string }
  ): Promise<NextResponse> {
    try {
      const { authorized, error } = await checkAuthorization(req, [
        UserRole.ADMIN,
      ]);

      if (!authorized) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      const action = params.action.toUpperCase();

      if (!["CREATE", "UPDATE", "DELETE"].includes(action)) {
        return NextResponse.json(
          { message: "Invalid action type" },
          { status: 400 }
        );
      }

      const logs = await this.auditLogService.getLogsByAction(action);

      return NextResponse.json({ logs }, { status: 200 });
    } catch (err: any) {
      console.error("AuditLogController.getLogsByAction error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/audit-logs/date-range?startDate=XXX&endDate=YYY - ดึง logs ตามช่วงเวลา
   */
  async getLogsByDateRange(req: NextRequest): Promise<NextResponse> {
    try {
      const { authorized, error } = await checkAuthorization(req, [
        UserRole.ADMIN,
      ]);

      if (!authorized) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      const { searchParams } = new URL(req.url);
      const startDateStr = searchParams.get("startDate");
      const endDateStr = searchParams.get("endDate");

      if (!startDateStr || !endDateStr) {
        return NextResponse.json(
          { message: "startDate and endDate are required" },
          { status: 400 }
        );
      }

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { message: "Invalid date format" },
          { status: 400 }
        );
      }

      const logs = await this.auditLogService.getLogsByDateRange(
        startDate,
        endDate
      );

      return NextResponse.json({ logs }, { status: 200 });
    } catch (err: any) {
      console.error("AuditLogController.getLogsByDateRange error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }
}
