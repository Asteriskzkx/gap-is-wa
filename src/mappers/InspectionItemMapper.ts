import { InspectionItem as PrismaInspectionItem } from "@prisma/client";
import { InspectionItemModel } from "@/models/InspectionItemModel";
import { BaseMapper } from "./BaseMapper";
import { RequirementMapper } from "./RequirementMapper";

export class InspectionItemMapper
  implements BaseMapper<any, InspectionItemModel>
{
  private requirementMapper: RequirementMapper;

  constructor(requirementMapper: RequirementMapper) {
    this.requirementMapper = requirementMapper;
  }

  toDomain(prismaEntity: any): InspectionItemModel {
    const inspectionItemModel = new InspectionItemModel(
      prismaEntity.inspectionItemId,
      prismaEntity.inspectionId,
      prismaEntity.inspectionItemMasterId,
      prismaEntity.inspectionItemNo,
      prismaEntity.inspectionItemResult,
      prismaEntity.otherConditions,
      prismaEntity.createdAt,
      prismaEntity.updatedAt
    );

    if (prismaEntity.requirements) {
      inspectionItemModel.requirements = prismaEntity.requirements.map(
        (req: any) => this.requirementMapper.toDomain(req)
      );
    }

    return inspectionItemModel;
  }

  toPrisma(domainEntity: InspectionItemModel): any {
    return {
      inspectionId: domainEntity.inspectionId,
      inspectionItemMasterId: domainEntity.inspectionItemMasterId,
      inspectionItemNo: domainEntity.inspectionItemNo,
      inspectionItemResult: domainEntity.inspectionItemResult,
      otherConditions: domainEntity.otherConditions,
    };
  }
}
