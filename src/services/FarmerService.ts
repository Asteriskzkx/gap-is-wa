import { BaseService } from './BaseService';
import { FarmerModel } from '../models/FarmerModel';
import { FarmerRepository } from '../repositories/FarmerRepository';
import { UserService } from './UserService';

export class FarmerService extends BaseService<FarmerModel> {
    private farmerRepository: FarmerRepository;
    private userService: UserService;

    constructor(farmerRepository: FarmerRepository, userService: UserService) {
        super(farmerRepository);
        this.farmerRepository = farmerRepository;
        this.userService = userService;
    }

    async registerFarmer(farmerData: {
        email: string;
        password: string;
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
                throw new Error('User with this email already exists');
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

    async getFarmerByUserId(userId: string): Promise<FarmerModel | null> {
        try {
            return await this.farmerRepository.findByUserId(userId);
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }

    async updateFarmerProfile(farmerId: string, data: Partial<FarmerModel>): Promise<FarmerModel | null> {
        try {
            // If updating email, check if it's already in use
            if (data.email) {
                const existingUser = await this.userService.findByEmail(data.email);
                if (existingUser && existingUser.id !== data.id) {
                    throw new Error('Email is already in use by another account');
                }
            }

            return await this.update(farmerId, data);
        } catch (error) {
            this.handleServiceError(error);
            throw error;
        }
    }

    // Additional farmer-specific business logic can be added here
    async getFarmersByDistrict(district: string): Promise<FarmerModel[]> {
        try {
            const allFarmers = await this.getAll();
            return allFarmers.filter(farmer => farmer.district === district);
        } catch (error) {
            this.handleServiceError(error);
            return [];
        }
    }

    async getFarmersByProvince(provinceName: string): Promise<FarmerModel[]> {
        try {
            const allFarmers = await this.getAll();
            return allFarmers.filter(farmer => farmer.provinceName === provinceName);
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