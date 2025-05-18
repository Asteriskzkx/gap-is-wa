import { BaseService } from "./BaseService";
import { InspectionModel } from "../models/InspectionModel";
import { InspectionRepository } from "../repositories/InspectionRepository";
import { AuditorInspectionRepository } from "../repositories/AuditorInspectionRepository";
import { InspectionItemRepository } from "../repositories/InspectionItemRepository";
import { DataRecordRepository } from "../repositories/DataRecordRepository";
import { AdviceAndDefectRepository } from "../repositories/AdviceAndDefectRepository";
import { AuditorService } from "./AuditorService";
import { AuditorInspectionModel } from "@/models/AuditorInspectionModel";

export class InspectionService extends BaseService<InspectionModel> {
  private inspectionRepository: InspectionRepository;
  private auditorInspectionRepository: AuditorInspectionRepository;
  private inspectionItemRepository: InspectionItemRepository;
  private dataRecordRepository: DataRecordRepository;
  private adviceAndDefectRepository: AdviceAndDefectRepository;
  private auditorService: AuditorService;

  constructor(
    inspectionRepository: InspectionRepository,
    auditorInspectionRepository: AuditorInspectionRepository,
    inspectionItemRepository: InspectionItemRepository,
    dataRecordRepository: DataRecordRepository,
    adviceAndDefectRepository: AdviceAndDefectRepository,
    auditorService: AuditorService
  ) {
    super(inspectionRepository);
    this.inspectionRepository = inspectionRepository;
    this.auditorInspectionRepository = auditorInspectionRepository;
    this.inspectionItemRepository = inspectionItemRepository;
    this.dataRecordRepository = dataRecordRepository;
    this.adviceAndDefectRepository = adviceAndDefectRepository;
    this.auditorService = auditorService;
  }

  async createInspection(inspectionData: {
    inspectionNo: number;
    inspectionDateAndTime: Date;
    inspectionTypeId: number;
    inspectionStatus: string;
    inspectionResult: string;
    auditorChiefId: number;
    rubberFarmId: number;
    auditorIds?: number[];
  }): Promise<InspectionModel> {
    try {
      // Check if auditor chief exists
      const auditorChief = await this.auditorService.getById(
        inspectionData.auditorChiefId
      );
      if (!auditorChief) {
        throw new Error("Auditor chief not found");
      }

      // Create the inspection
      const inspectionModel = InspectionModel.create(
        inspectionData.inspectionNo,
        inspectionData.inspectionDateAndTime,
        inspectionData.inspectionTypeId,
        inspectionData.inspectionStatus,
        inspectionData.inspectionResult,
        inspectionData.auditorChiefId,
        inspectionData.rubberFarmId
      );

      const createdInspection = await this.create(inspectionModel);

      // If auditorIds are provided, create auditor inspections
      if (inspectionData.auditorIds && inspectionData.auditorIds.length > 0) {
        for (const auditorId of inspectionData.auditorIds) {
          // Skip the chief auditor if included in the list
          if (auditorId === inspectionData.auditorChiefId) {
            continue;
          }

          await this.addAuditorToInspection(
            createdInspection.inspectionId,
            auditorId
          );
        }
      }

      return createdInspection;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getInspectionsByRubberFarmId(
    rubberFarmId: number
  ): Promise<InspectionModel[]> {
    try {
      return await this.inspectionRepository.findByRubberFarmId(rubberFarmId);
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  async getInspectionsByAuditorId(
    auditorId: number
  ): Promise<InspectionModel[]> {
    try {
      return await this.inspectionRepository.findByAuditorId(auditorId);
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  async updateInspectionStatus(
    inspectionId: number,
    status: string
  ): Promise<InspectionModel | null> {
    try {
      return await this.update(inspectionId, { inspectionStatus: status });
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async updateInspectionResult(
    inspectionId: number,
    result: string
  ): Promise<InspectionModel | null> {
    try {
      return await this.update(inspectionId, { inspectionResult: result });
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async addAuditorToInspection(
    inspectionId: number,
    auditorId: number
  ): Promise<boolean> {
    try {
      // Check if auditor exists
      const auditor = await this.auditorService.getById(auditorId);
      if (!auditor) {
        throw new Error("Auditor not found");
      }

      // Check if inspection exists
      const inspection = await this.getById(inspectionId);
      if (!inspection) {
        throw new Error("Inspection not found");
      }

      // Check if auditor is already assigned to this inspection
      const existingAssignments =
        await this.auditorInspectionRepository.findByInspectionId(inspectionId);
      const isAlreadyAssigned = existingAssignments.some(
        (ai) => ai.auditorId === auditorId
      );

      if (isAlreadyAssigned) {
        throw new Error("Auditor is already assigned to this inspection");
      }

      // Create auditor inspection model using the static factory method
      const auditorInspectionModel = AuditorInspectionModel.create(
        auditorId,
        inspectionId
      );

      // Create the auditor inspection record using the repository
      const auditorInspection = await this.auditorInspectionRepository.create(
        auditorInspectionModel
      );

      return auditorInspection !== null;
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }

  async removeAuditorFromInspection(
    inspectionId: number,
    auditorId: number
  ): Promise<boolean> {
    try {
      // Find the auditor inspection record
      const auditorInspections =
        await this.auditorInspectionRepository.findByInspectionId(inspectionId);
      const auditorInspection = auditorInspections.find(
        (ai) => ai.auditorId === auditorId
      );

      if (!auditorInspection) {
        throw new Error("Auditor is not assigned to this inspection");
      }

      // Delete the record
      return await this.auditorInspectionRepository.delete(
        auditorInspection.auditorInspectionId
      );
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }

  async deleteInspection(inspectionId: number): Promise<boolean> {
    try {
      return await this.delete(inspectionId);
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }
}
