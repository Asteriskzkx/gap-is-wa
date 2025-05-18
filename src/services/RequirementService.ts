import { BaseService } from "./BaseService";
import { RequirementModel } from "../models/RequirementModel";
import { RequirementRepository } from "../repositories/RequirementRepository";

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
    note: string
  ): Promise<RequirementModel | null> {
    try {
      return await this.update(requirementId, {
        evaluationResult,
        evaluationMethod,
        note,
      });
    } catch (error) {
      this.handleServiceError(error);
      return null;
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
