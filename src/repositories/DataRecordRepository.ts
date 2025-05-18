import { PrismaClient, DataRecord as PrismaDataRecord } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { DataRecordModel } from "../models/DataRecordModel";

export class DataRecordRepository extends BaseRepository<DataRecordModel> {
  async create(model: DataRecordModel): Promise<DataRecordModel> {
    try {
      const dataRecord = await this.prisma.dataRecord.create({
        data: {
          inspectionId: model.inspectionId,
          species: model.species,
          waterSystem: model.waterSystem,
          fertilizers: model.fertilizers,
          previouslyCultivated: model.previouslyCultivated,
          plantDisease: model.plantDisease,
          relatedPlants: model.relatedPlants,
          moreInfo: model.moreInfo,
          map: model.map,
        },
      });

      return this.mapToModel(dataRecord);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<DataRecordModel | null> {
    try {
      const dataRecord = await this.prisma.dataRecord.findUnique({
        where: { dataRecordId: id },
      });

      return dataRecord ? this.mapToModel(dataRecord) : null;
    } catch (error) {
      console.error("Error finding data record by ID:", error);
      return null;
    }
  }

  async findByInspectionId(
    inspectionId: number
  ): Promise<DataRecordModel | null> {
    try {
      const dataRecord = await this.prisma.dataRecord.findUnique({
        where: { inspectionId },
      });

      return dataRecord ? this.mapToModel(dataRecord) : null;
    } catch (error) {
      console.error("Error finding data record by inspection ID:", error);
      return null;
    }
  }

  async findAll(): Promise<DataRecordModel[]> {
    try {
      const dataRecords = await this.prisma.dataRecord.findMany();
      return dataRecords.map((record) => this.mapToModel(record));
    } catch (error) {
      console.error("Error finding all data records:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<DataRecordModel>
  ): Promise<DataRecordModel | null> {
    try {
      const updatedDataRecord = await this.prisma.dataRecord.update({
        where: { dataRecordId: id },
        data: {
          species: data.species,
          waterSystem: data.waterSystem,
          fertilizers: data.fertilizers,
          previouslyCultivated: data.previouslyCultivated,
          plantDisease: data.plantDisease,
          relatedPlants: data.relatedPlants,
          moreInfo: data.moreInfo,
          map: data.map,
          updatedAt: new Date(),
        },
      });

      return this.mapToModel(updatedDataRecord);
    } catch (error) {
      console.error("Error updating data record:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.dataRecord.delete({
        where: { dataRecordId: id },
      });

      return true;
    } catch (error) {
      console.error("Error deleting data record:", error);
      return false;
    }
  }

  private mapToModel(prismaDataRecord: PrismaDataRecord): DataRecordModel {
    return new DataRecordModel(
      prismaDataRecord.dataRecordId,
      prismaDataRecord.inspectionId,
      prismaDataRecord.species,
      prismaDataRecord.waterSystem,
      prismaDataRecord.fertilizers,
      prismaDataRecord.previouslyCultivated,
      prismaDataRecord.plantDisease,
      prismaDataRecord.relatedPlants,
      prismaDataRecord.moreInfo,
      prismaDataRecord.map,
      prismaDataRecord.createdAt,
      prismaDataRecord.updatedAt
    );
  }
}
