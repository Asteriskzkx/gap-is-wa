import { BaseService } from "./BaseService";
import { DataRecordModel } from "../models/DataRecordModel";
import { DataRecordRepository } from "../repositories/DataRecordRepository";
import { AuditLogService } from "./AuditLogService";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export class DataRecordService extends BaseService<DataRecordModel> {
  private dataRecordRepository: DataRecordRepository;
  private auditLogService: AuditLogService;

  constructor(
    dataRecordRepository: DataRecordRepository,
    auditLogService: AuditLogService
  ) {
    super(dataRecordRepository);
    this.dataRecordRepository = dataRecordRepository;
    this.auditLogService = auditLogService;
  }

  async createDataRecord(dataRecordData: {
    inspectionId: number;
    species: any;
    waterSystem: any;
    fertilizers: any;
    previouslyCultivated: any;
    plantDisease: any;
    relatedPlants: any;
    moreInfo: string;
    map: any;
  }): Promise<DataRecordModel> {
    try {
      // Check if a data record already exists for this inspection
      const existingRecord = await this.dataRecordRepository.findByInspectionId(
        dataRecordData.inspectionId
      );
      if (existingRecord) {
        throw new Error("Data record already exists for this inspection");
      }

      const dataRecordModel = DataRecordModel.create(
        dataRecordData.inspectionId,
        dataRecordData.species,
        dataRecordData.waterSystem,
        dataRecordData.fertilizers,
        dataRecordData.previouslyCultivated,
        dataRecordData.plantDisease,
        dataRecordData.relatedPlants,
        dataRecordData.moreInfo,
        dataRecordData.map
      );

      return await this.create(dataRecordModel);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getDataRecordByInspectionId(
    inspectionId: number
  ): Promise<DataRecordModel | null> {
    try {
      return await this.dataRecordRepository.findByInspectionId(inspectionId);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async updateDataRecord(
    dataRecordId: number,
    data: Partial<DataRecordModel>,
    currentVersion: number,
    userId?: number
  ): Promise<DataRecordModel | null> {
    try {
      // ดึงข้อมูลเก่าก่อน update (สำหรับ log)
      const oldRecord = await this.dataRecordRepository.findById(dataRecordId);

      // Use optimistic locking
      const updated = await this.dataRecordRepository.updateWithLock(
        dataRecordId,
        data,
        currentVersion
      );

      // Log การ update
      if (updated && oldRecord) {
        const {
          createdAt: oldCreatedAt,
          updatedAt: oldUpdatedAt,
          ...oldData
        } = oldRecord.toJSON();
        const {
          createdAt: newCreatedAt,
          updatedAt: newUpdatedAt,
          ...newData
        } = updated.toJSON();

        this.auditLogService.logAction(
          "DataRecord",
          "UPDATE",
          dataRecordId,
          userId || undefined,
          oldData,
          newData
        );
      }

      return updated;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async deleteDataRecord(dataRecordId: number): Promise<boolean> {
    try {
      return await this.delete(dataRecordId);
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }
}
