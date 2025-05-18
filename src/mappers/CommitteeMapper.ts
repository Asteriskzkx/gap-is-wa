import {
  Committee as PrismaCommittee,
  User as PrismaUser,
} from "@prisma/client";
import { CommitteeModel } from "@/models/CommitteeModel";
import { BaseMapper } from "./BaseMapper";
import { UserMapper } from "./UserMapper";

export class CommitteeMapper implements BaseMapper<any, CommitteeModel> {
  private userMapper: UserMapper;

  constructor(userMapper: UserMapper) {
    this.userMapper = userMapper;
  }

  toDomain(prismaEntity: {
    committee: PrismaCommittee;
    user: PrismaUser;
  }): CommitteeModel {
    const user = this.userMapper.toDomain(prismaEntity.user);

    return new CommitteeModel(
      user.id,
      user.email,
      "", // We don't expose plain text passwords
      user.hashedPassword,
      user.name,
      prismaEntity.committee.committeeId,
      prismaEntity.committee.namePrefix,
      prismaEntity.committee.firstName,
      prismaEntity.committee.lastName,
      prismaEntity.committee.createdAt,
      prismaEntity.committee.updatedAt
    );
  }

  toPrisma(domainEntity: CommitteeModel): any {
    return {
      namePrefix: domainEntity.namePrefix,
      firstName: domainEntity.firstName,
      lastName: domainEntity.lastName,
    };
  }
}
