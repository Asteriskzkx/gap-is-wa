import { BaseMapper } from "./BaseMapper";
import { CertificateModel } from "@/models/CertificateModel";

export class CertificateMapper implements BaseMapper<any, CertificateModel> {
  toDomain(prismaEntity: any): CertificateModel {
    return new CertificateModel(
      prismaEntity.certificateId,
      prismaEntity.inspectionId,
      prismaEntity.pdfFileUrl,
      prismaEntity.createdAt,
      prismaEntity.updatedAt,
      prismaEntity.version
    );
  }

  toPrisma(domainEntity: CertificateModel): any {
    return {
      inspectionId: domainEntity.inspectionId,
      pdfFileUrl: domainEntity.pdfFileUrl,
      version: domainEntity.version,
    };
  }
}
