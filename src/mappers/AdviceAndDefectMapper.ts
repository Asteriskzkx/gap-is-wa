import { AdviceAndDefect as PrismaAdviceAndDefect } from "@prisma/client";
import { AdviceAndDefectModel } from "@/models/AdviceAndDefectModel";
import { BaseMapper } from "./BaseMapper";

export class AdviceAndDefectMapper
  implements BaseMapper<PrismaAdviceAndDefect, AdviceAndDefectModel>
{
  toDomain(prismaEntity: PrismaAdviceAndDefect): AdviceAndDefectModel {
    return new AdviceAndDefectModel(
      prismaEntity.adviceAndDefectId,
      prismaEntity.inspectionId,
      prismaEntity.date,
      prismaEntity.adviceList,
      prismaEntity.defectList,
      prismaEntity.createdAt,
      prismaEntity.updatedAt
    );
  }

  toPrisma(domainEntity: AdviceAndDefectModel): any {
    return {
      inspectionId: domainEntity.inspectionId,
      date: domainEntity.date,
      adviceList: domainEntity.adviceList,
      defectList: domainEntity.defectList,
    };
  }
}
