import { DataRecord as PrismaDataRecord } from "@prisma/client";
import { DataRecordModel } from "@/models/DataRecordModel";
import { BaseMapper } from "./BaseMapper";

export class DataRecordMapper
  implements BaseMapper<PrismaDataRecord, DataRecordModel>
{
  toDomain(prismaEntity: PrismaDataRecord): DataRecordModel {
    return new DataRecordModel(
      prismaEntity.dataRecordId,
      prismaEntity.inspectionId,
      prismaEntity.species,
      prismaEntity.waterSystem,
      prismaEntity.fertilizers,
      prismaEntity.previouslyCultivated,
      prismaEntity.plantDisease,
      prismaEntity.relatedPlants,
      prismaEntity.moreInfo,
      prismaEntity.map,
      prismaEntity.createdAt,
      prismaEntity.updatedAt
    );
  }

  toPrisma(domainEntity: DataRecordModel): any {
    return {
      inspectionId: domainEntity.inspectionId,
      species: domainEntity.species,
      waterSystem: domainEntity.waterSystem,
      fertilizers: domainEntity.fertilizers,
      previouslyCultivated: domainEntity.previouslyCultivated,
      plantDisease: domainEntity.plantDisease,
      relatedPlants: domainEntity.relatedPlants,
      moreInfo: domainEntity.moreInfo,
      map: domainEntity.map,
    };
  }
}
