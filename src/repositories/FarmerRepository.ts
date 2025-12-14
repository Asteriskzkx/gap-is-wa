import {
  PrismaClient,
  Farmer as PrismaFarmer,
  User as PrismaUser,
} from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { FarmerModel } from "../models/FarmerModel";
import { UserRole } from "../models/UserModel";
import { BaseMapper } from "../mappers/BaseMapper";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export class FarmerRepository extends BaseRepository<FarmerModel> {
  constructor(mapper: BaseMapper<any, FarmerModel>) {
    super(mapper);
  }

  async create(model: FarmerModel): Promise<FarmerModel> {
    try {
      // Create the user first
      const user = await this.prisma.user.create({
        data: {
          email: model.email,
          hashedPassword: model.hashedPassword,
          name: model.name,
          role: UserRole.FARMER,
          farmer: {
            create: {
              namePrefix: model.namePrefix,
              firstName: model.firstName,
              lastName: model.lastName,
              identificationNumber: model.identificationNumber,
              birthDate: model.birthDate,
              gender: model.gender,
              houseNo: model.houseNo,
              villageName: model.villageName,
              moo: model.moo,
              road: model.road,
              alley: model.alley,
              subDistrict: model.subDistrict,
              district: model.district,
              provinceName: model.provinceName,
              zipCode: model.zipCode,
              phoneNumber: model.phoneNumber,
              mobilePhoneNumber: model.mobilePhoneNumber,
            },
          },
        },
        include: {
          farmer: true,
        },
      });

      if (!user.farmer) {
        throw new Error("Failed to create farmer record");
      }

      return this.mapToModel(user, user.farmer);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<FarmerModel | null> {
    try {
      
      const farmer = await this.prisma.farmer.findUnique({
        where: { farmerId: id },
        include: {
          user: true,
        },
      });


      return farmer && farmer.user
        ? this.mapToModel(farmer.user, farmer)
        : null;
    } catch (error) {
      console.error("Error finding farmer by ID:", error);
      return null;
    }
  }

  async findByUserId(userId: number): Promise<FarmerModel | null> {
    try {
      const farmer = await this.prisma.farmer.findUnique({
        where: { userId },
        include: {
          user: true,
        },
      });

      return farmer && farmer.user
        ? this.mapToModel(farmer.user, farmer)
        : null;
    } catch (error) {
      console.error("Error finding farmer by user ID:", error);
      return null;
    }
  }

  async findAll(): Promise<FarmerModel[]> {
    try {
      const farmers = await this.prisma.farmer.findMany({
        include: {
          user: true,
        },
      });

      console.log("=== DEBUG findAll farmers ===");
      console.log("All farmers:", farmers.map(f => ({ farmerId: f.farmerId, userId: f.userId, firstName: f.firstName })));

      return farmers
        .filter((farmer) => farmer.user !== null)
        .map((farmer) => this.mapToModel(farmer.user!, farmer));
    } catch (error) {
      console.error("Error finding all farmers:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<FarmerModel>
  ): Promise<FarmerModel | null> {
    try {
      // First, find the farmer to get the userId
      const existingFarmer = await this.prisma.farmer.findUnique({
        where: { farmerId: id },
        select: { userId: true },
      });

      if (!existingFarmer) {
        return null;
      }

      // Start a transaction to update both User and Farmer
      const [updatedUser, updatedFarmer] = await this.prisma.$transaction([
        // Update User record
        this.prisma.user.update({
          where: { userId: existingFarmer.userId },
          data: {
            email: data.email,
            name: data.name,
            updatedAt: new Date(),
          },
        }),

        // Update Farmer record
        this.prisma.farmer.update({
          where: { farmerId: id },
          data: {
            namePrefix: data.namePrefix,
            firstName: data.firstName,
            lastName: data.lastName,
            identificationNumber: data.identificationNumber,
            birthDate: data.birthDate,
            gender: data.gender,
            houseNo: data.houseNo,
            villageName: data.villageName,
            moo: data.moo,
            road: data.road,
            alley: data.alley,
            subDistrict: data.subDistrict,
            district: data.district,
            provinceName: data.provinceName,
            zipCode: data.zipCode,
            phoneNumber: data.phoneNumber,
            mobilePhoneNumber: data.mobilePhoneNumber,
            updatedAt: new Date(),
          },
        }),
      ]);

      return this.mapToModel(updatedUser, updatedFarmer);
    } catch (error) {
      console.error("Error updating farmer:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      // Find the farmer to get the userId
      const farmer = await this.prisma.farmer.findUnique({
        where: { farmerId: id },
        select: { userId: true },
      });

      if (!farmer) {
        return false;
      }

      // Delete the user (which will cascade delete the farmer)
      await this.prisma.user.delete({
        where: { userId: farmer.userId },
      });

      return true;
    } catch (error) {
      console.error("Error deleting farmer:", error);
      return false;
    }
  }

  /**
   * Update farmer with optimistic locking
   */
  async updateWithLock(
    id: number,
    data: Partial<FarmerModel>,
    currentVersion: number
  ): Promise<FarmerModel> {
    try {

      // First, find the farmer to get the userId and verify version
      const existingFarmer = await this.prisma.farmer.findUnique({
        where: { farmerId: id },
        select: { userId: true, version: true },
      });

      if (!existingFarmer) {
        throw new Error(`Farmer with ID ${id} not found`);
      }

      // Check version for optimistic locking
      if (existingFarmer.version !== currentVersion) {
        throw new OptimisticLockError(
          "farmer",
          id,
          currentVersion,
          existingFarmer.version ?? -1
        );
      }

      // Prepare user data - only include defined values
      const userData: any = { updatedAt: new Date() };
      if (data.email !== undefined) userData.email = data.email;
      if (data.name !== undefined) userData.name = data.name;

      // Prepare farmer data - only include defined values and convert birthDate
      const farmerData: any = {
        version: currentVersion + 1,
        updatedAt: new Date(),
      };
      if (data.namePrefix !== undefined) farmerData.namePrefix = data.namePrefix;
      if (data.firstName !== undefined) farmerData.firstName = data.firstName;
      if (data.lastName !== undefined) farmerData.lastName = data.lastName;
      if (data.identificationNumber !== undefined) farmerData.identificationNumber = data.identificationNumber;
      if (data.birthDate !== undefined) {
        // Convert string to Date if needed
        farmerData.birthDate = typeof data.birthDate === 'string' 
          ? new Date(data.birthDate) 
          : data.birthDate;
      }
      if (data.gender !== undefined) farmerData.gender = data.gender;
      if (data.houseNo !== undefined) farmerData.houseNo = data.houseNo;
      if (data.villageName !== undefined) farmerData.villageName = data.villageName;
      if (data.moo !== undefined) farmerData.moo = data.moo;
      if (data.road !== undefined) farmerData.road = data.road;
      if (data.alley !== undefined) farmerData.alley = data.alley;
      if (data.subDistrict !== undefined) farmerData.subDistrict = data.subDistrict;
      if (data.district !== undefined) farmerData.district = data.district;
      if (data.provinceName !== undefined) farmerData.provinceName = data.provinceName;
      if (data.zipCode !== undefined) farmerData.zipCode = data.zipCode;
      if (data.phoneNumber !== undefined) farmerData.phoneNumber = data.phoneNumber;
      if (data.mobilePhoneNumber !== undefined) farmerData.mobilePhoneNumber = data.mobilePhoneNumber;

      // Start a transaction to update both User and Farmer
      const [updatedUser, updatedFarmer] = await this.prisma.$transaction([
        // Update User record
        this.prisma.user.update({
          where: { userId: existingFarmer.userId },
          data: userData,
        }),

        // Update Farmer record with version increment
        this.prisma.farmer.update({
          where: { farmerId: id },
          data: farmerData,
        }),
      ]);

      const result = this.mapToModel(updatedUser, updatedFarmer);
      return result;
    } catch (error) {
      if (error instanceof OptimisticLockError) {
        throw error;
      }
      throw error;
    }
  }

  private mapToModel(user: PrismaUser, farmer: PrismaFarmer): FarmerModel {
    return this.mapper.toDomain({ user, farmer });
  }
}
