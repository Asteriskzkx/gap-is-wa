import { AuditLogModel } from "@/models/AuditLogModel";
import { AuditLogRepository } from "@/repositories/AuditLogRepository";
import { BaseService } from "./BaseService";

export class AuditLogService extends BaseService<AuditLogModel> {
  private readonly auditLogRepository: AuditLogRepository;

  constructor(auditLogRepository: AuditLogRepository) {
    super(auditLogRepository);
    this.auditLogRepository = auditLogRepository;
  }

  /**
   * บันทึก audit log
   */
  async logAction(
    tableName: string,
    action: "CREATE" | "UPDATE" | "DELETE",
    recordId: number,
    userId?: number,
    oldData?: Record<string, any>,
    newData?: Record<string, any>
  ): Promise<AuditLogModel | null> {
    try {
      const model = AuditLogModel.createAuditLog(
        tableName,
        action,
        recordId,
        userId,
        oldData,
        newData
      );

      if (!model.validate()) {
        console.error("Invalid audit log model");
        return null;
      }

      return await this.create(model);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  /**
   * ดึงประวัติการแก้ไขของ record
   */
  async getRecordHistory(
    tableName: string,
    recordId: number
  ): Promise<AuditLogModel[]> {
    try {
      return await this.auditLogRepository.findByTableAndRecordId(
        tableName,
        recordId
      );
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  /**
   * ดึงประวัติการแก้ไขของ user
   */
  async getUserActivity(userId: number): Promise<AuditLogModel[]> {
    try {
      return await this.auditLogRepository.findByUserId(userId);
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  /**
   * ดึง audit logs ตาม action
   */
  async getLogsByAction(action: string): Promise<AuditLogModel[]> {
    try {
      return await this.auditLogRepository.findByAction(action);
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  /**
   * ดึง audit logs ในช่วงเวลา
   */
  async getLogsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<AuditLogModel[]> {
    try {
      return await this.auditLogRepository.findByDateRange(startDate, endDate);
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  /**
   * ดึง audit logs ทั้งหมด (สำหรับ admin)
   */
  async getAllLogs(): Promise<AuditLogModel[]> {
    try {
      return await this.getAll();
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }
}
