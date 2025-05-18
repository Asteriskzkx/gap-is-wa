import { PrismaClient, User as PrismaUser } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { UserModel, UserRole } from "../models/UserModel";
import { BaseMapper } from "../mappers/BaseMapper";

export class UserRepository extends BaseRepository<UserModel> {
  constructor(mapper: BaseMapper<any, UserModel>) {
    super(mapper);
  }

  async create(model: UserModel): Promise<UserModel> {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: model.email,
          password: model.password,
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
          password: data.password,
          hashedPassword: data.hashedPassword,
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
}
