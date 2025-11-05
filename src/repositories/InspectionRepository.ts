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

  async findByAuditorIdWithPagination(
    auditorId: number,
    options?: {
      inspectionNo?: string;
      inspectionStatus?: string;
      inspectionResult?: string;
      province?: string;
      district?: string;
      subDistrict?: string;
      sortField?: string;
      sortOrder?: "asc" | "desc";
      multiSortMeta?: Array<{ field: string; order: number }>;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ data: InspectionModel[]; total: number }> {
    try {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;

      // Build where clause
      const whereClause: any = {
        OR: [
          { auditorChiefId: auditorId },
          { auditorInspections: { some: { auditorId } } },
        ],
      };

      // Add filters
      if (options?.inspectionNo) {
        whereClause.inspectionNo = {
          contains: options.inspectionNo,
        };
      }

      if (options?.inspectionStatus) {
        whereClause.inspectionStatus = options.inspectionStatus;
      }

      if (options?.inspectionResult) {
        whereClause.inspectionResult = options.inspectionResult;
      }

      // Filter by location (province, district, subDistrict)
      if (options?.province || options?.district || options?.subDistrict) {
        whereClause.rubberFarm = {
          ...(options.province && { province: options.province }),
          ...(options.district && { district: options.district }),
          ...(options.subDistrict && { subDistrict: options.subDistrict }),
        };
      }

      // Build orderBy clause - handle nested relations
      const mapSortFieldToPrisma = (field: string, order: "asc" | "desc") => {
        // Map nested fields to Prisma's orderBy syntax
        switch (field) {
          case "rubberFarm.farmer":
            return {
              rubberFarm: {
                farmer: {
                  firstName: order,
                },
              },
            };
          case "rubberFarm.province":
            return {
              rubberFarm: {
                province: order,
              },
            };
          case "rubberFarm.district":
            return {
              rubberFarm: {
                district: order,
              },
            };
          case "inspectionType.typeName":
            return {
              inspectionType: {
                typeName: order,
              },
            };
          default:
            // For direct fields (inspectionNo, inspectionDateAndTime, inspectionStatus, etc.)
            return { [field]: order };
        }
      };

      let orderBy: any = {};

      if (options?.multiSortMeta && options.multiSortMeta.length > 0) {
        // Handle multiple sorts
        orderBy = options.multiSortMeta.map((sort) => {
          const order = sort.order === 1 ? "asc" : "desc";
          return mapSortFieldToPrisma(sort.field, order);
        });
      } else if (options?.sortField) {
        // Handle single sort
        const order = options.sortOrder || "asc";
        orderBy = mapSortFieldToPrisma(options.sortField, order);
      } else {
        // Default sort
        orderBy = { inspectionDateAndTime: "desc" };
      }

      // Get total count
      const total = await this.prisma.inspection.count({
        where: whereClause,
      });

      // Get paginated data
      const inspections = await this.prisma.inspection.findMany({
        where: whereClause,
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
        orderBy,
        skip: offset,
        take: limit,
      });

      return {
        data: inspections.map((inspection) => this.mapToModel(inspection)),
        total,
      };
    } catch (error) {
      console.error(
        "Error finding inspections by auditor ID with pagination:",
        error
      );
      return { data: [], total: 0 };
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

  /**
   * Update inspection with optimistic locking
   */
  async updateWithLock(
    id: number,
    data: Partial<InspectionModel>,
    currentVersion: number
  ): Promise<InspectionModel> {
    return this.updateWithOptimisticLock(
      id,
      data,
      currentVersion,
      "inspection"
    );
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
