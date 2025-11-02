import { PlantingDetail as PrismaPlantingDetail } from "@prisma/client";
import { PlantingDetailModel } from "@/models/PlantingDetailModel";
import { BaseMapper } from "./BaseMapper";

export class PlantingDetailMapper
  implements BaseMapper<PrismaPlantingDetail, PlantingDetailModel>
{
  toDomain(prismaEntity: PrismaPlantingDetail): PlantingDetailModel {
    return new PlantingDetailModel(
      prismaEntity.plantingDetailId,
      prismaEntity.rubberFarmId,
      prismaEntity.specie,
      prismaEntity.areaOfPlot,
      prismaEntity.numberOfRubber,
      prismaEntity.numberOfTapping,
      prismaEntity.ageOfRubber,
      prismaEntity.yearOfTapping,
      prismaEntity.monthOfTapping,
      prismaEntity.totalProduction,
      prismaEntity.createdAt,
      prismaEntity.updatedAt,
      prismaEntity.version
    );
  }

  toPrisma(domainEntity: PlantingDetailModel): any {
    return {
      rubberFarmId: domainEntity.rubberFarmId,
      specie: domainEntity.specie,
      areaOfPlot: domainEntity.areaOfPlot,
      numberOfRubber: domainEntity.numberOfRubber,
      numberOfTapping: domainEntity.numberOfTapping,
      ageOfRubber: domainEntity.ageOfRubber,
      yearOfTapping: domainEntity.yearOfTapping,
      monthOfTapping: domainEntity.monthOfTapping,
      totalProduction: domainEntity.totalProduction,
    };
  }
}
