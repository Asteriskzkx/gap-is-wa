import { BaseService } from "./BaseService";
import { InspectionItemModel } from "../models/InspectionItemModel";
import { InspectionItemRepository } from "../repositories/InspectionItemRepository";
import { RequirementRepository } from "../repositories/RequirementRepository";
import { RequirementModel } from "../models/RequirementModel";
import { AuditLogService } from "./AuditLogService";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export class InspectionItemService extends BaseService<InspectionItemModel> {
  private inspectionItemRepository: InspectionItemRepository;
  private requirementRepository: RequirementRepository;
  private auditLogService: AuditLogService;

  constructor(
    inspectionItemRepository: InspectionItemRepository,
    requirementRepository: RequirementRepository,
    auditLogService: AuditLogService
  ) {
    super(inspectionItemRepository);
    this.inspectionItemRepository = inspectionItemRepository;
    this.requirementRepository = requirementRepository;
    this.auditLogService = auditLogService;
  }

  async createInspectionItem(itemData: {
    inspectionId: number;
    inspectionItemMasterId: number;
    inspectionItemNo: number;
    inspectionItemResult: string;
    otherConditions: any;
    requirements?: Array<{
      requirementMasterId: number;
      requirementNo: number;
      evaluationResult: string;
      evaluationMethod: string;
      note: string;
    }>;
  }): Promise<InspectionItemModel> {
    try {
      // Create the inspection item
      const inspectionItemModel = InspectionItemModel.create(
        itemData.inspectionId,
        itemData.inspectionItemMasterId,
        itemData.inspectionItemNo,
        itemData.inspectionItemResult,
        itemData.otherConditions
      );

      const createdItem = await this.create(inspectionItemModel);

      // If requirements are provided, create them
      if (itemData.requirements && itemData.requirements.length > 0) {
        const requirementModels = itemData.requirements.map((req) =>
          RequirementModel.create(
            createdItem.inspectionItemId,
            req.requirementMasterId,
            req.requirementNo,
            req.evaluationResult,
            req.evaluationMethod,
            req.note
          )
        );

        for (const requirementModel of requirementModels) {
          await this.requirementRepository.create(requirementModel);
        }

        // Get all created requirements for this item
        const requirements =
          await this.requirementRepository.findByInspectionItemId(
            createdItem.inspectionItemId
          );
        createdItem.requirements = requirements;
      }

      return createdItem;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getInspectionItemsByInspectionId(
    inspectionId: number
  ): Promise<InspectionItemModel[]> {
    try {
      return await this.inspectionItemRepository.findByInspectionId(
        inspectionId
      );
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  async updateInspectionItemResult(
    itemId: number,
    result: string,
    currentVersion: number,
    otherConditions?: any,
    userId?: number
  ): Promise<InspectionItemModel | null> {
    try {
      // ดึงข้อมูลเก่าก่อน update (สำหรับ log)
      const oldRecord = await this.inspectionItemRepository.findById(itemId);

      const updateData: any = { inspectionItemResult: result };
      if (otherConditions !== undefined) {
        updateData.otherConditions = otherConditions;
      }

      // Use optimistic locking
      const updated = await this.inspectionItemRepository.updateWithLock(
        itemId,
        updateData,
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
          "InspectionItem",
          "UPDATE",
          itemId,
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

  async deleteInspectionItem(itemId: number): Promise<boolean> {
    try {
      return await this.delete(itemId);
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }
}
