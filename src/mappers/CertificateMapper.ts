import { BaseMapper } from "./BaseMapper";
import { CertificateModel } from "@/models/CertificateModel";

export class CertificateMapper implements BaseMapper<any, CertificateModel> {
  toDomain(prismaEntity: any): CertificateModel {
    const model = new CertificateModel(
      prismaEntity.certificateId,
      prismaEntity.inspectionId,
      new Date(prismaEntity.effectiveDate),
      new Date(prismaEntity.expiryDate),
      {
        createdAt: prismaEntity.createdAt,
        updatedAt: prismaEntity.updatedAt,
        cancelRequestFlag: prismaEntity.cancelRequestFlag ?? false,
        activeFlag: prismaEntity.activeFlag ?? true,
        version: prismaEntity.version,
      }
    );

    if (prismaEntity.inspection) {
      model.inspection = prismaEntity.inspection;
    }

    return model;
  }

  toPrisma(domainEntity: CertificateModel): any {
    return {
      inspectionId: domainEntity.inspectionId,
      effectiveDate: domainEntity.effectiveDate,
      expiryDate: domainEntity.expiryDate,
      cancelRequestFlag: domainEntity.cancelRequestFlag,
      activeFlag: domainEntity.activeFlag,
      version: domainEntity.version,
    };
  }
}
