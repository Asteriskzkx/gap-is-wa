import {
  PrismaClient,
  AdviceAndDefect as PrismaAdviceAndDefect,
} from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { AdviceAndDefectModel } from "../models/AdviceAndDefectModel";
import { BaseMapper } from "../mappers/BaseMapper";

export class AdviceAndDefectRepository extends BaseRepository<AdviceAndDefectModel> {
  constructor(mapper: BaseMapper<any, AdviceAndDefectModel>) {
    super(mapper);
  }

  async create(model: AdviceAndDefectModel): Promise<AdviceAndDefectModel> {
    try {
      const adviceAndDefect = await this.prisma.adviceAndDefect.create({
        data: {
          inspectionId: model.inspectionId,
          date: model.date,
          adviceList: model.adviceList,
          defectList: model.defectList,
        },
      });

      return this.mapToModel(adviceAndDefect);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<AdviceAndDefectModel | null> {
    try {
      const adviceAndDefect = await this.prisma.adviceAndDefect.findUnique({
        where: { adviceAndDefectId: id },
      });

      return adviceAndDefect ? this.mapToModel(adviceAndDefect) : null;
    } catch (error) {
      console.error("Error finding advice and defect by ID:", error);
      return null;
    }
  }

  async findByInspectionId(
    inspectionId: number
  ): Promise<AdviceAndDefectModel | null> {
    try {
      const adviceAndDefect = await this.prisma.adviceAndDefect.findUnique({
        where: { inspectionId },
      });

      return adviceAndDefect ? this.mapToModel(adviceAndDefect) : null;
    } catch (error) {
      console.error("Error finding advice and defect by inspection ID:", error);
      return null;
    }
  }

  async findAll(): Promise<AdviceAndDefectModel[]> {
    try {
      const advicesAndDefects = await this.prisma.adviceAndDefect.findMany();
      return advicesAndDefects.map((item) => this.mapToModel(item));
    } catch (error) {
      console.error("Error finding all advices and defects:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<AdviceAndDefectModel>
  ): Promise<AdviceAndDefectModel | null> {
    try {
      const updatedAdviceAndDefect = await this.prisma.adviceAndDefect.update({
        where: { adviceAndDefectId: id },
        data: {
          date: data.date,
          adviceList: data.adviceList,
          defectList: data.defectList,
          updatedAt: new Date(),
        },
      });

      return this.mapToModel(updatedAdviceAndDefect);
    } catch (error) {
      console.error("Error updating advice and defect:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.adviceAndDefect.delete({
        where: { adviceAndDefectId: id },
      });

      return true;
    } catch (error) {
      console.error("Error deleting advice and defect:", error);
      return false;
    }
  }

  /**
   * Update advice and defect with optimistic locking
   */
  async updateWithLock(
    id: number,
    data: Partial<AdviceAndDefectModel>,
    currentVersion: number
  ): Promise<AdviceAndDefectModel> {
    return this.updateWithOptimisticLock(
      id,
      data,
      currentVersion,
      "adviceAndDefect"
    );
  }

  private mapToModel(
    prismaAdviceAndDefect: PrismaAdviceAndDefect
  ): AdviceAndDefectModel {
    return this.mapper.toDomain(prismaAdviceAndDefect);
  }
}
