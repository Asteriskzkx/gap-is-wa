import { PrismaClient, User as PrismaUser } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { UserModel, UserRole } from "../models/UserModel";
import { userMapper } from "../mappers";

export class UserRepository extends BaseRepository<UserModel> {
  async create(model: UserModel): Promise<UserModel> {
    try {
      const data = userMapper.toPrisma(model);
      const user = await this.prisma.user.create({ data });
      return userMapper.toDomain(user);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<UserModel | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { userId: id },
      });
      return user ? userMapper.toDomain(user) : null;
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
      return user ? userMapper.toDomain(user) : null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  async findAll(): Promise<UserModel[]> {
    try {
      const users = await this.prisma.user.findMany();
      return users.map((user) => userMapper.toDomain(user));
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
      const prismaData = userMapper.toPrisma({ ...data, id } as UserModel);
      const user = await this.prisma.user.update({
        where: { userId: id },
        data: {
          ...prismaData,
          updatedAt: new Date(),
        },
      });
      return userMapper.toDomain(user);
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
}
