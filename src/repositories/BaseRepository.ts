import { prisma } from "../utils/db";
import { BaseModel } from "../models/BaseModel";
import { BaseMapper } from "../mappers/BaseMapper";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export abstract class BaseRepository<T extends BaseModel> {
  protected prisma = prisma;
  protected mapper: BaseMapper<any, T>;

  constructor(mapper: BaseMapper<any, T>) {
    this.mapper = mapper;
  }

  abstract create(model: T): Promise<T>;
  abstract findById(id: number): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract update(id: number, data: Partial<T>): Promise<T | null>;
  abstract delete(id: number): Promise<boolean>;

  /**
   * Update with optimistic locking
   * @param id - Entity ID
   * @param data - Data to update
   * @param currentVersion - Current version from client
   * @param tableName - Prisma table name (e.g., 'inspection', 'requirement')
   * @returns Updated entity or throws OptimisticLockError
   */
  protected async updateWithOptimisticLock(
    id: number,
    data: any,
    currentVersion: number,
    tableName: string
  ): Promise<T> {
    const prismaModel = (this.prisma as any)[tableName];

    if (!prismaModel) {
      throw new Error(`Table ${tableName} not found in Prisma schema`);
    }

    try {
      // Attempt to update only if version matches
      const result = await prismaModel.updateMany({
        where: {
          [this.getIdField(tableName)]: id,
          version: currentVersion, // Only update if version matches
        },
        data: {
          ...data,
          version: currentVersion + 1, // Increment version
          updatedAt: new Date(),
        },
      });

      // Check if update was successful
      if (result.count === 0) {
        // Fetch current version to provide better error message
        const current = await prismaModel.findUnique({
          where: { [this.getIdField(tableName)]: id },
          select: { version: true },
        });

        throw new OptimisticLockError(
          tableName,
          id,
          currentVersion,
          current?.version ?? -1
        );
      }

      // Fetch and return updated entity with all relations
      const updated = await this.findById(id);

      if (!updated) {
        throw new Error(`Failed to fetch updated ${tableName} with ID ${id}`);
      }

      return updated;
    } catch (error) {
      if (error instanceof OptimisticLockError) {
        throw error;
      }
      console.error(`Error updating ${tableName} with optimistic lock:`, error);
      throw error;
    }
  }

  /**
   * Get ID field name for each table
   */
  protected getIdField(tableName: string): string {
    const idFieldMap: Record<string, string> = {
      farmer: "farmerId",
      auditor: "auditorId",
      committee: "committeeId",
      admin: "adminId",
      rubberFarm: "rubberFarmId",
      plantingDetail: "plantingDetailId",
      inspection: "inspectionId",
      auditorInspection: "auditorInspectionId",
      inspectionItem: "inspectionItemId",
      requirement: "requirementId",
      dataRecord: "dataRecordId",
      adviceAndDefect: "adviceAndDefectId",
      certificate: "certificateId",
      committeeCertificate: "committeeCertificateId",
    };
    return idFieldMap[tableName] || `${tableName}Id`;
  }

  // Common utility methods can be added here
  protected handleDatabaseError(error: any): never {
    console.error("Database operation failed:", error);
    throw new Error(`Database operation failed: ${error.message}`);
  }
}
