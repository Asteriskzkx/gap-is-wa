import {
  PrismaClient,
  InspectionItem as PrismaInspectionItem,
} from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { InspectionItemModel } from "../models/InspectionItemModel";
import { BaseMapper } from "../mappers/BaseMapper";

export class InspectionItemRepository extends BaseRepository<InspectionItemModel> {
  constructor(mapper: BaseMapper<any, InspectionItemModel>) {
    super(mapper);
  }

  async create(model: InspectionItemModel): Promise<InspectionItemModel> {
    try {
      const inspectionItem = await this.prisma.inspectionItem.create({
        data: {
          inspectionId: model.inspectionId,
          inspectionItemMasterId: model.inspectionItemMasterId,
          inspectionItemNo: model.inspectionItemNo,
          inspectionItemResult: model.inspectionItemResult,
          otherConditions: model.otherConditions,
        },
        include: {
          requirements: true,
        },
      });

      return this.mapToModel(inspectionItem);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<InspectionItemModel | null> {
    try {
      const inspectionItem = await this.prisma.inspectionItem.findUnique({
        where: { inspectionItemId: id },
        include: {
          requirements: true,
        },
      });

      return inspectionItem ? this.mapToModel(inspectionItem) : null;
    } catch (error) {
      console.error("Error finding inspection item by ID:", error);
      return null;
    }
  }

  async findByInspectionId(
    inspectionId: number
  ): Promise<InspectionItemModel[]> {
    try {
      const inspectionItems = await this.prisma.inspectionItem.findMany({
        where: { inspectionId },
        include: {
          inspectionItemMaster: true,
          requirements: {
            include: {
              requirementMaster: true,
            },
          },
        },
      });

      return inspectionItems.map((item) => this.mapToModel(item));
    } catch (error) {
      console.error("Error finding inspection items by inspection ID:", error);
      return [];
    }
  }

  async findAll(): Promise<InspectionItemModel[]> {
    try {
      const inspectionItems = await this.prisma.inspectionItem.findMany({
        include: {
          requirements: true,
        },
      });
      return inspectionItems.map((item) => this.mapToModel(item));
    } catch (error) {
      console.error("Error finding all inspection items:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<InspectionItemModel>
  ): Promise<InspectionItemModel | null> {
    try {
      const updatedInspectionItem = await this.prisma.inspectionItem.update({
        where: { inspectionItemId: id },
        data: {
          inspectionItemMasterId: data.inspectionItemMasterId,
          inspectionItemNo: data.inspectionItemNo,
          inspectionItemResult: data.inspectionItemResult,
          otherConditions: data.otherConditions,
          updatedAt: new Date(),
        },
        include: {
          requirements: true,
        },
      });

      return this.mapToModel(updatedInspectionItem);
    } catch (error) {
      console.error("Error updating inspection item:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.inspectionItem.delete({
        where: { inspectionItemId: id },
      });

      return true;
    } catch (error) {
      console.error("Error deleting inspection item:", error);
      return false;
    }
  }

  /**
   * Update inspection item with optimistic locking
   */
  async updateWithLock(
    id: number,
    data: Partial<InspectionItemModel>,
    currentVersion: number
  ): Promise<InspectionItemModel> {
    return this.updateWithOptimisticLock(
      id,
      data,
      currentVersion,
      "inspectionItem"
    );
  }

  private mapToModel(prismaInspectionItem: any): InspectionItemModel {
    return this.mapper.toDomain(prismaInspectionItem);
  }
}
