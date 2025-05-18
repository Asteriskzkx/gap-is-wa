import { InspectionTypeMasterModel } from "@/models/InspectionTypeMaster";
import { InspectionTypeMaster as PrismaInspectionTypeMaster } from "@prisma/client";
import { BaseMapper } from "../mappers/BaseMapper";
import { BaseRepository } from "./BaseRepository";

export class InspectionTypeMasterRepository extends BaseRepository<InspectionTypeMasterModel> {
  constructor(mapper: BaseMapper<any, InspectionTypeMasterModel>) {
    super(mapper);
  }

  async create(
    model: InspectionTypeMasterModel
  ): Promise<InspectionTypeMasterModel> {
    try {
      const inspectionType = await this.prisma.inspectionTypeMaster.create({
        data: {
          typeName: model.typeName,
          description: model.description,
        },
      });

      return this.mapToModel(inspectionType);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<InspectionTypeMasterModel | null> {
    try {
      const inspectionType = await this.prisma.inspectionTypeMaster.findUnique({
        where: { inspectionTypeId: id },
      });

      return inspectionType ? this.mapToModel(inspectionType) : null;
    } catch (error) {
      console.error("Error finding inspection type by ID:", error);
      return null;
    }
  }

  async findAll(): Promise<InspectionTypeMasterModel[]> {
    try {
      const inspectionTypes = await this.prisma.inspectionTypeMaster.findMany();
      return inspectionTypes.map((type) => this.mapToModel(type));
    } catch (error) {
      console.error("Error finding all inspection types:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<InspectionTypeMasterModel>
  ): Promise<InspectionTypeMasterModel | null> {
    try {
      const updatedType = await this.prisma.inspectionTypeMaster.update({
        where: { inspectionTypeId: id },
        data: {
          typeName: data.typeName,
          description: data.description,
          updatedAt: new Date(),
        },
      });

      return this.mapToModel(updatedType);
    } catch (error) {
      console.error("Error updating inspection type:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.inspectionTypeMaster.delete({
        where: { inspectionTypeId: id },
      });

      return true;
    } catch (error) {
      console.error("Error deleting inspection type:", error);
      return false;
    }
  }

  async findByInspectionTypeId(
    inspectionTypeId: number
  ): Promise<InspectionTypeMasterModel | null> {
    return this.findById(inspectionTypeId);
  }

  async countInspectionsThisMonth(): Promise<number> {
    try {
      const now = new Date();
      const inspectionsThisMonth = await this.prisma.inspection.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        },
      });
      return inspectionsThisMonth;
    } catch (error) {
      console.error("Error counting inspections:", error);
      return 0;
    }
  }

  // เพิ่มเมธอดสำหรับค้นหา inspection items โดยประเภทการตรวจ
  async findInspectionItemsByTypeId(inspectionTypeId: number): Promise<any[]> {
    try {
      const inspectionItems = await this.prisma.inspectionItemMaster.findMany({
        where: { inspectionTypeId },
        include: {
          requirements: true,
        },
      });
      return inspectionItems;
    } catch (error) {
      console.error("Error finding inspection items by type ID:", error);
      return [];
    }
  }

  private mapToModel(
    prismaEntity: PrismaInspectionTypeMaster
  ): InspectionTypeMasterModel {
    return this.mapper.toDomain(prismaEntity);
  }
}
