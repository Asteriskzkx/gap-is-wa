import { AdviceAndDefectModel } from "@/models/AdviceAndDefectModel";
import { AuditorInspectionModel } from "@/models/AuditorInspectionModel";
import { DataRecordModel } from "@/models/DataRecordModel";
import { InspectionItemModel } from "@/models/InspectionItemModel";
import { RequirementModel } from "@/models/RequirementModel";
import { InspectionTypeMasterRepository } from "@/repositories/InspectionTypeMasterRepository";
import { RequirementRepository } from "@/repositories/RequirementRepository";
import { RubberFarmRepository } from "@/repositories/RubberFarmRepository";
import { OptimisticLockError } from "../errors/OptimisticLockError";
import { InspectionModel } from "../models/InspectionModel";
import { AdviceAndDefectRepository } from "../repositories/AdviceAndDefectRepository";
import { AuditorInspectionRepository } from "../repositories/AuditorInspectionRepository";
import { DataRecordRepository } from "../repositories/DataRecordRepository";
import { InspectionItemRepository } from "../repositories/InspectionItemRepository";
import { InspectionRepository } from "../repositories/InspectionRepository";
import { AuditorService } from "./AuditorService";
import { BaseService } from "./BaseService";
import { AuditLogService } from "./AuditLogService";
export class InspectionService extends BaseService<InspectionModel> {
  private inspectionRepository: InspectionRepository;
  private auditorInspectionRepository: AuditorInspectionRepository;
  private inspectionItemRepository: InspectionItemRepository;
  private dataRecordRepository: DataRecordRepository;
  private adviceAndDefectRepository: AdviceAndDefectRepository;
  private requirementRepository: RequirementRepository;
  private auditorService: AuditorService;
  private rubberFarmRepository: RubberFarmRepository;
  private inspectionTypeMasterRepository: InspectionTypeMasterRepository;
  private auditLogService: AuditLogService;

  constructor(
    inspectionRepository: InspectionRepository,
    auditorInspectionRepository: AuditorInspectionRepository,
    inspectionItemRepository: InspectionItemRepository,
    dataRecordRepository: DataRecordRepository,
    adviceAndDefectRepository: AdviceAndDefectRepository,
    requirementRepository: RequirementRepository,
    auditorService: AuditorService,
    rubberFarmRepository: RubberFarmRepository,
    inspectionTypeMasterRepository: InspectionTypeMasterRepository,
    auditLogService: AuditLogService
  ) {
    super(inspectionRepository);
    this.inspectionRepository = inspectionRepository;
    this.auditorInspectionRepository = auditorInspectionRepository;
    this.inspectionItemRepository = inspectionItemRepository;
    this.requirementRepository = requirementRepository;
    this.dataRecordRepository = dataRecordRepository;
    this.adviceAndDefectRepository = adviceAndDefectRepository;
    this.auditorService = auditorService;
    this.rubberFarmRepository = rubberFarmRepository;
    this.inspectionTypeMasterRepository = inspectionTypeMasterRepository;
    this.auditLogService = auditLogService;
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

  async scheduleInspection(
    rubberFarmId: number,
    inspectionTypeId: number,
    inspectionDateAndTime: Date,
    auditorChiefId: number,
    additionalAuditorIds: number[] = [],
    userId?: number
  ): Promise<InspectionModel> {
    try {
      // ตรวจสอบว่า auditorChiefId เป็น auditor ที่มีอยู่จริง
      const auditorChief = await this.auditorService.getById(auditorChiefId);
      if (!auditorChief) {
        throw new Error("Auditor chief not found");
      }

      // ตรวจสอบว่า RubberFarm มีอยู่จริง
      const rubberFarm = await this.rubberFarmRepository.findByRubberFarmId(
        rubberFarmId
      );
      if (!rubberFarm) {
        throw new Error("Rubber farm not found");
      }

      // ตรวจสอบว่าประเภทการตรวจประเมินมีอยู่จริง
      const inspectionType = await this.inspectionTypeMasterRepository.findById(
        inspectionTypeId
      );
      if (!inspectionType) {
        throw new Error("Inspection type not found");
      }

      // ตรวจสอบว่า RubberFarm นี้มีการตรวจประเมินที่กำลังดำเนินการอยู่หรือไม่
      const pendingInspections =
        await this.inspectionRepository.findByRubberFarmId(rubberFarmId);
      const pendingInspection = pendingInspections.find(
        (inspection) => inspection.inspectionStatus === "รอการตรวจประเมิน"
      );

      if (pendingInspection) {
        throw new Error("This rubber farm already has a pending inspection");
      }

      // สร้างหมายเลขการตรวจประเมิน
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");

      // หาลำดับที่ของการตรวจในเดือนนี้
      const inspectionsThisMonth =
        await this.inspectionTypeMasterRepository.countInspectionsThisMonth();

      const sequenceNumber = (inspectionsThisMonth + 1)
        .toString()
        .padStart(4, "0");
      const inspectionNo = parseInt(`${year}${month}${sequenceNumber}`);

      // สร้างการตรวจประเมินใหม่ด้วยสถานะ "รอการตรวจ"
      const inspectionModel = InspectionModel.create(
        inspectionNo,
        inspectionDateAndTime,
        inspectionTypeId,
        "รอการตรวจประเมิน", // สถานะรอการตรวจ
        "รอผลการตรวจประเมิน", // ผลการตรวจยังไม่มี
        auditorChiefId,
        rubberFarmId
      );

      // สร้างและบันทึกการตรวจประเมิน
      const createdInspection = await this.create(inspectionModel);

      // เพิ่ม auditor เพิ่มเติม (ถ้ามี)
      if (additionalAuditorIds && additionalAuditorIds.length > 0) {
        for (const auditorId of additionalAuditorIds) {
          // ข้ามหัวหน้าผู้ตรวจและตรวจสอบว่าเป็น auditor ที่มีอยู่จริง
          if (auditorId !== auditorChiefId) {
            const auditor = await this.auditorService.getById(auditorId);
            if (!auditor) {
              console.warn(`Auditor with ID ${auditorId} not found, skipping`);
              continue;
            }

            await this.addAuditorToInspection(
              createdInspection.inspectionId,
              auditorId
            );
          }
        }
      }

      // ดึงข้อมูล InspectionItemMaster และ RequirementMaster ตามประเภทการตรวจ
      // และสร้าง InspectionItem และ Requirement ตามแม่แบบ
      await this.createInspectionItemsFromTemplates(
        createdInspection.inspectionId,
        inspectionTypeId
      );

      // สร้าง DataRecord เริ่มต้น (ข้อมูลเปล่า)
      const dataRecordModel = DataRecordModel.create(
        createdInspection.inspectionId,
        {}, // species - เริ่มต้นเป็น empty object
        {}, // waterSystem
        {}, // fertilizers
        {}, // previouslyCultivated
        {}, // plantDisease
        {}, // relatedPlants
        "", // moreInfo
        {} // map - เริ่มต้นเป็น empty object หรือ GeoJSON ว่าง
      );
      const createdDataRecord = await this.dataRecordRepository.create(
        dataRecordModel
      );

      const {
        createdAt: dataRecordCreatedAt,
        updatedAt: dataRecordUpdatedAt,
        ...formattedDataRecord
      } = createdDataRecord.toJSON();

      if (this.auditLogService && userId && createdDataRecord) {
        await this.auditLogService.logAction(
          "DataRecord",
          "CREATE",
          createdDataRecord.dataRecordId,
          userId,
          void 0,
          formattedDataRecord
        );
      }

      // สร้าง AdviceAndDefect เริ่มต้น (รายการเปล่า)
      const adviceAndDefectModel = AdviceAndDefectModel.create(
        createdInspection.inspectionId,
        inspectionDateAndTime, // ใช้วันที่เดียวกับการตรวจ
        [], // adviceList - เริ่มต้นเป็น empty array
        [] // defectList - เริ่มต้นเป็น empty array
      );
      const createdAdviceAndDefect =
        await this.adviceAndDefectRepository.create(adviceAndDefectModel);

      const {
        createdAt: adviceCreatedAt,
        updatedAt: adviceUpdatedAt,
        ...formattedAdviceAndDefect
      } = createdAdviceAndDefect.toJSON();

      if (this.auditLogService && userId && createdAdviceAndDefect) {
        await this.auditLogService.logAction(
          "AdviceAndDefect",
          "CREATE",
          createdAdviceAndDefect.adviceAndDefectId,
          userId,
          void 0,
          formattedAdviceAndDefect
        );
      }

      // ดึงข้อมูลที่สร้างทั้งหมด
      const createdInspectionData = (await this.getById(
        createdInspection.inspectionId
      )) as InspectionModel;

      // บันทึก audit log เฉพาะข้อมูลหลักของ Inspection (ไม่รวม relations)
      if (this.auditLogService && userId && createdInspectionData) {
        const {
          createdAt,
          updatedAt,
          inspectionItems,
          dataRecord,
          adviceAndDefect,
          auditorInspections,
          inspectionType,
          rubberFarm,
          auditorChief,
          ...inspectionCoreData
        } = createdInspectionData.toJSON();

        await this.auditLogService.logAction(
          "Inspection",
          "CREATE",
          createdInspection.inspectionId,
          userId,
          void 0,
          inspectionCoreData
        );
      }

      return createdInspectionData;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  // Method เพิ่มเติมสำหรับสร้าง InspectionItem และ Requirement จากแม่แบบ
  private async createInspectionItemsFromTemplates(
    inspectionId: number,
    inspectionTypeId: number
  ): Promise<void> {
    // 1. ดึงข้อมูล InspectionItemMaster ตามประเภทการตรวจ
    const inspectionItemsTemplate =
      await this.inspectionTypeMasterRepository.findInspectionItemsByTypeId(
        inspectionTypeId
      );

    // 2. สร้าง InspectionItem และ Requirement สำหรับแต่ละรายการ
    for (const itemTemplate of inspectionItemsTemplate) {
      // ในที่นี้ควรใช้ repository สำหรับสร้าง InspectionItem แทนการใช้ prisma โดยตรง

      // สร้างโมเดลสำหรับ InspectionItem
      const inspectionItemModel = InspectionItemModel.create(
        inspectionId,
        itemTemplate.inspectionItemId,
        itemTemplate.itemNo,
        "NOT_EVALUATED",
        {}
      );

      // สร้าง InspectionItem ผ่าน repository
      const inspectionItem = await this.inspectionItemRepository.create(
        inspectionItemModel
      );

      // สร้าง Requirement สำหรับแต่ละข้อกำหนดที่เกี่ยวข้อง
      if (itemTemplate.requirements && itemTemplate.requirements.length > 0) {
        for (const reqTemplate of itemTemplate.requirements) {
          // สร้างโมเดลสำหรับ Requirement
          const requirementModel = RequirementModel.create(
            inspectionItem.inspectionItemId,
            reqTemplate.requirementId,
            reqTemplate.requirementNo,
            "NOT_EVALUATED",
            "PENDING",
            ""
          );

          // สร้าง Requirement ผ่าน repository
          await this.requirementRepository.create(requirementModel);
        }
      }
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
    auditorId: number,
    options?: {
      inspectionNo?: string;
      inspectionStatus?: string;
      inspectionResult?: string;
      province?: string;
      district?: string;
      subDistrict?: string;
      sortField?: string;
      sortOrder?: "asc" | "desc";
      multiSortMeta?: Array<{ field: string; order: number }>;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ data: any[]; total: number }> {
    try {
      const result =
        await this.inspectionRepository.findByAuditorIdWithPagination(
          auditorId,
          options
        );

      // แปลง InspectionModel[] เป็น JSON
      const dataJson = result.data.map((inspection: InspectionModel) =>
        inspection.toJSON()
      );

      return {
        data: dataJson,
        total: result.total,
      };
    } catch (error) {
      this.handleServiceError(error);
      return { data: [], total: 0 };
    }
  }

  async getAllWithPagination(options?: {
    inspectionNo?: string;
    inspectionStatus?: string;
    inspectionResult?: string;
    province?: string;
    district?: string;
    subDistrict?: string;
    fromDate?: string;
    toDate?: string;
    noCertificate?: boolean;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    multiSortMeta?: Array<{ field: string; order: number }>;
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[]; total: number }> {
    try {
      const result = await this.inspectionRepository.findAllWithPagination(
        options
      );

      const dataJson = result.data.map((inspection: InspectionModel) =>
        inspection.toJSON()
      );

      return {
        data: dataJson,
        total: result.total,
      };
    } catch (error) {
      this.handleServiceError(error);
      return { data: [], total: 0 };
    }
  }

  /**
   * Fetch inspections that are ready to issue certificates.
   * By default this means inspectionResult === "ผ่าน" and no certificate exists yet.
   */
  async getReadyToIssueInspections(options?: {
    fromDate?: string;
    toDate?: string;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    multiSortMeta?: Array<{ field: string; order: number }>;
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[]; total: number }> {
    try {
      const mergedOpts: any = {
        inspectionResult: "ผ่าน",
        noCertificate: true,
        ...(options || {}),
      };

      const result = await this.inspectionRepository.findAllWithPagination(
        mergedOpts
      );

      const dataJson = result.data.map((inspection: InspectionModel) =>
        inspection.toJSON()
      );

      return {
        data: dataJson,
        total: result.total,
      };
    } catch (error) {
      this.handleServiceError(error);
      return { data: [], total: 0 };
    }
  }

  async updateInspectionStatus(
    inspectionId: number,
    status: string,
    currentVersion: number,
    userId?: number
  ): Promise<InspectionModel | null> {
    try {
      // ดึงข้อมูลเก่าก่อน update (สำหรับ log)
      const oldRecord = await this.inspectionRepository.findById(inspectionId);

      // Use optimistic locking
      const updated = await this.inspectionRepository.updateWithLock(
        inspectionId,
        { inspectionStatus: status },
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
          "Inspection",
          "UPDATE",
          inspectionId,
          userId || undefined,
          oldData,
          newData
        );
      }

      return updated;
    } catch (error) {
      if (error instanceof OptimisticLockError) {
        throw error; // Re-throw to be handled by controller
      }
      this.handleServiceError(error);
      throw error;
    }
  }

  async updateInspectionResult(
    inspectionId: number,
    result: string,
    currentVersion?: number
  ): Promise<InspectionModel | null> {
    try {
      // Use optimistic locking if version is provided
      if (currentVersion !== undefined && currentVersion !== null) {
        return await this.inspectionRepository.updateWithLock(
          inspectionId,
          { inspectionResult: result },
          currentVersion
        );
      }

      // Fallback to regular update if no version provided (backward compatibility)
      return await this.update(inspectionId, { inspectionResult: result });
    } catch (error) {
      if (error instanceof OptimisticLockError) {
        throw error; // Re-throw to be handled by controller
      }
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
