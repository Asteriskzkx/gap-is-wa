import { BaseService } from "./BaseService";
import { RequirementModel } from "../models/RequirementModel";
import { RequirementRepository } from "../repositories/RequirementRepository";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export class RequirementService extends BaseService<RequirementModel> {
  private requirementRepository: RequirementRepository;

  constructor(requirementRepository: RequirementRepository) {
    super(requirementRepository);
    this.requirementRepository = requirementRepository;
  }

  async createRequirement(requirementData: {
    inspectionItemId: number;
    requirementMasterId: number;
    requirementNo: number;
    evaluationResult: string;
    evaluationMethod: string;
    note: string;
  }): Promise<RequirementModel> {
    try {
      const requirementModel = RequirementModel.create(
        requirementData.inspectionItemId,
        requirementData.requirementMasterId,
        requirementData.requirementNo,
        requirementData.evaluationResult,
        requirementData.evaluationMethod,
        requirementData.note
      );

      return await this.create(requirementModel);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getRequirementsByInspectionItemId(
    inspectionItemId: number
  ): Promise<RequirementModel[]> {
    try {
      return await this.requirementRepository.findByInspectionItemId(
        inspectionItemId
      );
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  async updateRequirementEvaluation(
    requirementId: number,
    evaluationResult: string,
    evaluationMethod: string,
    note: string,
    currentVersion?: number
  ): Promise<RequirementModel | null> {
    try {
      if (currentVersion !== undefined) {
        // Use optimistic locking
        return await this.requirementRepository.updateWithLock(
          requirementId,
          {
            evaluationResult,
            evaluationMethod,
            note,
          },
          currentVersion
        );
      } else {
        // Fallback to regular update
        return await this.update(requirementId, {
          evaluationResult,
          evaluationMethod,
          note,
        });
      }
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async deleteRequirement(requirementId: number): Promise<boolean> {
    try {
      return await this.delete(requirementId);
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }
}
