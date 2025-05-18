import {
  PrismaClient,
  InspectionTypeMaster as PrismaInspectionTypeMaster,
} from "@prisma/client";

import { InspectionTypeMasterModel } from "@/models/InspectionTypeMaster";
import { BaseMapper } from "./BaseMapper";

export class InspectionTypeMasterMapper
  implements BaseMapper<PrismaInspectionTypeMaster, InspectionTypeMasterModel>
{
  toDomain(
    prismaEntity: PrismaInspectionTypeMaster
  ): InspectionTypeMasterModel {
    return new InspectionTypeMasterModel(
      prismaEntity.inspectionTypeId,
      prismaEntity.typeName,
      prismaEntity.description,
      prismaEntity.createdAt,
      prismaEntity.updatedAt
    );
  }

  toPrisma(domainEntity: InspectionTypeMasterModel): any {
    return {
      typeName: domainEntity.typeName,
      description: domainEntity.description,
    };
  }
}
