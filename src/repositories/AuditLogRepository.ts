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

  /**
   * ค้นหา audit logs แบบ pagination พร้อม filter
   */
  async findAllWithPagination(options?: {
    tableName?: string;
    recordId?: number;
    userId?: number;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    multiSortMeta?: string | Array<{ field: string; order: number }>;
    limit?: number;
    offset?: number;
  }): Promise<{ data: AuditLogModel[]; total: number }> {
    try {
      const where: any = {};

      if (options?.tableName) {
        where.tableName = options.tableName;
      }

      if (options?.recordId !== undefined) {
        where.recordId = options.recordId;
      }

      if (options?.userId !== undefined) {
        where.userId = options.userId;
      }

      if (options?.action) {
        where.action = options.action;
      }

      if (options?.startDate || options?.endDate) {
        where.createdAt = {};
        if (options.startDate) {
          where.createdAt.gte = options.startDate;
        }
        if (options.endDate) {
          where.createdAt.lte = options.endDate;
        }
      }

      // Handle multiSortMeta
      let multiSortArr: Array<{ field: string; order: number }> | undefined;
      if (typeof options?.multiSortMeta === "string") {
        try {
          multiSortArr = JSON.parse(options.multiSortMeta as string);
        } catch (e) {
          multiSortArr = undefined;
        }
      } else {
        multiSortArr = options?.multiSortMeta as
          | Array<{ field: string; order: number }>
          | undefined;
      }

      let orderBy: any = {};
      if (multiSortArr && multiSortArr.length > 0) {
        orderBy = multiSortArr.map((sort) => ({
          [sort.field]: sort.order === 1 ? "asc" : "desc",
        }));
      } else if (options?.sortField) {
        orderBy = { [options.sortField]: options.sortOrder || "desc" };
      } else {
        orderBy = { createdAt: "desc" };
      }

      const limit = options?.limit ?? 10;
      const offset = options?.offset ?? 0;

      const [records, total] = await Promise.all([
        (this.prisma as any).auditLog.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
        }),
        (this.prisma as any).auditLog.count({ where }),
      ]);

      return {
        data: records.map((r: any) => this.mapper.toDomain(r)),
        total,
      };
    } catch (error) {
      console.error("Error finding audit logs with pagination:", error);
      return { data: [], total: 0 };
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
    try {
      await (this.prisma as any).auditLog.delete({
        where: { auditLogId: id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting audit log:", error);
      return false;
    }
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

  /**
   * ลบ audit logs ที่เก่ากว่าวันที่กำหนด (Data Retention Policy)
   */
  async deleteOlderThan(date: Date): Promise<number> {
    try {
      const result = await (this.prisma as any).auditLog.deleteMany({
        where: {
          createdAt: {
            lt: date, // less than (เก่ากว่า)
          },
        },
      });
      return result.count;
    } catch (error) {
      console.error("Error deleting old audit logs:", error);
      return 0;
    }
  }

  /**
   * ลบ audit logs ทั้งหมดของ table และ record ID ที่ระบุ
   */
  async deleteByTableAndRecordId(
    tableName: string,
    recordId: number
  ): Promise<number> {
    try {
      const result = await (this.prisma as any).auditLog.deleteMany({
        where: {
          tableName,
          recordId,
        },
      });
      return result.count;
    } catch (error) {
      console.error("Error deleting audit logs by table and record:", error);
      return 0;
    }
  }

  /**
   * ลบ audit logs ทั้งหมด (ใช้เมื่อต้องการ Clear ข้อมูลทั้งหมด)
   */
  async deleteAll(): Promise<number> {
    try {
      const result = await (this.prisma as any).auditLog.deleteMany({});
      return result.count;
    } catch (error) {
      console.error("Error deleting all audit logs:", error);
      return 0;
    }
  }

  /**
   * นับจำนวน audit logs ทั้งหมด
   */
  async count(): Promise<number> {
    try {
      return await (this.prisma as any).auditLog.count();
    } catch (error) {
      console.error("Error counting audit logs:", error);
      return 0;
    }
  }

  /**
   * นับจำนวน audit logs ที่เก่ากว่าวันที่กำหนด
   */
  async countOlderThan(date: Date): Promise<number> {
    try {
      return await (this.prisma as any).auditLog.count({
        where: {
          createdAt: {
            lt: date,
          },
        },
      });
    } catch (error) {
      console.error("Error counting old audit logs:", error);
      return 0;
    }
  }
}
