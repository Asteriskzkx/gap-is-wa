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

  /**
   * ลบ audit log ตาม ID
   */
  async deleteLog(id: number): Promise<boolean> {
    try {
      return await this.auditLogRepository.delete(id);
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }

  /**
   * ลบ audit logs ที่เก่าเกินกำหนด (Data Retention Policy)
   * @param days จำนวนวันที่ต้องการเก็บไว้ (เช่น 90 = เก็บไว้แค่ 90 วัน ลบที่เก่ากว่า)
   */
  async deleteOldLogs(days: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const deletedCount = await this.auditLogRepository.deleteOlderThan(
        cutoffDate
      );

      console.log(`Deleted ${deletedCount} audit logs older than ${days} days`);
      return deletedCount;
    } catch (error) {
      this.handleServiceError(error);
      return 0;
    }
  }

  /**
   * ลบ audit logs ทั้งหมดของ record ที่ระบุ
   */
  async deleteRecordLogs(tableName: string, recordId: number): Promise<number> {
    try {
      return await this.auditLogRepository.deleteByTableAndRecordId(
        tableName,
        recordId
      );
    } catch (error) {
      this.handleServiceError(error);
      return 0;
    }
  }

  /**
   * ลบ audit logs ทั้งหมด (ใช้ระวัง!)
   */
  async deleteAllLogs(): Promise<number> {
    try {
      return await this.auditLogRepository.deleteAll();
    } catch (error) {
      this.handleServiceError(error);
      return 0;
    }
  }

  /**
   * นับจำนวน audit logs ทั้งหมด
   */
  async countLogs(): Promise<number> {
    try {
      return await this.auditLogRepository.count();
    } catch (error) {
      this.handleServiceError(error);
      return 0;
    }
  }

  /**
   * นับจำนวน audit logs ที่เก่าเกินกำหนด
   */
  async countOldLogs(days: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return await this.auditLogRepository.countOlderThan(cutoffDate);
    } catch (error) {
      this.handleServiceError(error);
      return 0;
    }
  }
}
