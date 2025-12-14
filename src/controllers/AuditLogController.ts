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
   * GET /api/v1/audit-logs - ดึง audit logs ทั้งหมด (Admin only)
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
   * GET /api/v1/audit-logs/paginated - ดึง audit logs แบบ pagination พร้อม filter (Admin only)
   * Query params: tableName, recordId, userId, action, startDate, endDate, sortField, sortOrder, limit, offset
   */
  async getLogsWithPagination(req: NextRequest): Promise<NextResponse> {
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

      const tableName = searchParams.get("tableName") || undefined;
      const recordId = searchParams.get("recordId")
        ? Number.parseInt(searchParams.get("recordId")!)
        : undefined;
      const userId = searchParams.get("userId")
        ? Number.parseInt(searchParams.get("userId")!)
        : undefined;
      const action = searchParams.get("action") || undefined;

      const startDateStr = searchParams.get("startDate");
      const endDateStr = searchParams.get("endDate");
      const startDate = startDateStr ? new Date(startDateStr) : undefined;
      const endDate = endDateStr ? new Date(endDateStr) : undefined;

      const sortField = searchParams.get("sortField") || undefined;
      const sortOrder =
        (searchParams.get("sortOrder") as "asc" | "desc") || undefined;
      const multiSortMeta = searchParams.get("multiSortMeta") || undefined;

      const limit = searchParams.get("limit")
        ? Number.parseInt(searchParams.get("limit")!)
        : 10;
      const offset = searchParams.get("offset")
        ? Number.parseInt(searchParams.get("offset")!)
        : 0;

      const result = await this.auditLogService.getLogsWithPagination({
        tableName,
        recordId,
        userId,
        action,
        startDate,
        endDate,
        sortField,
        sortOrder,
        multiSortMeta,
        limit,
        offset,
      });

      return NextResponse.json(
        {
          results: result.data,
          paginator: {
            limit,
            offset,
            total: result.total,
          },
        },
        { status: 200 }
      );
    } catch (err: any) {
      console.error("AuditLogController.getLogsWithPagination error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/v1/audit-logs/record?tableName=XXX&recordId=YYY - ดึงประวัติของ record
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
        Number.parseInt(recordId)
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
   * GET /api/v1/audit-logs/user/:userId - ดึงประวัติของ user
   */
  async getUserActivity(
    req: NextRequest,
    params: { userId: string }
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

      const userId = Number.parseInt(params.userId);

      if (Number.isNaN(userId)) {
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
   * GET /api/v1/audit-logs/action/:action - ดึง logs ตาม action
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
   * GET /api/v1/audit-logs/date-range?startDate=XXX&endDate=YYY - ดึง logs ตามช่วงเวลา
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

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
      ) {
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

  /**
   * DELETE /api/v1/audit-logs/:id - ลบ audit log ตาม ID (Admin only)
   */
  async deleteLog(
    req: NextRequest,
    params: { id: string }
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

      const id = Number.parseInt(params.id);

      if (Number.isNaN(id)) {
        return NextResponse.json(
          { message: "Invalid audit log ID" },
          { status: 400 }
        );
      }

      const success = await this.auditLogService.deleteLog(id);

      if (!success) {
        return NextResponse.json(
          { message: "Failed to delete audit log" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Audit log deleted successfully" },
        { status: 200 }
      );
    } catch (err: any) {
      console.error("AuditLogController.deleteLog error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  /**
   * DELETE /api/v1/audit-logs/old?days=90 - ลบ logs ที่เก่าเกินกำหนด (Admin only)
   */
  async deleteOldLogs(req: NextRequest): Promise<NextResponse> {
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
      const daysStr = searchParams.get("days");

      if (!daysStr) {
        return NextResponse.json(
          { message: "days parameter is required" },
          { status: 400 }
        );
      }

      const days = Number.parseInt(daysStr);

      if (Number.isNaN(days) || days <= 0) {
        return NextResponse.json(
          { message: "days must be a positive number" },
          { status: 400 }
        );
      }

      // นับจำนวนที่จะลบก่อน
      const countToDelete = await this.auditLogService.countOldLogs(days);

      // ลบจริง
      const deletedCount = await this.auditLogService.deleteOldLogs(days);

      return NextResponse.json(
        {
          message: `Successfully deleted ${deletedCount} audit logs older than ${days} days`,
          deletedCount,
          estimatedCount: countToDelete,
        },
        { status: 200 }
      );
    } catch (err: any) {
      console.error("AuditLogController.deleteOldLogs error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  /**
   * DELETE /api/v1/audit-logs/record?tableName=XXX&recordId=YYY - ลบ logs ของ record (Admin only)
   */
  async deleteRecordLogs(req: NextRequest): Promise<NextResponse> {
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

      const deletedCount = await this.auditLogService.deleteRecordLogs(
        tableName,
        Number.parseInt(recordId)
      );

      return NextResponse.json(
        {
          message: `Successfully deleted ${deletedCount} audit logs for ${tableName} record ${recordId}`,
          deletedCount,
        },
        { status: 200 }
      );
    } catch (err: any) {
      console.error("AuditLogController.deleteRecordLogs error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  /**
   * DELETE /api/v1/audit-logs/all - ลบ logs ทั้งหมด (Admin only, ใช้ระวัง!)
   */
  async deleteAllLogs(req: NextRequest): Promise<NextResponse> {
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

      // ต้องส่ง confirm=true ใน query parameter เพื่อยืนยัน
      const { searchParams } = new URL(req.url);
      const confirm = searchParams.get("confirm");

      if (confirm !== "true") {
        return NextResponse.json(
          {
            message: "Please add ?confirm=true to confirm deletion of all logs",
          },
          { status: 400 }
        );
      }

      const deletedCount = await this.auditLogService.deleteAllLogs();

      return NextResponse.json(
        {
          message: `Successfully deleted all ${deletedCount} audit logs`,
          deletedCount,
        },
        { status: 200 }
      );
    } catch (err: any) {
      console.error("AuditLogController.deleteAllLogs error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  /**
   * GET /api/v1/audit-logs/stats - ดึงสถิติ audit logs (Admin only)
   */
  async getStats(req: NextRequest): Promise<NextResponse> {
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

      const totalCount = await this.auditLogService.countLogs();
      const old30Days = await this.auditLogService.countOldLogs(30);
      const old90Days = await this.auditLogService.countOldLogs(90);
      const old180Days = await this.auditLogService.countOldLogs(180);
      const old365Days = await this.auditLogService.countOldLogs(365);

      return NextResponse.json(
        {
          stats: {
            total: totalCount,
            olderThan30Days: old30Days,
            olderThan90Days: old90Days,
            olderThan180Days: old180Days,
            olderThan365Days: old365Days,
          },
        },
        { status: 200 }
      );
    } catch (err: any) {
      console.error("AuditLogController.getStats error:", err);
      return NextResponse.json(
        { message: err?.message || "Internal server error" },
        { status: 500 }
      );
    }
  }
}
