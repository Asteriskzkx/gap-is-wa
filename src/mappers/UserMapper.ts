import { User as PrismaUser } from "@prisma/client";
import { UserModel, UserRole } from "@/models/UserModel";
import { BaseMapper } from "./BaseMapper";

export class UserMapper implements BaseMapper<PrismaUser, UserModel> {
  toDomain(prismaEntity: PrismaUser): UserModel {
    return new UserModel(
      prismaEntity.userId,
      prismaEntity.email,
      "", // We don't expose plain text passwords
      prismaEntity.hashedPassword,
      prismaEntity.name,
      prismaEntity.role as UserRole,
      prismaEntity.createdAt,
      prismaEntity.updatedAt
    );
  }

  toPrisma(domainEntity: UserModel): any {
    return {
      email: domainEntity.email,
      password: domainEntity.password, // Needed for certain operations
      hashedPassword: domainEntity.hashedPassword,
      name: domainEntity.name,
      role: domainEntity.role,
    };
  }
}
