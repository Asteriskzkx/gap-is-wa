import { BaseService } from "./BaseService";
import { AdviceAndDefectModel } from "../models/AdviceAndDefectModel";
import { AdviceAndDefectRepository } from "../repositories/AdviceAndDefectRepository";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export class AdviceAndDefectService extends BaseService<AdviceAndDefectModel> {
  private adviceAndDefectRepository: AdviceAndDefectRepository;

  constructor(adviceAndDefectRepository: AdviceAndDefectRepository) {
    super(adviceAndDefectRepository);
    this.adviceAndDefectRepository = adviceAndDefectRepository;
  }

  async createAdviceAndDefect(data: {
    inspectionId: number;
    date: Date;
    adviceList: any;
    defectList: any;
  }): Promise<AdviceAndDefectModel> {
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

      return await this.create(adviceAndDefectModel);
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
    currentVersion?: number
  ): Promise<AdviceAndDefectModel | null> {
    try {
      if (currentVersion !== undefined) {
        // Use optimistic locking
        return await this.adviceAndDefectRepository.updateWithLock(
          adviceAndDefectId,
          data,
          currentVersion
        );
      } else {
        // Fallback to regular update
        return await this.update(adviceAndDefectId, data);
      }
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
