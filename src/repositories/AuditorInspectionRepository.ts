import { AuditorInspection as PrismaAuditorInspection } from "@prisma/client";
import { BaseMapper } from "../mappers/BaseMapper";
import { AuditorInspectionModel } from "../models/AuditorInspectionModel";
import { BaseRepository } from "./BaseRepository";

export class AuditorInspectionRepository extends BaseRepository<AuditorInspectionModel> {
  constructor(mapper: BaseMapper<any, AuditorInspectionModel>) {
    super(mapper);
  }

  async create(model: AuditorInspectionModel): Promise<AuditorInspectionModel> {
    try {
      const auditorInspection = await this.prisma.auditorInspection.create({
        data: {
          auditorId: model.auditorId,
          inspectionId: model.inspectionId,
        },
      });

      return this.mapToModel(auditorInspection);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<AuditorInspectionModel | null> {
    try {
      const auditorInspection = await this.prisma.auditorInspection.findUnique({
        where: { auditorInspectionId: id },
      });

      return auditorInspection ? this.mapToModel(auditorInspection) : null;
    } catch (error) {
      console.error("Error finding auditor inspection by ID:", error);
      return null;
    }
  }

  async findByAuditorId(auditorId: number): Promise<AuditorInspectionModel[]> {
    try {
      const auditorInspections = await this.prisma.auditorInspection.findMany({
        where: { auditorId },
      });

      return auditorInspections.map((ai) => this.mapToModel(ai));
    } catch (error) {
      console.error("Error finding auditor inspections by auditor ID:", error);
      return [];
    }
  }

  async findByInspectionId(
    inspectionId: number
  ): Promise<AuditorInspectionModel[]> {
    try {
      const auditorInspections = await this.prisma.auditorInspection.findMany({
        where: { inspectionId },
      });

      return auditorInspections.map((ai) => this.mapToModel(ai));
    } catch (error) {
      console.error(
        "Error finding auditor inspections by inspection ID:",
        error
      );
      return [];
    }
  }

  async findAll(): Promise<AuditorInspectionModel[]> {
    try {
      const auditorInspections = await this.prisma.auditorInspection.findMany();
      return auditorInspections.map((ai) => this.mapToModel(ai));
    } catch (error) {
      console.error("Error finding all auditor inspections:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<AuditorInspectionModel>
  ): Promise<AuditorInspectionModel | null> {
    try {
      const updatedAuditorInspection =
        await this.prisma.auditorInspection.update({
          where: { auditorInspectionId: id },
          data: {
            auditorId: data.auditorId,
            inspectionId: data.inspectionId,
            updatedAt: new Date(),
          },
        });

      return this.mapToModel(updatedAuditorInspection);
    } catch (error) {
      console.error("Error updating auditor inspection:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.auditorInspection.delete({
        where: { auditorInspectionId: id },
      });

      return true;
    } catch (error) {
      console.error("Error deleting auditor inspection:", error);
      return false;
    }
  }

  private mapToModel(
    prismaAuditorInspection: PrismaAuditorInspection
  ): AuditorInspectionModel {
    return this.mapper.toDomain(prismaAuditorInspection);
  }
}
