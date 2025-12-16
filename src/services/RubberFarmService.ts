import { PlantingDetailModel } from "../models/PlantingDetailModel";
import { RubberFarmModel } from "../models/RubberFarmModel";
import { InspectionRepository } from "../repositories/InspectionRepository";
import { PlantingDetailRepository } from "../repositories/PlantingDetailRepository";
import { RubberFarmRepository } from "../repositories/RubberFarmRepository";
import { BaseService } from "./BaseService";
import { AuditLogService } from "./AuditLogService";

// ประกาศ interface สำหรับข้อมูลที่ใช้ในการอัปเดต PlantingDetail
interface PlantingDetailUpdateData {
  specie?: string;
  areaOfPlot?: number;
  numberOfRubber?: number;
  numberOfTapping?: number;
  ageOfRubber?: number;
  yearOfTapping?: Date;
  monthOfTapping?: Date;
  totalProduction?: number;
  rubberFarmId?: number;
}

export class RubberFarmService extends BaseService<RubberFarmModel> {
  private rubberFarmRepository: RubberFarmRepository;
  private plantingDetailRepository: PlantingDetailRepository;
  private inspectionRepository: InspectionRepository;
  private auditLogService: AuditLogService;

  constructor(
    rubberFarmRepository: RubberFarmRepository,
    plantingDetailRepository: PlantingDetailRepository,
    inspectionRepository: InspectionRepository,
    auditLogService: AuditLogService
  ) {
    super(rubberFarmRepository);
    this.rubberFarmRepository = rubberFarmRepository;
    this.plantingDetailRepository = plantingDetailRepository;
    this.inspectionRepository = inspectionRepository;
    this.auditLogService = auditLogService;
  }

  async createRubberFarmWithDetails(
    farmData: {
      farmerId: number;
      villageName: string;
      moo: number;
      road: string;
      alley: string;
      subDistrict: string;
      district: string;
      province: string;
      location: any;
    },
    plantingDetailsData: Array<{
      specie: string;
      areaOfPlot: number;
      numberOfRubber: number;
      numberOfTapping: number;
      ageOfRubber: number;
      yearOfTapping: Date;
      monthOfTapping: Date;
      totalProduction: number;
    }>,
    userId?: number
  ): Promise<RubberFarmModel> {
    try {
      // Create the rubber farm first
      const rubberFarmModel = RubberFarmModel.create(
        farmData.farmerId,
        farmData.villageName,
        farmData.moo,
        farmData.road,
        farmData.alley,
        farmData.subDistrict,
        farmData.district,
        farmData.province,
        farmData.location
      );

      const createdFarm = await this.create(rubberFarmModel);

      // Create the planting details
      if (plantingDetailsData && plantingDetailsData.length > 0) {
        const plantingDetailModels = plantingDetailsData.map((detail) =>
          PlantingDetailModel.create(
            createdFarm.rubberFarmId,
            detail.specie,
            detail.areaOfPlot,
            detail.numberOfRubber,
            detail.numberOfTapping,
            detail.ageOfRubber,
            detail.yearOfTapping,
            detail.monthOfTapping,
            detail.totalProduction
          )
        );

        const createdDetails = await this.plantingDetailRepository.createMany(
          plantingDetailModels
        );

        // Add the created details to the farm
        createdFarm.plantingDetails = createdDetails;

        if (this.auditLogService && userId && createdFarm) {
          const {
            createdAt,
            updatedAt,
            plantingDetails,
            ...createdFarmCoreData
          } = createdFarm.toJSON();

          await this.auditLogService.logAction(
            "RubberFarm",
            "CREATE",
            createdFarm.rubberFarmId,
            userId,
            void 0,
            createdFarmCoreData
          );
        }
      }

      return createdFarm;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getRubberFarmsByFarmerId(farmerId: number): Promise<RubberFarmModel[]> {
    try {
      return await this.rubberFarmRepository.findByFarmerId(farmerId);
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  /**
   * ดึงรายการ rubber farm ของเกษตรกร พร้อมรองรับ pagination และ sorting
   */
  async getRubberFarmsByFarmerIdWithPagination(options: {
    farmerId: number;
    province?: string;
    district?: string;
    subDistrict?: string;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    multiSortMeta?: Array<{ field: string; order: 1 | -1 }>;
    limit?: number;
    offset?: number;
    includeInspections?: boolean;
    priorityStatus?: string; // เพิ่ม parameter สำหรับกำหนดสถานะที่ต้องการให้แสดงก่อน
  }): Promise<{ data: any[]; total: number }> {
    try {
      const {
        farmerId,
        province,
        district,
        subDistrict,
        sortField,
        sortOrder,
        multiSortMeta,
        limit = 10,
        offset = 0,
        includeInspections = false,
        priorityStatus, // รับค่า priorityStatus
      } = options;

      // ดึงข้อมูลทั้งหมดของเกษตรกรคนนี้
      const allFarms = await this.rubberFarmRepository.findByFarmerId(farmerId);

      // ถ้าต้องการข้อมูล inspections ด้วย ให้ดึง inspections ผ่าน repository
      // สร้าง row แยกสำหรับแต่ละ inspection (ทำให้ rubber farm ปรากฏซ้ำได้)
      // และรวมฟาร์มที่ไม่มีการตรวจด้วย (จะมีไม่มีฟิลด์ `inspection`)
      let farmsToProcess: any[] = [];
      if (includeInspections) {
        // ดึง inspections ทั้งหมด แล้วกรองเฉพาะที่สัมพันธ์กับฟาร์มของเกษตรกรนี้
        const allInspections = await this.inspectionRepository.findAll();
        const inspectionsForFarmer = allInspections.filter((insp) => {
          const rfId = insp.rubberFarm?.rubberFarmId || insp.rubberFarmId;
          return rfId && allFarms.some((f) => f.rubberFarmId === rfId);
        });

        // สำหรับแต่ละฟาร์ม: ถ้ามี inspections ให้สร้างแถวแยกต่อ inspection
        // ถ้าไม่มี inspections ให้เพิ่มแถวฟาร์มปกติ (ไม่มี field `inspection`)
        for (const farm of allFarms) {
          const farmInspections = inspectionsForFarmer.filter((insp) => {
            const rfId = insp.rubberFarm?.rubberFarmId || insp.rubberFarmId;
            return rfId === farm.rubberFarmId;
          });

          if (farmInspections.length > 0) {
            for (const insp of farmInspections) {
              farmsToProcess.push({ ...farm, inspection: insp });
            }
          } else {
            farmsToProcess.push({ ...farm });
          }
        }
      } else {
        farmsToProcess = allFarms;
      }

      // Filter ตามเงื่อนไข
      let filteredFarms = farmsToProcess.filter((farm) => {
        if (province && farm.province !== province) return false;
        if (district && farm.district !== district) return false;
        if (subDistrict && farm.subDistrict !== subDistrict) return false;
        return true;
      });

      // Sorting
      if (multiSortMeta && multiSortMeta.length > 0) {
        filteredFarms.sort((a, b) => {
          for (const sortMeta of multiSortMeta) {
            let aValue: any;
            let bValue: any;

            // Handle special fields
            if (sortMeta.field === "farmId") {
              aValue = a.rubberFarmId;
              bValue = b.rubberFarmId;
            } else if (sortMeta.field === "location") {
              aValue = `${a.villageName} หมู่ ${a.moo}`;
              bValue = `${b.villageName} หมู่ ${b.moo}`;
            } else if (
              sortMeta.field === "inspectionDateAndTime" &&
              includeInspections
            ) {
              // Sort by inspection date
              aValue = a.inspection?.inspectionDateAndTime
                ? new Date(a.inspection.inspectionDateAndTime).getTime()
                : 0;
              bValue = b.inspection?.inspectionDateAndTime
                ? new Date(b.inspection.inspectionDateAndTime).getTime()
                : 0;
            } else if (
              sortMeta.field.startsWith("inspection.") &&
              includeInspections
            ) {
              // Sort by other inspection fields
              const inspectionField = sortMeta.field.replace("inspection.", "");
              aValue = a.inspection?.[inspectionField] || "";
              bValue = b.inspection?.[inspectionField] || "";
            } else {
              aValue = this.getNestedValue(a, sortMeta.field);
              bValue = this.getNestedValue(b, sortMeta.field);
            }

            if (aValue !== bValue) {
              if (aValue < bValue) return sortMeta.order === 1 ? -1 : 1;
              if (aValue > bValue) return sortMeta.order === 1 ? 1 : -1;
            }
          }
          return 0;
        });
      } else if (sortField && sortOrder) {
        filteredFarms.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          // Handle special fields
          if (sortField === "farmId") {
            aValue = a.rubberFarmId;
            bValue = b.rubberFarmId;
          } else if (sortField === "location") {
            aValue = `${a.villageName} หมู่ ${a.moo}`;
            bValue = `${b.villageName} หมู่ ${b.moo}`;
          } else if (
            sortField === "inspectionDateAndTime" &&
            includeInspections
          ) {
            // Sort by inspection date
            aValue = a.latestInspection?.inspectionDateAndTime
              ? new Date(a.latestInspection.inspectionDateAndTime).getTime()
              : 0;
            bValue = b.latestInspection?.inspectionDateAndTime
              ? new Date(b.latestInspection.inspectionDateAndTime).getTime()
              : 0;
          } else if (
            sortField.startsWith("inspection.") &&
            includeInspections
          ) {
            // Sort by other inspection fields
            const inspectionField = sortField.replace("inspection.", "");
            aValue = a.inspection?.[inspectionField] || "";
            bValue = b.inspection?.[inspectionField] || "";
          } else {
            aValue = this.getNestedValue(a, sortField);
            bValue = this.getNestedValue(b, sortField);
          }

          if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
          if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }

      // เรียงลำดับตาม priorityStatus ถ้ามีการระบุ (แสดงสถานะที่ต้องการก่อน)
      if (priorityStatus && includeInspections) {
        filteredFarms.sort((a, b) => {
          const statusA = a.inspection?.inspectionStatus || "";
          const statusB = b.inspection?.inspectionStatus || "";

          if (statusA === priorityStatus && statusB !== priorityStatus) {
            return -1;
          }
          if (statusA !== priorityStatus && statusB === priorityStatus) {
            return 1;
          }
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }

      const total = filteredFarms.length;

      // Pagination
      const paginatedFarms = filteredFarms.slice(offset, offset + limit);

      // แปลงข้อมูลเป็น format ที่ใช้ในตาราง
      const formattedFarms = paginatedFarms.map((farm) => {
        const baseData = {
          rubberFarmId: farm.rubberFarmId,
          farmId: `RF${farm.rubberFarmId.toString().padStart(5, "0")}`,
          villageName: farm.villageName,
          moo: farm.moo,
          location: `${farm.villageName} หมู่ ${farm.moo}`,
          province: farm.province,
          district: farm.district,
          subDistrict: farm.subDistrict,
          createdAt: farm.createdAt,
          version: farm.version,
        };

        // ถ้ามี inspection ให้เพิ่มข้อมูล inspection ด้วย
        if (includeInspections && farm.inspection) {
          const inspectionData: any = {
            inspectionId: farm.inspection.inspectionId,
            inspectionNo: farm.inspection.inspectionNo,
            inspectionDateAndTime: farm.inspection.inspectionDateAndTime,
            inspectionStatus: farm.inspection.inspectionStatus,
            inspectionResult: farm.inspection.inspectionResult,
          };

          // เพิ่ม adviceAndDefect ถ้ามี
          if (farm.inspection.adviceAndDefect) {
            inspectionData.adviceAndDefect = {
              adviceAndDefectId:
                farm.inspection.adviceAndDefect.adviceAndDefectId,
              date: farm.inspection.adviceAndDefect.date,
              adviceList: farm.inspection.adviceAndDefect.adviceList,
              defectList: farm.inspection.adviceAndDefect.defectList,
            };
          }

          return {
            ...baseData,
            inspection: inspectionData,
          };
        }

        return baseData;
      });

      return {
        data: formattedFarms,
        total,
      };
    } catch (error) {
      this.handleServiceError(error);
      return { data: [], total: 0 };
    }
  }

  /**
   * Helper function เพื่อดึงค่าจาก nested object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  }

  async getRubberFarmWithDetails(
    rubberFarmId: number
  ): Promise<RubberFarmModel | null> {
    try {
      const farm = await this.rubberFarmRepository.findById(rubberFarmId);
      if (!farm) {
        return null;
      }

      const details = await this.plantingDetailRepository.findByRubberFarmId(
        rubberFarmId
      );
      farm.plantingDetails = details;

      return farm;
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async updateRubberFarm(
    rubberFarmId: number,
    farmData: Partial<RubberFarmModel>,
    currentVersion?: number,
    userId?: number
  ): Promise<RubberFarmModel | null> {
    try {
      const oldRecord = await this.rubberFarmRepository.findById(rubberFarmId);

      let updated: RubberFarmModel | null;

      if (currentVersion === undefined) {
        // Fallback to regular update
        updated = await this.update(rubberFarmId, farmData);
      } else {
        // Use optimistic locking
        updated = await this.rubberFarmRepository.updateWithLock(
          rubberFarmId,
          farmData,
          currentVersion
        );
      }

      if (updated && oldRecord) {
        const {
          createdAt: oldCreatedAt,
          updatedAt: oldUpdatedAt,
          plantingDetails: oldPlantingDetails,
          ...oldData
        } = oldRecord.toJSON();

        const {
          createdAt: newCreatedAt,
          updatedAt: newUpdatedAt,
          plantingDetails: newPlantingDetails,
          ...updatedData
        } = updated.toJSON();

        await this.auditLogService.logAction(
          "RubberFarm",
          "UPDATE",
          rubberFarmId,
          userId || undefined,
          oldData,
          updatedData
        );
      }
      return updated;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async deleteRubberFarm(rubberFarmId: number): Promise<boolean> {
    try {
      // Check if the farm exists
      const farm = await this.getById(rubberFarmId);
      if (!farm) {
        return false;
      }

      // Delete all planting details first
      const details = await this.plantingDetailRepository.findByRubberFarmId(
        rubberFarmId
      );
      for (const detail of details) {
        await this.plantingDetailRepository.delete(detail.plantingDetailId);
      }

      // Then delete the farm
      return await this.delete(rubberFarmId);
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }
}
