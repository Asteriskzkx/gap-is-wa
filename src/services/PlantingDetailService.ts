import { BaseService } from "./BaseService";
import { PlantingDetailModel } from "../models/PlantingDetailModel";
import { PlantingDetailRepository } from "../repositories/PlantingDetailRepository";
import { AuditLogService } from "./AuditLogService";

export class PlantingDetailService extends BaseService<PlantingDetailModel> {
  private plantingDetailRepository: PlantingDetailRepository;
  private auditLogService: AuditLogService;

  constructor(
    plantingDetailRepository: PlantingDetailRepository,
    auditLogService: AuditLogService
  ) {
    super(plantingDetailRepository);
    this.plantingDetailRepository = plantingDetailRepository;
    this.auditLogService = auditLogService;
  }

  async createPlantingDetail(
    detailData: {
      rubberFarmId: number;
      specie: string;
      areaOfPlot: number;
      numberOfRubber: number;
      numberOfTapping: number;
      ageOfRubber: number;
      yearOfTapping: Date | string;
      monthOfTapping: Date | string;
      totalProduction: number;
    },
    userId?: number
  ): Promise<PlantingDetailModel> {
    try {
      // ตรวจสอบและแปลงค่าทุกชนิดให้ถูกต้อง
      const yearOfTapping =
        detailData.yearOfTapping instanceof Date
          ? detailData.yearOfTapping
          : new Date(detailData.yearOfTapping || new Date());

      const monthOfTapping =
        detailData.monthOfTapping instanceof Date
          ? detailData.monthOfTapping
          : new Date(detailData.monthOfTapping || new Date());

      const plantingDetailModel = PlantingDetailModel.create(
        Number(detailData.rubberFarmId),
        String(detailData.specie).trim(),
        Number(detailData.areaOfPlot),
        Number(detailData.numberOfRubber),
        Number(detailData.numberOfTapping),
        Number(detailData.ageOfRubber),
        yearOfTapping,
        monthOfTapping,
        Number(detailData.totalProduction)
      );

      const createdPlantingDetail = await this.create(plantingDetailModel);

      if (this.auditLogService && userId && createdPlantingDetail) {
        const {
          createdAt: newCreatedAt,
          updatedAt: newUpdatedAt,
          ...createdData
        } = createdPlantingDetail.toJSON();

        await this.auditLogService.logAction(
          "PlantingDetail",
          "CREATE",
          createdPlantingDetail.plantingDetailId,
          userId,
          void 0,
          createdData
        );
      }

      return createdPlantingDetail;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getPlantingDetailsByRubberFarmId(
    rubberFarmId: number
  ): Promise<PlantingDetailModel[]> {
    try {
      return await this.plantingDetailRepository.findByRubberFarmId(
        rubberFarmId
      );
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  async updatePlantingDetail(
    plantingDetailId: number,
    detailData: Partial<PlantingDetailModel>,
    userId?: number
  ): Promise<PlantingDetailModel | null> {
    try {
      const oldRecord = await this.plantingDetailRepository.findById(
        plantingDetailId
      );

      let updated: PlantingDetailModel | null;

      if (detailData.version == undefined) {
        updated = await this.update(plantingDetailId, detailData);
      } else {
        const currentVersion = detailData.version;
        // ลบ version ออกจาก detailData ก่อนส่งไป update
        const { version, ...dataWithoutVersion } = detailData;
        updated = await this.plantingDetailRepository.updateWithLock(
          plantingDetailId,
          dataWithoutVersion,
          currentVersion
        );
      }

      if (updated && oldRecord && this.auditLogService && userId) {
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

        await this.auditLogService.logAction(
          "PlantingDetail",
          "UPDATE",
          plantingDetailId,
          userId,
          oldData,
          newData
        );
      }

      return updated;
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async delete(plantingDetailId: number, userId?: number): Promise<boolean> {
    try {
      // Get old record before deletion for audit log
      const oldRecord = await this.plantingDetailRepository.findById(
        plantingDetailId
      );

      if (!oldRecord) {
        return false;
      }

      // Delete the record
      const isDeleted = await this.repository.delete(plantingDetailId);

      if (isDeleted && this.auditLogService && userId) {
        const { createdAt, updatedAt, ...oldData } = oldRecord.toJSON();

        await this.auditLogService.logAction(
          "PlantingDetail",
          "DELETE",
          plantingDetailId,
          userId,
          oldData,
          void 0
        );
      }

      return isDeleted;
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }
}
