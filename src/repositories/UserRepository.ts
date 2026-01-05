import { User as PrismaUser } from "@prisma/client";
import { BaseMapper } from "../mappers/BaseMapper";
import { UserModel } from "../models/UserModel";
import { BaseRepository } from "./BaseRepository";

export class UserRepository extends BaseRepository<UserModel> {
  constructor(mapper: BaseMapper<any, UserModel>) {
    super(mapper);
  }

  async create(model: UserModel): Promise<UserModel> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: model.email,
          hashedPassword: model.hashedPassword,
          name: model.name,
          role: model.role,
        },
      });

      return this.mapToModel(user);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<UserModel | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { userId: id },
      });

      return user ? this.mapToModel(user) : null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      return user ? this.mapToModel(user) : null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async findAll(): Promise<UserModel[]> {
    try {
      const users = await this.prisma.user.findMany();

      return users.map((user) => this.mapToModel(user));
    } catch (error) {
      console.error("Error finding all users:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<UserModel>
  ): Promise<UserModel | null> {
    try {
      const user = await this.prisma.user.update({
        where: { userId: id },
        data: {
          email: data.email,
          name: data.name,
          role: data.role,
          hashedPassword: data.hashedPassword,
          requirePasswordChange: data.requirePasswordChange,
          updatedAt: new Date(),
        },
      });

      return this.mapToModel(user);
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { userId: id },
      });

      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  private mapToModel(user: PrismaUser): UserModel {
    return this.mapper.toDomain(user);
  }

  /**
   * ค้นหา users พร้อม filter และ pagination (Server-side)
   */
  async findWithFilterAndPagination(params: {
    search?: string;
    role?: string;
    skip?: number;
    take?: number;
    sortField?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ users: UserModel[]; total: number }> {
    try {
      const {
        search,
        role,
        skip = 0,
        take = 20,
        sortField = "createdAt",
        sortOrder = "desc",
      } = params;

      // Build where clause
      const where: any = {};

      if (role) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      // Build orderBy - validate sortField to prevent injection
      const validSortFields = ["userId", "name", "email", "role", "createdAt"];
      const safeSortField = validSortFields.includes(sortField)
        ? sortField
        : "createdAt";
      const orderBy = { [safeSortField]: sortOrder };

      // Execute queries in parallel
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          orderBy,
          skip,
          take,
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        users: users.map((user) => this.mapToModel(user)),
        total,
      };
    } catch (error) {
      console.error("Error finding users with filter:", error);
      return { users: [], total: 0 };
    }
  }
}
