import { AuditorInspection as PrismaAuditorInspection } from "@prisma/client";
import { AuditorInspectionModel } from "@/models/AuditorInspectionModel";
import { BaseMapper } from "./BaseMapper";

export class AuditorInspectionMapper
  implements BaseMapper<PrismaAuditorInspection, AuditorInspectionModel>
{
  toDomain(prismaEntity: PrismaAuditorInspection): AuditorInspectionModel {
    return new AuditorInspectionModel(
      prismaEntity.auditorInspectionId,
      prismaEntity.auditorId,
      prismaEntity.inspectionId,
      prismaEntity.createdAt,
      prismaEntity.updatedAt
    );
  }

  toPrisma(domainEntity: AuditorInspectionModel): any {
    return {
      auditorId: domainEntity.auditorId,
      inspectionId: domainEntity.inspectionId,
    };
  }
}
