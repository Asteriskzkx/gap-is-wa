import { BaseService } from "./BaseService";
import { RubberFarmModel } from "../models/RubberFarmModel";
import { PlantingDetailModel } from "../models/PlantingDetailModel";
import { RubberFarmRepository } from "../repositories/RubberFarmRepository";
import { PlantingDetailRepository } from "../repositories/PlantingDetailRepository";

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

  constructor(
    rubberFarmRepository: RubberFarmRepository,
    plantingDetailRepository: PlantingDetailRepository
  ) {
    super(rubberFarmRepository);
    this.rubberFarmRepository = rubberFarmRepository;
    this.plantingDetailRepository = plantingDetailRepository;
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
    }>
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
    farmData: Partial<RubberFarmModel>
  ): Promise<RubberFarmModel | null> {
    try {
      return await this.update(rubberFarmId, farmData);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  /**
   * Update a planting detail record
   * @param plantingDetailId - ID of the planting detail to update
   * @param detailData - New data for the planting detail
   * @returns Updated planting detail or null if failed
   */
  async updatePlantingDetail(
    plantingDetailId: number,
    detailData: PlantingDetailUpdateData
  ): Promise<PlantingDetailModel | null> {
    try {
      // Check if the planting detail exists
      const existingDetail = await this.plantingDetailRepository.findById(
        plantingDetailId
      );
      if (!existingDetail) {
        throw new Error("Planting detail not found");
      }

      // Check if the detail belongs to the farm
      if (
        detailData.rubberFarmId &&
        existingDetail.rubberFarmId !== detailData.rubberFarmId
      ) {
        throw new Error("Planting detail does not belong to this farm");
      }

      // Create an update data object with the correct type
      const updatedData: PlantingDetailUpdateData = {
        specie: detailData.specie || existingDetail.specie,
        areaOfPlot: detailData.areaOfPlot || existingDetail.areaOfPlot,
        numberOfRubber:
          detailData.numberOfRubber || existingDetail.numberOfRubber,
        numberOfTapping:
          detailData.numberOfTapping || existingDetail.numberOfTapping,
        ageOfRubber: detailData.ageOfRubber || existingDetail.ageOfRubber,
        totalProduction:
          detailData.totalProduction || existingDetail.totalProduction,
      };

      // Only update dates if they are provided
      if (detailData.yearOfTapping) {
        updatedData.yearOfTapping = new Date(detailData.yearOfTapping);
      }

      if (detailData.monthOfTapping) {
        updatedData.monthOfTapping = new Date(detailData.monthOfTapping);
      }

      // Update the planting detail
      return await this.plantingDetailRepository.update(
        plantingDetailId,
        updatedData
      );
    } catch (error) {
      console.error("Error updating planting detail:", error);
      return null;
    }
  }

  /**
   * Create a new planting detail record
   * @param detailData - Data for the new planting detail
   * @returns Created planting detail or null if failed
   */
  async createPlantingDetail(
    detailData: PlantingDetailUpdateData
  ): Promise<PlantingDetailModel | null> {
    try {
      // Check if the farm exists
      if (!detailData.rubberFarmId) {
        throw new Error("Rubber farm ID is required");
      }

      const farm = await this.rubberFarmRepository.findById(
        detailData.rubberFarmId
      );
      if (!farm) {
        throw new Error("Rubber farm not found");
      }

      // Make sure dates are properly formatted
      const yearOfTapping = detailData.yearOfTapping
        ? new Date(detailData.yearOfTapping)
        : new Date();
      const monthOfTapping = detailData.monthOfTapping
        ? new Date(detailData.monthOfTapping)
        : new Date();

      // Create a planting detail model using the static factory method
      const plantingDetailModel = PlantingDetailModel.create(
        detailData.rubberFarmId,
        detailData.specie || "",
        detailData.areaOfPlot || 0,
        detailData.numberOfRubber || 0,
        detailData.numberOfTapping || 0,
        detailData.ageOfRubber || 0,
        yearOfTapping,
        monthOfTapping,
        detailData.totalProduction || 0
      );

      // Create the planting detail using the repository
      return await this.plantingDetailRepository.create(plantingDetailModel);
    } catch (error) {
      console.error("Error creating planting detail:", error);
      return null;
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
