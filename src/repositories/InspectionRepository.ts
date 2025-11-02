import { PrismaClient, Inspection as PrismaInspection } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { InspectionModel } from "../models/InspectionModel";
import { BaseMapper } from "../mappers/BaseMapper";

export class InspectionRepository extends BaseRepository<InspectionModel> {
  constructor(mapper: BaseMapper<any, InspectionModel>) {
    super(mapper);
  }

  async create(model: InspectionModel): Promise<InspectionModel> {
    try {
      const inspection = await this.prisma.inspection.create({
        data: {
          inspectionNo: model.inspectionNo,
          inspectionDateAndTime: model.inspectionDateAndTime,
          inspectionTypeId: model.inspectionTypeId,
          inspectionStatus: model.inspectionStatus,
          inspectionResult: model.inspectionResult,
          auditorChiefId: model.auditorChiefId,
          rubberFarmId: model.rubberFarmId,
        },
        include: {
          auditorInspections: true,
          inspectionItems: {
            include: {
              requirements: true,
            },
          },
          dataRecord: true,
          adviceAndDefect: true,
        },
      });

      return this.mapToModel(inspection);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<InspectionModel | null> {
    try {
      const inspection = await this.prisma.inspection.findUnique({
        where: { inspectionId: id },
        include: {
          auditorInspections: true,
          inspectionItems: {
            include: {
              requirements: true,
            },
          },
          dataRecord: true,
          adviceAndDefect: true,
        },
      });

      return inspection ? this.mapToModel(inspection) : null;
    } catch (error) {
      console.error("Error finding inspection by ID:", error);
      return null;
    }
  }

  async findByRubberFarmId(rubberFarmId: number): Promise<InspectionModel[]> {
    try {
      const inspections = await this.prisma.inspection.findMany({
        where: { rubberFarmId },
        include: {
          inspectionType: true,
          rubberFarm: {
            include: {
              farmer: true,
            },
          },
          auditorChief: true,
          auditorInspections: {
            include: {
              auditor: true,
            },
          },
          inspectionItems: {
            include: {
              inspectionItemMaster: true,
              requirements: {
                include: {
                  requirementMaster: true,
                },
              },
            },
          },
          dataRecord: true,
          adviceAndDefect: true,
        },
      });

      return inspections.map((inspection) => this.mapToModel(inspection));
    } catch (error) {
      console.error("Error finding inspections by rubber farm ID:", error);
      return [];
    }
  }

  async findByAuditorId(auditorId: number): Promise<InspectionModel[]> {
    try {
      const inspections = await this.prisma.inspection.findMany({
        where: {
          OR: [
            { auditorChiefId: auditorId },
            { auditorInspections: { some: { auditorId } } },
          ],
        },
        include: {
          inspectionType: true,
          rubberFarm: {
            include: {
              farmer: true,
            },
          },
          auditorChief: true,
          auditorInspections: {
            include: {
              auditor: true,
            },
          },
          inspectionItems: {
            include: {
              inspectionItemMaster: true,
              requirements: {
                include: {
                  requirementMaster: true,
                },
              },
            },
          },
          dataRecord: true,
          adviceAndDefect: true,
        },
      });

      return inspections.map((inspection) => this.mapToModel(inspection));
    } catch (error) {
      console.error("Error finding inspections by auditor ID:", error);
      return [];
    }
  }

  async findAll(): Promise<InspectionModel[]> {
    try {
      const inspections = await this.prisma.inspection.findMany({
        include: {
          inspectionType: true,
          rubberFarm: {
            include: {
              farmer: true,
            },
          },
          auditorChief: true,
          auditorInspections: {
            include: {
              auditor: true,
            },
          },
          inspectionItems: {
            include: {
              inspectionItemMaster: true,
              requirements: {
                include: {
                  requirementMaster: true,
                },
              },
            },
          },
          dataRecord: true,
          adviceAndDefect: true,
        },
      });

      return inspections.map((inspection) => this.mapToModel(inspection));
    } catch (error) {
      console.error("Error finding all inspections:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<InspectionModel>
  ): Promise<InspectionModel | null> {
    try {
      const updatedInspection = await this.prisma.inspection.update({
        where: { inspectionId: id },
        data: {
          inspectionNo: data.inspectionNo,
          inspectionDateAndTime: data.inspectionDateAndTime,
          inspectionTypeId: data.inspectionTypeId,
          inspectionStatus: data.inspectionStatus,
          inspectionResult: data.inspectionResult,
          auditorChiefId: data.auditorChiefId,
          rubberFarmId: data.rubberFarmId,
          updatedAt: new Date(),
        },
        include: {
          auditorInspections: true,
          inspectionItems: {
            include: {
              requirements: true,
            },
          },
          dataRecord: true,
          adviceAndDefect: true,
        },
      });

      return this.mapToModel(updatedInspection);
    } catch (error) {
      console.error("Error updating inspection:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.inspection.delete({
        where: { inspectionId: id },
      });

      return true;
    } catch (error) {
      console.error("Error deleting inspection:", error);
      return false;
    }
  }

  private mapToModel(prismaInspection: any): InspectionModel {
    return this.mapper.toDomain(prismaInspection);
  }
}
