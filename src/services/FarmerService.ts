import { BaseService } from "./BaseService";
import { FarmerModel } from "../models/FarmerModel";
import { FarmerRepository } from "../repositories/FarmerRepository";
import { UserService } from "./UserService";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export class FarmerService extends BaseService<FarmerModel> {
  private farmerRepository: FarmerRepository;
  private userService: UserService;

  constructor(farmerRepository: FarmerRepository, userService: UserService) {
    super(farmerRepository);
    this.farmerRepository = farmerRepository;
    this.userService = userService;
  }

  async login(
    email: string,
    password: string
  ): Promise<{ farmer: FarmerModel } | null> {
    try {
      // First authenticate using UserService
      const userResult = await this.userService.login(email, password);
      if (!userResult) {
        return null;
      }

      // Check if the user is a farmer
      const { user } = userResult;
      if (user.role !== "FARMER") {
        return null;
      }

      // Get farmer profile
      const farmer = await this.farmerRepository.findByUserId(user.id);
      if (!farmer) {
        return null;
      }

      return { farmer };
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async registerFarmer(farmerData: {
    email: string;
    password?: string;
    namePrefix: string;
    firstName: string;
    lastName: string;
    identificationNumber: string;
    birthDate: Date;
    gender: string;
    houseNo: string;
    villageName: string;
    moo: number;
    road: string;
    alley: string;
    subDistrict: string;
    district: string;
    provinceName: string;
    zipCode: string;
    phoneNumber: string;
    mobilePhoneNumber: string;
  }): Promise<FarmerModel> {
    try {
      // Check if user already exists
      const existingUser = await this.userService.findByEmail(farmerData.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      if (!farmerData.password) {
        const generatedPassword = "P@ssw0rd123" ;
        farmerData.password = generatedPassword;
      }
      // Create new farmer
      const farmerModel = await FarmerModel.createFarmer(
        farmerData.email,
        farmerData.password,
        farmerData.namePrefix,
        farmerData.firstName,
        farmerData.lastName,
        farmerData.identificationNumber,
        farmerData.birthDate,
        farmerData.gender,
        farmerData.houseNo,
        farmerData.villageName,
        farmerData.moo,
        farmerData.road,
        farmerData.alley,
        farmerData.subDistrict,
        farmerData.district,
        farmerData.provinceName,
        farmerData.zipCode,
        farmerData.phoneNumber,
        farmerData.mobilePhoneNumber
      );

      return await this.create(farmerModel);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getFarmerByUserId(userId: number): Promise<FarmerModel | null> {
    try {
      return await this.farmerRepository.findByUserId(userId);
    } catch (error) {
      this.handleServiceError(error);
      return null;
    }
  }

  async updateFarmerProfile(
    farmerId: number,
    data: Partial<FarmerModel>,
    currentVersion?: number
  ): Promise<FarmerModel | null> {
    try {
      // If updating email, check if it's already in use
      if (data.email) {
        const existingUser = await this.userService.findByEmail(data.email);
        if (existingUser && existingUser.id !== data.id) {
          throw new Error("Email is already in use by another account");
        }
      }

      if (currentVersion !== undefined) {
        // Use optimistic locking
        return await this.farmerRepository.updateWithLock(
          farmerId,
          data,
          currentVersion
        );
      } else {
        // Fallback to regular update
        return await this.update(farmerId, data);
      }
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  // Additional farmer-specific business logic can be added here
  async getFarmersByDistrict(district: string): Promise<FarmerModel[]> {
    try {
      const allFarmers = await this.getAll();
      return allFarmers.filter((farmer) => farmer.district === district);
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  async getFarmersByProvince(provinceName: string): Promise<FarmerModel[]> {
    try {
      const allFarmers = await this.getAll();
      return allFarmers.filter(
        (farmer) => farmer.provinceName === provinceName
      );
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  async validateIdentificationNumber(id: string): Promise<boolean> {
    // Thai ID validation logic
    if (id.length !== 13) return false;

    // Basic check for the ID pattern and calculation
    // This is a simplified version - real implementation would be more complex
    return /^[0-9]{13}$/.test(id);
  }
}
