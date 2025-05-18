import {
  PrismaClient,
  Auditor as PrismaAuditor,
  User as PrismaUser,
} from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { AuditorModel } from "../models/AuditorModel";
import { UserRole } from "../models/UserModel";
import { BaseMapper } from "../mappers/BaseMapper";

export class AuditorRepository extends BaseRepository<AuditorModel> {
  constructor(mapper: BaseMapper<any, AuditorModel>) {
    super(mapper);
  }

  async create(model: AuditorModel): Promise<AuditorModel> {
    try {
      // Create the user first with the auditor relation
      const user = await this.prisma.user.create({
        data: {
          email: model.email,
          password: model.password,
          hashedPassword: model.hashedPassword,
          name: model.name,
          role: UserRole.AUDITOR,
          auditor: {
            create: {
              namePrefix: model.namePrefix,
              firstName: model.firstName,
              lastName: model.lastName,
            },
          },
        },
        include: {
          auditor: true,
        },
      });

      if (!user.auditor) {
        throw new Error("Failed to create auditor record");
      }

      return this.mapToModel(user, user.auditor);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<AuditorModel | null> {
    // เปลี่ยนจาก string เป็น number
    try {
      const auditor = await this.prisma.auditor.findUnique({
        where: { auditorId: id },
        include: {
          user: true,
        },
      });

      return auditor && auditor.user
        ? this.mapToModel(auditor.user, auditor)
        : null;
    } catch (error) {
      console.error("Error finding auditor by ID:", error);
      return null;
    }
  }

  async findByUserId(userId: number): Promise<AuditorModel | null> {
    // เปลี่ยนจาก string เป็น number
    try {
      const auditor = await this.prisma.auditor.findUnique({
        where: { userId },
        include: {
          user: true,
        },
      });

      return auditor && auditor.user
        ? this.mapToModel(auditor.user, auditor)
        : null;
    } catch (error) {
      console.error("Error finding auditor by user ID:", error);
      return null;
    }
  }

  async findAll(): Promise<AuditorModel[]> {
    try {
      const auditors = await this.prisma.auditor.findMany({
        include: {
          user: true,
        },
      });

      return auditors
        .filter((auditor) => auditor.user !== null)
        .map((auditor) => this.mapToModel(auditor.user!, auditor));
    } catch (error) {
      console.error("Error finding all auditors:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<AuditorModel>
  ): Promise<AuditorModel | null> {
    // เปลี่ยนจาก string เป็น number
    try {
      // First, find the auditor to get the userId
      const existingAuditor = await this.prisma.auditor.findUnique({
        where: { auditorId: id },
        select: { userId: true },
      });

      if (!existingAuditor) {
        return null;
      }

      // Start a transaction to update both User and Auditor
      const [updatedUser, updatedAuditor] = await this.prisma.$transaction([
        // Update User record
        this.prisma.user.update({
          where: { userId: existingAuditor.userId },
          data: {
            email: data.email,
            name: data.name,
            updatedAt: new Date(),
          },
        }),

        // Update Auditor record
        this.prisma.auditor.update({
          where: { auditorId: id },
          data: {
            namePrefix: data.namePrefix,
            firstName: data.firstName,
            lastName: data.lastName,
            updatedAt: new Date(),
          },
        }),
      ]);

      return this.mapToModel(updatedUser, updatedAuditor);
    } catch (error) {
      console.error("Error updating auditor:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    // เปลี่ยนจาก string เป็น number
    try {
      // Find the auditor to get the userId
      const auditor = await this.prisma.auditor.findUnique({
        where: { auditorId: id },
        select: { userId: true },
      });

      if (!auditor) {
        return false;
      }

      // Delete the user (which will cascade delete the auditor)
      await this.prisma.user.delete({
        where: { userId: auditor.userId },
      });

      return true;
    } catch (error) {
      console.error("Error deleting auditor:", error);
      return false;
    }
  }

  private mapToModel(user: PrismaUser, auditor: PrismaAuditor): AuditorModel {
    return this.mapper.toDomain({ user, auditor });
  }
}
