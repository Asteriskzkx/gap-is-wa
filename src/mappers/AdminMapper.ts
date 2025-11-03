import { Admin as PrismaAdmin, User as PrismaUser } from "@prisma/client";
import { AdminModel } from "@/models/AdminModel";
import { BaseMapper } from "./BaseMapper";
import { UserMapper } from "./UserMapper";

export class AdminMapper implements BaseMapper<any, AdminModel> {
  private userMapper: UserMapper;

  constructor(userMapper: UserMapper) {
    this.userMapper = userMapper;
  }

  toDomain(prismaEntity: { admin: PrismaAdmin; user: PrismaUser }): AdminModel {
    const user = this.userMapper.toDomain(prismaEntity.user);

    return new AdminModel(
      user.id,
      user.email,
      user.hashedPassword,
      user.name,
      prismaEntity.admin.adminId,
      prismaEntity.admin.namePrefix,
      prismaEntity.admin.firstName,
      prismaEntity.admin.lastName,
      prismaEntity.admin.createdAt,
      prismaEntity.admin.updatedAt,
      prismaEntity.admin.version
    );
  }

  toPrisma(domainEntity: AdminModel): any {
    return {
      namePrefix: domainEntity.namePrefix,
      firstName: domainEntity.firstName,
      lastName: domainEntity.lastName,
    };
  }
}
