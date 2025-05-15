import { BaseService } from './BaseService';
import { FarmerModel } from '../models/FarmerModel';
import { FarmerRepository } from '../repositories/FarmerRepository';
import { UserService } from './UserService';
import jwt from 'jsonwebtoken';

export class FarmerService extends BaseService<FarmerModel> {
    private farmerRepository: FarmerRepository;
    private userService: UserService;
    private jwtSecret: string;

    constructor(farmerRepository: FarmerRepository, userService: UserService) {
        super(farmerRepository);
        this.farmerRepository = farmerRepository;
        this.userService = userService;
        this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    }

    async login(email: string, password: string): Promise<{ farmer: FarmerModel; token: string } | null> {
        try {
            // First authenticate using UserService
            const userResult = await this.userService.login(email, password);
            if (!userResult) {
                return null;
            }

            // Check if the user is a farmer
            const { user, token } = userResult;
            if (user.role !== 'FARMER') {
                return null;
            }

            // Get farmer profile
            const farmer = await this.farmerRepository.findByUserId(user.id);
            if (!farmer) {
                return null;
            }

            // Generate farmer-specific token with more info
            const farmerToken = this.generateToken(farmer);

            return { farmer, token: farmerToken };
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
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

    async getFarmerByUserId(userId: number): Promise<FarmerModel | null> { // เปลี่ยนจาก string เป็น number
        try {
            return await this.farmerRepository.findByUserId(userId);
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }

    async updateFarmerProfile(farmerId: number, data: Partial<FarmerModel>): Promise<FarmerModel | null> { // เปลี่ยนจาก string เป็น number
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

    private generateToken(farmer: FarmerModel): string {
        return jwt.sign(
            {
                userId: farmer.id,
                farmerId: farmer.farmerId,
                email: farmer.email,
                role: farmer.role,
                name: farmer.name,
                fullName: `${farmer.namePrefix}${farmer.firstName} ${farmer.lastName}`,
                district: farmer.district,
                province: farmer.provinceName
            },
            this.jwtSecret,
            { expiresIn: '24h' }
        );
    }

    verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }
}