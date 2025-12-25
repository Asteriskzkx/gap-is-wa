import { BaseService } from "./BaseService";
import { RequirementModel } from "../models/RequirementModel";
import { RequirementRepository } from "../repositories/RequirementRepository";
import { AuditLogService } from "./AuditLogService";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export class RequirementService extends BaseService<RequirementModel> {
  private requirementRepository: RequirementRepository;
  private auditLogService: AuditLogService;

  constructor(
    requirementRepository: RequirementRepository,
    auditLogService: AuditLogService
  ) {
    super(requirementRepository);
    this.requirementRepository = requirementRepository;
    this.auditLogService = auditLogService;
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
    currentVersion: number,
    userId?: number
  ): Promise<RequirementModel | null> {
    try {
      // ดึงข้อมูลเก่าก่อน update (สำหรับ log)
      const oldRecord = await this.requirementRepository.findById(
        requirementId
      );

      // Use optimistic locking
      const updated = await this.requirementRepository.updateWithLock(
        requirementId,
        {
          evaluationResult,
          evaluationMethod,
          note,
        },
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
          "Requirement",
          "UPDATE",
          requirementId,
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

  async deleteRequirement(requirementId: number): Promise<boolean> {
    try {
      return await this.delete(requirementId);
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }
}
