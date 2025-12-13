import {
  PrismaClient,
  Admin as PrismaAdmin,
  User as PrismaUser,
} from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { AdminModel } from "../models/AdminModel";
import { UserRole } from "../models/UserModel";
import { BaseMapper } from "../mappers/BaseMapper";

export class AdminRepository extends BaseRepository<AdminModel> {
  constructor(mapper: BaseMapper<any, AdminModel>) {
    super(mapper);
  }

  async create(model: AdminModel): Promise<AdminModel> {
    try {
      // Create the user first with the admin relation
      const user = await this.prisma.user.create({
        data: {
          email: model.email,
          hashedPassword: model.hashedPassword,
          name: model.name,
          role: UserRole.ADMIN,
          admin: {
            create: {
              namePrefix: model.namePrefix,
              firstName: model.firstName,
              lastName: model.lastName,
            },
          },
        },
        include: {
          admin: true,
        },
      });

      if (!user.admin) {
        throw new Error("Failed to create admin record");
      }

      return this.mapToModel(user, user.admin);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<AdminModel | null> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { adminId: id },
        include: {
          user: true,
        },
      });

      return admin && admin.user ? this.mapToModel(admin.user, admin) : null;
    } catch (error) {
      console.error("Error finding admin by ID:", error);
      return null;
    }
  }

  async findByUserId(userId: number): Promise<AdminModel | null> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { userId },
        include: {
          user: true,
        },
      });

      return admin && admin.user ? this.mapToModel(admin.user, admin) : null;
    } catch (error) {
      console.error("Error finding admin by user ID:", error);
      return null;
    }
  }

  async findAll(): Promise<AdminModel[]> {
    try {
      const admins = await this.prisma.admin.findMany({
        include: {
          user: true,
        },
      });

      return admins
        .filter((admin) => admin.user !== null)
        .map((admin) => this.mapToModel(admin.user!, admin));
    } catch (error) {
      console.error("Error finding all admins:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<AdminModel>
  ): Promise<AdminModel | null> {
    try {
      // First, find the admin to get the userId
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { adminId: id },
        select: { userId: true },
      });

      if (!existingAdmin) {
        return null;
      }

      // Prepare user data - only include defined values
      const userData: any = { updatedAt: new Date() };
      if (data.email !== undefined) userData.email = data.email;
      if (data.name !== undefined) userData.name = data.name;

      // Prepare admin data - only include defined values
      const adminData: any = { updatedAt: new Date() };
      if (data.namePrefix !== undefined) adminData.namePrefix = data.namePrefix;
      if (data.firstName !== undefined) adminData.firstName = data.firstName;
      if (data.lastName !== undefined) adminData.lastName = data.lastName;

      // Start a transaction to update both User and Admin
      const [updatedUser, updatedAdmin] = await this.prisma.$transaction([
        // Update User record
        this.prisma.user.update({
          where: { userId: existingAdmin.userId },
          data: userData,
        }),

        // Update Admin record
        this.prisma.admin.update({
          where: { adminId: id },
          data: adminData,
        }),
      ]);

      return this.mapToModel(updatedUser, updatedAdmin);
    } catch (error) {
      console.error("Error updating admin:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      // Find the admin to get the userId
      const admin = await this.prisma.admin.findUnique({
        where: { adminId: id },
        select: { userId: true },
      });

      if (!admin) {
        return false;
      }

      // Delete the user (which will cascade delete the admin)
      await this.prisma.user.delete({
        where: { userId: admin.userId },
      });

      return true;
    } catch (error) {
      console.error("Error deleting admin:", error);
      return false;
    }
  }

  private mapToModel(user: PrismaUser, admin: PrismaAdmin): AdminModel {
    return this.mapper.toDomain({ user, admin });
  }
}
