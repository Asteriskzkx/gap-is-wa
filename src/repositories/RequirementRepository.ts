import { PrismaClient, Requirement as PrismaRequirement } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { RequirementModel } from "../models/RequirementModel";
import { BaseMapper } from "../mappers/BaseMapper";

export class RequirementRepository extends BaseRepository<RequirementModel> {
  constructor(mapper: BaseMapper<any, RequirementModel>) {
    super(mapper);
  }

  async create(model: RequirementModel): Promise<RequirementModel> {
    try {
      const requirement = await this.prisma.requirement.create({
        data: {
          inspectionItemId: model.inspectionItemId,
          requirementMasterId: model.requirementMasterId,
          requirementNo: model.requirementNo,
          evaluationResult: model.evaluationResult,
          evaluationMethod: model.evaluationMethod,
          note: model.note,
        },
      });

      return this.mapToModel(requirement);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<RequirementModel | null> {
    try {
      const requirement = await this.prisma.requirement.findUnique({
        where: { requirementId: id },
      });

      return requirement ? this.mapToModel(requirement) : null;
    } catch (error) {
      console.error("Error finding requirement by ID:", error);
      return null;
    }
  }

  async findByInspectionItemId(
    inspectionItemId: number
  ): Promise<RequirementModel[]> {
    try {
      const requirements = await this.prisma.requirement.findMany({
        where: { inspectionItemId },
      });

      return requirements.map((req) => this.mapToModel(req));
    } catch (error) {
      console.error("Error finding requirements by inspection item ID:", error);
      return [];
    }
  }

  async findAll(): Promise<RequirementModel[]> {
    try {
      const requirements = await this.prisma.requirement.findMany();
      return requirements.map((req) => this.mapToModel(req));
    } catch (error) {
      console.error("Error finding all requirements:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<RequirementModel>
  ): Promise<RequirementModel | null> {
    try {
      const updatedRequirement = await this.prisma.requirement.update({
        where: { requirementId: id },
        data: {
          requirementMasterId: data.requirementMasterId,
          requirementNo: data.requirementNo,
          evaluationResult: data.evaluationResult,
          evaluationMethod: data.evaluationMethod,
          note: data.note,
          updatedAt: new Date(),
        },
      });

      return this.mapToModel(updatedRequirement);
    } catch (error) {
      console.error("Error updating requirement:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.requirement.delete({
        where: { requirementId: id },
      });

      return true;
    } catch (error) {
      console.error("Error deleting requirement:", error);
      return false;
    }
  }

  private mapToModel(prismaRequirement: PrismaRequirement): RequirementModel {
    return this.mapper.toDomain(prismaRequirement);
  }
}
