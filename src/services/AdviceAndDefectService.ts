import { AdviceAndDefectModel } from "../models/AdviceAndDefectModel";
import { AdviceAndDefectRepository } from "../repositories/AdviceAndDefectRepository";
import { AuditLogService } from "./AuditLogService";
import { BaseService } from "./BaseService";

export class AdviceAndDefectService extends BaseService<AdviceAndDefectModel> {
  private adviceAndDefectRepository: AdviceAndDefectRepository;
  private auditLogService: AuditLogService;

  constructor(
    adviceAndDefectRepository: AdviceAndDefectRepository,
    auditLogService: AuditLogService
  ) {
    super(adviceAndDefectRepository);
    this.adviceAndDefectRepository = adviceAndDefectRepository;
    this.auditLogService = auditLogService;
  }

  async createAdviceAndDefect(
    data: {
      inspectionId: number;
      date: Date;
      adviceList: any;
      defectList: any;
    },
    userId?: number
  ): Promise<AdviceAndDefectModel> {
    try {
      // Check if advice and defect already exists for this inspection
      const existingRecord =
        await this.adviceAndDefectRepository.findByInspectionId(
          data.inspectionId
        );
      if (existingRecord) {
        throw new Error(
          "Advice and defect record already exists for this inspection"
        );
      }

      const adviceAndDefectModel = AdviceAndDefectModel.create(
        data.inspectionId,
        data.date,
        data.adviceList,
        data.defectList
      );

      const created = await this.create(adviceAndDefectModel);

      const {
        createdAt: newCreatedAt,
        updatedAt: newUpdatedAt,
        ...createdData
      } = created.toJSON();

      if (this.auditLogService && created) {
        await this.auditLogService.logAction(
          "AdviceAndDefect",
          "CREATE",
          created.adviceAndDefectId,
          userId || undefined,
          void 0,
          createdData
        );
      }

      return created;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getAdviceAndDefectByInspectionId(
    inspectionId: number
  ): Promise<AdviceAndDefectModel | null> {
    try {
      return await this.adviceAndDefectRepository.findByInspectionId(
        inspectionId
      );
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async updateAdviceAndDefect(
    adviceAndDefectId: number,
    data: Partial<AdviceAndDefectModel>,
    currentVersion?: number,
    userId?: number
  ): Promise<AdviceAndDefectModel | null> {
    try {
      // ดึงข้อมูลเก่าก่อน update (สำหรับ log)
      const oldRecord = await this.adviceAndDefectRepository.findById(
        adviceAndDefectId
      );

      let updated: AdviceAndDefectModel | null;

      if (currentVersion === undefined) {
        // Fallback to regular update
        updated = await this.update(adviceAndDefectId, data);
      } else {
        // Use optimistic locking
        updated = await this.adviceAndDefectRepository.updateWithLock(
          adviceAndDefectId,
          data,
          currentVersion
        );
      }

      //Log การ update
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
          "AdviceAndDefect",
          "UPDATE",
          adviceAndDefectId,
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

  async deleteAdviceAndDefect(adviceAndDefectId: number): Promise<boolean> {
    try {
      return await this.delete(adviceAndDefectId);
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }
}
