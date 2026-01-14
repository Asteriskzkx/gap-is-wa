import { AuditorInspectionModel } from "@/models/AuditorInspectionModel";
import { BaseMapper } from "./BaseMapper";

export class AuditorInspectionMapper
  implements BaseMapper<any, AuditorInspectionModel>
{
  toDomain(prismaEntity: any): AuditorInspectionModel {
    const model = new AuditorInspectionModel(
      prismaEntity.auditorInspectionId,
      prismaEntity.auditorId,
      prismaEntity.inspectionId,
      prismaEntity.createdAt,
      prismaEntity.updatedAt
    );

    if (prismaEntity?.auditor) {
      model.auditor = prismaEntity.auditor;
    }

    return model;
  }

  toPrisma(domainEntity: AuditorInspectionModel): any {
    return {
      auditorId: domainEntity.auditorId,
      inspectionId: domainEntity.inspectionId,
    };
  }
}
