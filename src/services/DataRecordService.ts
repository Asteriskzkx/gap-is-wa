import { BaseService } from "./BaseService";
import { DataRecordModel } from "../models/DataRecordModel";
import { DataRecordRepository } from "../repositories/DataRecordRepository";

export class DataRecordService extends BaseService<DataRecordModel> {
  private dataRecordRepository: DataRecordRepository;

  constructor(dataRecordRepository: DataRecordRepository) {
    super(dataRecordRepository);
    this.dataRecordRepository = dataRecordRepository;
  }

  async createDataRecord(dataRecordData: {
    inspectionId: number;
    species: any;
    waterSystem: any;
    fertilizers: any;
    previouslyCultivated: any;
    plantDisease: any;
    relatedPlants: any;
    moreInfo: string;
    map: any;
  }): Promise<DataRecordModel> {
    try {
      // Check if a data record already exists for this inspection
      const existingRecord = await this.dataRecordRepository.findByInspectionId(
        dataRecordData.inspectionId
      );
      if (existingRecord) {
        throw new Error("Data record already exists for this inspection");
      }

      const dataRecordModel = DataRecordModel.create(
        dataRecordData.inspectionId,
        dataRecordData.species,
        dataRecordData.waterSystem,
        dataRecordData.fertilizers,
        dataRecordData.previouslyCultivated,
        dataRecordData.plantDisease,
        dataRecordData.relatedPlants,
        dataRecordData.moreInfo,
        dataRecordData.map
      );

      return await this.create(dataRecordModel);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getDataRecordByInspectionId(
    inspectionId: number
  ): Promise<DataRecordModel | null> {
    try {
      return await this.dataRecordRepository.findByInspectionId(inspectionId);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async updateDataRecord(
    dataRecordId: number,
    data: Partial<DataRecordModel>
  ): Promise<DataRecordModel | null> {
    try {
      return await this.update(dataRecordId, data);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async deleteDataRecord(dataRecordId: number): Promise<boolean> {
    try {
      return await this.delete(dataRecordId);
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }
}
