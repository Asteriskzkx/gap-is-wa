import { AuditLogModel } from "@/models/AuditLogModel";
import { BaseMapper } from "./BaseMapper";

export class AuditLogMapper implements BaseMapper<any, AuditLogModel> {
  toDomain(prismaEntity: any): AuditLogModel {
    const model = new AuditLogModel(
      prismaEntity.auditLogId,
      prismaEntity.tableName,
      prismaEntity.action,
      prismaEntity.recordId,
      new Date(prismaEntity.createdAt),
      new Date(prismaEntity.createdAt) // AuditLog ไม่มี updatedAt
    );

    model.userId = prismaEntity.userId ?? undefined;
    model.oldData = prismaEntity.oldData ?? undefined;
    model.newData = prismaEntity.newData ?? undefined;

    return model;
  }

  toPrisma(domainEntity: AuditLogModel): any {
    return {
      tableName: domainEntity.tableName,
      action: domainEntity.action,
      recordId: domainEntity.recordId,
      userId: domainEntity.userId ?? null,
      oldData: domainEntity.oldData ?? null,
      newData: domainEntity.newData ?? null,
    };
  }
}
