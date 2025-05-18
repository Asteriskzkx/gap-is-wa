// src/mappers/InspectionMapper.ts
import { Inspection as PrismaInspection } from "@prisma/client";
import { InspectionModel } from "@/models/InspectionModel";
import { AuditorInspectionMapper } from "./AuditorInspectionMapper";
import { InspectionItemMapper } from "./InspectionItemMapper";
import { DataRecordMapper } from "./DataRecordMapper";
import { AdviceAndDefectMapper } from "./AdviceAndDefectMapper";
import { BaseMapper } from "./BaseMapper";

export class InspectionMapper
  implements BaseMapper<PrismaInspection, InspectionModel>
{
  private auditorInspectionMapper: AuditorInspectionMapper;
  private inspectionItemMapper: InspectionItemMapper;
  private dataRecordMapper: DataRecordMapper;
  private adviceAndDefectMapper: AdviceAndDefectMapper;

  constructor(
    auditorInspectionMapper: AuditorInspectionMapper,
    inspectionItemMapper: InspectionItemMapper,
    dataRecordMapper: DataRecordMapper,
    adviceAndDefectMapper: AdviceAndDefectMapper
  ) {
    this.auditorInspectionMapper = auditorInspectionMapper;
    this.inspectionItemMapper = inspectionItemMapper;
    this.dataRecordMapper = dataRecordMapper;
    this.adviceAndDefectMapper = adviceAndDefectMapper;
  }

  toDomain(prismaEntity: any): InspectionModel {
    const inspectionModel = new InspectionModel(
      prismaEntity.inspectionId,
      prismaEntity.inspectionNo,
      prismaEntity.inspectionDateAndTime,
      prismaEntity.inspectionTypeId,
      prismaEntity.inspectionStatus,
      prismaEntity.inspectionResult,
      prismaEntity.auditorChiefId,
      prismaEntity.rubberFarmId,
      prismaEntity.createdAt,
      prismaEntity.updatedAt
    );

    // Map relations if they exist
    if (prismaEntity.auditorInspections) {
      inspectionModel.auditorInspections = prismaEntity.auditorInspections.map(
        (ai: any) => this.auditorInspectionMapper.toDomain(ai)
      );
    }

    if (prismaEntity.inspectionItems) {
      inspectionModel.inspectionItems = prismaEntity.inspectionItems.map(
        (item: any) => this.inspectionItemMapper.toDomain(item)
      );
    }

    if (prismaEntity.dataRecord) {
      inspectionModel.dataRecord = this.dataRecordMapper.toDomain(
        prismaEntity.dataRecord
      );
    }

    if (prismaEntity.adviceAndDefect) {
      inspectionModel.adviceAndDefect = this.adviceAndDefectMapper.toDomain(
        prismaEntity.adviceAndDefect
      );
    }

    return inspectionModel;
  }

  toPrisma(domainEntity: InspectionModel): any {
    // สำหรับการสร้างหรืออัพเดต Prisma entity
    return {
      inspectionNo: domainEntity.inspectionNo,
      inspectionDateAndTime: domainEntity.inspectionDateAndTime,
      inspectionTypeId: domainEntity.inspectionTypeId,
      inspectionStatus: domainEntity.inspectionStatus,
      inspectionResult: domainEntity.inspectionResult,
      auditorChiefId: domainEntity.auditorChiefId,
      rubberFarmId: domainEntity.rubberFarmId,
    };
  }
}
