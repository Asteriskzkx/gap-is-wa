import { Auditor as PrismaAuditor, User as PrismaUser } from "@prisma/client";
import { AuditorModel } from "@/models/AuditorModel";
import { BaseMapper } from "./BaseMapper";
import { UserMapper } from "./UserMapper";

export class AuditorMapper implements BaseMapper<any, AuditorModel> {
  private userMapper: UserMapper;

  constructor(userMapper: UserMapper) {
    this.userMapper = userMapper;
  }

  toDomain(prismaEntity: {
    auditor: PrismaAuditor;
    user: PrismaUser;
  }): AuditorModel {
    const user = this.userMapper.toDomain(prismaEntity.user);

    return new AuditorModel(
      user.id,
      user.email,
      user.hashedPassword,
      user.name,
      prismaEntity.auditor.auditorId,
      prismaEntity.auditor.namePrefix,
      prismaEntity.auditor.firstName,
      prismaEntity.auditor.lastName,
      prismaEntity.auditor.createdAt,
      prismaEntity.auditor.updatedAt
    );
  }

  toPrisma(domainEntity: AuditorModel): any {
    return {
      namePrefix: domainEntity.namePrefix,
      firstName: domainEntity.firstName,
      lastName: domainEntity.lastName,
    };
  }
}
