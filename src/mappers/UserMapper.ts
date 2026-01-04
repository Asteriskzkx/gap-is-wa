import { User as PrismaUser } from "@prisma/client";
import { UserModel, UserRole } from "@/models/UserModel";
import { BaseMapper } from "./BaseMapper";

export class UserMapper implements BaseMapper<PrismaUser, UserModel> {
  toDomain(prismaEntity: PrismaUser): UserModel {
    return new UserModel(
      prismaEntity.userId,
      prismaEntity.email,
      prismaEntity.hashedPassword,
      prismaEntity.name,
      prismaEntity.role as UserRole,
      prismaEntity.requirePasswordChange,
      prismaEntity.createdAt,
      prismaEntity.updatedAt
    );
  }

  toPrisma(domainEntity: UserModel): any {
    return {
      email: domainEntity.email,
      hashedPassword: domainEntity.hashedPassword,
      name: domainEntity.name,
      role: domainEntity.role,
      requirePasswordChange: domainEntity.requirePasswordChange,
    };
  }
}
