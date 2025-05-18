import { Farmer as PrismaFarmer, User as PrismaUser } from "@prisma/client";
import { FarmerModel } from "@/models/FarmerModel";
import { BaseMapper } from "./BaseMapper";
import { UserMapper } from "./UserMapper";

export class FarmerMapper implements BaseMapper<any, FarmerModel> {
  private userMapper: UserMapper;

  constructor(userMapper: UserMapper) {
    this.userMapper = userMapper;
  }

  toDomain(prismaEntity: {
    farmer: PrismaFarmer;
    user: PrismaUser;
  }): FarmerModel {
    const user = this.userMapper.toDomain(prismaEntity.user);

    return new FarmerModel(
      user.id,
      user.email,
      "", // We don't expose plain text passwords
      user.hashedPassword,
      user.name,
      prismaEntity.farmer.farmerId,
      prismaEntity.farmer.namePrefix,
      prismaEntity.farmer.firstName,
      prismaEntity.farmer.lastName,
      prismaEntity.farmer.identificationNumber,
      prismaEntity.farmer.birthDate,
      prismaEntity.farmer.gender,
      prismaEntity.farmer.houseNo,
      prismaEntity.farmer.villageName,
      prismaEntity.farmer.moo,
      prismaEntity.farmer.road,
      prismaEntity.farmer.alley,
      prismaEntity.farmer.subDistrict,
      prismaEntity.farmer.district,
      prismaEntity.farmer.provinceName,
      prismaEntity.farmer.zipCode,
      prismaEntity.farmer.phoneNumber,
      prismaEntity.farmer.mobilePhoneNumber,
      prismaEntity.farmer.createdAt,
      prismaEntity.farmer.updatedAt
    );
  }

  toPrisma(domainEntity: FarmerModel): any {
    return {
      namePrefix: domainEntity.namePrefix,
      firstName: domainEntity.firstName,
      lastName: domainEntity.lastName,
      identificationNumber: domainEntity.identificationNumber,
      birthDate: domainEntity.birthDate,
      gender: domainEntity.gender,
      houseNo: domainEntity.houseNo,
      villageName: domainEntity.villageName,
      moo: domainEntity.moo,
      road: domainEntity.road,
      alley: domainEntity.alley,
      subDistrict: domainEntity.subDistrict,
      district: domainEntity.district,
      provinceName: domainEntity.provinceName,
      zipCode: domainEntity.zipCode,
      phoneNumber: domainEntity.phoneNumber,
      mobilePhoneNumber: domainEntity.mobilePhoneNumber,
    };
  }
}
