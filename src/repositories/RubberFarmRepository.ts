import { PrismaClient, RubberFarm as PrismaRubberFarm } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { RubberFarmModel } from "../models/RubberFarmModel";
import { BaseMapper } from "../mappers/BaseMapper";

export class RubberFarmRepository extends BaseRepository<RubberFarmModel> {
  constructor(mapper: BaseMapper<any, RubberFarmModel>) {
    super(mapper);
  }

  async create(model: RubberFarmModel): Promise<RubberFarmModel> {
    try {
      const rubberFarm = await this.prisma.rubberFarm.create({
        data: {
          farmerId: model.farmerId,
          villageName: model.villageName,
          moo: model.moo,
          road: model.road,
          alley: model.alley,
          subDistrict: model.subDistrict,
          district: model.district,
          province: model.province,
          location: model.location,
        },
        include: {
          plantingDetails: true,
        },
      });

      return this.mapToModel(rubberFarm);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<RubberFarmModel | null> {
    try {
      const rubberFarm = await this.prisma.rubberFarm.findUnique({
        where: { rubberFarmId: id },
        include: {
          plantingDetails: true,
        },
      });

      return rubberFarm ? this.mapToModel(rubberFarm) : null;
    } catch (error) {
      console.error("Error finding rubber farm by ID:", error);
      return null;
    }
  }

  async findByFarmerId(farmerId: number): Promise<RubberFarmModel[]> {
    try {
      const rubberFarms = await this.prisma.rubberFarm.findMany({
        where: { farmerId },
        include: {
          plantingDetails: true,
        },
      });

      return rubberFarms.map((farm) => this.mapToModel(farm));
    } catch (error) {
      console.error("Error finding rubber farms by farmer ID:", error);
      return [];
    }
  }

  async findAll(): Promise<RubberFarmModel[]> {
    try {
      const rubberFarms = await this.prisma.rubberFarm.findMany({
        include: {
          plantingDetails: true,
        },
      });

      return rubberFarms.map((farm) => this.mapToModel(farm));
    } catch (error) {
      console.error("Error finding all rubber farms:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<RubberFarmModel>
  ): Promise<RubberFarmModel | null> {
    try {
      const updatedRubberFarm = await this.prisma.rubberFarm.update({
        where: { rubberFarmId: id },
        data: {
          villageName: data.villageName,
          moo: data.moo,
          road: data.road,
          alley: data.alley,
          subDistrict: data.subDistrict,
          district: data.district,
          province: data.province,
          location: data.location,
          updatedAt: new Date(),
        },
        include: {
          plantingDetails: true,
        },
      });

      return this.mapToModel(updatedRubberFarm);
    } catch (error) {
      console.error("Error updating rubber farm:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.rubberFarm.delete({
        where: { rubberFarmId: id },
      });

      return true;
    } catch (error) {
      console.error("Error deleting rubber farm:", error);
      return false;
    }
  }

  private mapToModel(
    prismaRubberFarm: PrismaRubberFarm & { plantingDetails?: any[] }
  ): RubberFarmModel {
    return this.mapper.toDomain(prismaRubberFarm);
  }
}
