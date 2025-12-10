import { BaseMapper } from "@/mappers/BaseMapper";
import { AuditLogModel } from "@/models/AuditLogModel";
import { BaseRepository } from "./BaseRepository";

export class AuditLogRepository extends BaseRepository<AuditLogModel> {
  constructor(mapper: BaseMapper<any, AuditLogModel>) {
    super(mapper);
  }

  async create(model: AuditLogModel): Promise<AuditLogModel> {
    try {
      const created = await (this.prisma as any).auditLog.create({
        data: this.mapper.toPrisma(model),
      });
      return this.mapper.toDomain(created);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<AuditLogModel | null> {
    try {
      const record = await (this.prisma as any).auditLog.findUnique({
        where: { auditLogId: id },
      });
      return record ? this.mapper.toDomain(record) : null;
    } catch (error) {
      console.error("Error finding audit log by ID:", error);
      return null;
    }
  }

  async findAll(): Promise<AuditLogModel[]> {
    try {
      const records = await (this.prisma as any).auditLog.findMany({
        orderBy: { createdAt: "desc" },
      });
      return records.map((r: any) => this.mapper.toDomain(r));
    } catch (error) {
      console.error("Error finding all audit logs:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<AuditLogModel>
  ): Promise<AuditLogModel | null> {
    // AuditLog ไม่ควร update - เป็น immutable log
    console.warn("AuditLog should not be updated");
    return null;
  }

  async delete(id: number): Promise<boolean> {
    // AuditLog ไม่ควร delete - เก็บไว้เป็น audit trail
    console.warn("AuditLog should not be deleted");
    return false;
  }

  /**
   * ค้นหา audit logs ตาม table และ record ID
   */
  async findByTableAndRecordId(
    tableName: string,
    recordId: number
  ): Promise<AuditLogModel[]> {
    try {
      const records = await (this.prisma as any).auditLog.findMany({
        where: {
          tableName,
          recordId,
        },
        orderBy: { createdAt: "desc" },
      });
      return records.map((r: any) => this.mapper.toDomain(r));
    } catch (error) {
      console.error("Error finding audit logs by table and record:", error);
      return [];
    }
  }

  /**
   * ค้นหา audit logs ตาม user ID
   */
  async findByUserId(userId: number): Promise<AuditLogModel[]> {
    try {
      const records = await (this.prisma as any).auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return records.map((r: any) => this.mapper.toDomain(r));
    } catch (error) {
      console.error("Error finding audit logs by user ID:", error);
      return [];
    }
  }

  /**
   * ค้นหา audit logs ตาม action type
   */
  async findByAction(action: string): Promise<AuditLogModel[]> {
    try {
      const records = await (this.prisma as any).auditLog.findMany({
        where: { action },
        orderBy: { createdAt: "desc" },
      });
      return records.map((r: any) => this.mapper.toDomain(r));
    } catch (error) {
      console.error("Error finding audit logs by action:", error);
      return [];
    }
  }

  /**
   * ค้นหา audit logs ในช่วงเวลาที่กำหนด
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<AuditLogModel[]> {
    try {
      const records = await (this.prisma as any).auditLog.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return records.map((r: any) => this.mapper.toDomain(r));
    } catch (error) {
      console.error("Error finding audit logs by date range:", error);
      return [];
    }
  }
}
