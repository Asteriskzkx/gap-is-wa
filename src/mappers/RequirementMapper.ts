import { Requirement as PrismaRequirement } from "@prisma/client";
import { RequirementModel } from "@/models/RequirementModel";
import { BaseMapper } from "./BaseMapper";

export class RequirementMapper
  implements BaseMapper<PrismaRequirement, RequirementModel>
{
  toDomain(prismaEntity: PrismaRequirement): RequirementModel {
    return new RequirementModel(
      prismaEntity.requirementId,
      prismaEntity.inspectionItemId,
      prismaEntity.requirementMasterId,
      prismaEntity.requirementNo,
      prismaEntity.evaluationResult,
      prismaEntity.evaluationMethod,
      prismaEntity.note,
      prismaEntity.createdAt,
      prismaEntity.updatedAt
    );
  }

  toPrisma(domainEntity: RequirementModel): any {
    return {
      inspectionItemId: domainEntity.inspectionItemId,
      requirementMasterId: domainEntity.requirementMasterId,
      requirementNo: domainEntity.requirementNo,
      evaluationResult: domainEntity.evaluationResult,
      evaluationMethod: domainEntity.evaluationMethod,
      note: domainEntity.note,
    };
  }
}
