import { RubberFarm as PrismaRubberFarm } from "@prisma/client";
import { RubberFarmModel } from "@/models/RubberFarmModel";
import { BaseMapper } from "./BaseMapper";
import { PlantingDetailMapper } from "./PlantingDetailMapper";

export class RubberFarmMapper implements BaseMapper<any, RubberFarmModel> {
  private plantingDetailMapper: PlantingDetailMapper;

  constructor(plantingDetailMapper: PlantingDetailMapper) {
    this.plantingDetailMapper = plantingDetailMapper;
  }

  toDomain(prismaEntity: any): RubberFarmModel {
    const rubberFarmModel = new RubberFarmModel(
      prismaEntity.rubberFarmId,
      prismaEntity.farmerId,
      prismaEntity.villageName,
      prismaEntity.moo,
      prismaEntity.road,
      prismaEntity.alley,
      prismaEntity.subDistrict,
      prismaEntity.district,
      prismaEntity.province,
      prismaEntity.location,
      prismaEntity.productDistributionType,
      prismaEntity.plantingDetails
        ? prismaEntity.plantingDetails.map((detail: any) =>
            this.plantingDetailMapper.toDomain(detail)
          )
        : [],
      prismaEntity.createdAt,
      prismaEntity.updatedAt,
      prismaEntity.version
    );

    return rubberFarmModel;
  }

  toPrisma(domainEntity: RubberFarmModel): any {
    return {
      farmerId: domainEntity.farmerId,
      villageName: domainEntity.villageName,
      moo: domainEntity.moo,
      road: domainEntity.road,
      alley: domainEntity.alley,
      subDistrict: domainEntity.subDistrict,
      district: domainEntity.district,
      province: domainEntity.province,
      location: domainEntity.location,
      productDistributionType: domainEntity.productDistributionType,
    };
  }
}
