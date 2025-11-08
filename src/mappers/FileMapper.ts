import { BaseMapper } from "./BaseMapper";
import { FileModel } from "@/models/FileModel";

export class FileMapper implements BaseMapper<any, FileModel> {
  toDomain(prismaEntity: any): FileModel {
    const m = new FileModel(
      prismaEntity.fileId,
      prismaEntity.tableReference,
      prismaEntity.idReference,
      prismaEntity.fileName,
      prismaEntity.url,
      new Date(prismaEntity.createdAt),
      new Date(prismaEntity.updatedAt)
    );

    m.mimeType = prismaEntity.mimeType ?? undefined;
    m.size = prismaEntity.size ?? undefined;
    m.version = prismaEntity.version ?? undefined;

    return m;
  }

  toPrisma(domainEntity: FileModel): any {
    return {
      tableReference: domainEntity.tableReference,
      idReference: domainEntity.idReference,
      fileName: domainEntity.fileName,
      mimeType: domainEntity.mimeType ?? undefined,
      url: domainEntity.url,
      size: domainEntity.size ?? undefined,
      version: domainEntity.version ?? undefined,
    };
  }
}
