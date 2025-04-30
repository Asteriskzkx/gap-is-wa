import { BaseService } from './BaseService';
import { AuditorModel } from '../models/AuditorModel';
import { AuditorRepository } from '../repositories/AuditorRepository';
import { UserService } from './UserService';

export class AuditorService extends BaseService<AuditorModel> {
    private auditorRepository: AuditorRepository;
    private userService: UserService;

    constructor(auditorRepository: AuditorRepository, userService: UserService) {
        super(auditorRepository);
        this.auditorRepository = auditorRepository;
        this.userService = userService;
    }

    async registerAuditor(auditorData: {
        email: string;
        password: string;
        namePrefix: string;
        firstName: string;
        lastName: string;
    }): Promise<AuditorModel> {
        try {
            // Check if user already exists
            const existingUser = await this.userService.findByEmail(auditorData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Create new auditor
            const auditorModel = await AuditorModel.createAuditor(
                auditorData.email,
                auditorData.password,
                auditorData.namePrefix,
                auditorData.firstName,
                auditorData.lastName
            );

            return await this.create(auditorModel);
        } catch (error) {
            this.handleServiceError(error);
            throw error;
        }
    }

    async getAuditorByUserId(userId: string): Promise<AuditorModel | null> {
        try {
            return await this.auditorRepository.findByUserId(userId);
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }

    async updateAuditorProfile(auditorId: string, data: Partial<AuditorModel>): Promise<AuditorModel | null> {
        try {
            // If updating email, check if it's already in use
            if (data.email) {
                const existingUser = await this.userService.findByEmail(data.email);
                if (existingUser && existingUser.id !== data.id) {
                    throw new Error('Email is already in use by another account');
                }
            }

            return await this.update(auditorId, data);
        } catch (error) {
            this.handleServiceError(error);
            throw error;
        }
    }

    // Additional auditor-specific business logic can be added here
    async assignAuditorToRegion(auditorId: string, region: string): Promise<boolean> {
        // This would be implemented based on your specific business requirements
        // For now, returning a placeholder implementation
        try {
            console.log(`Assigning auditor ${auditorId} to region ${region}`);
            // In a real implementation, you would store this assignment in the database
            return true;
        } catch (error) {
            this.handleServiceError(error);
            return false;
        }
    }

    async getAuditorAssignments(auditorId: string): Promise<string[]> {
        // This would be implemented based on your specific business requirements
        // For now, returning a placeholder implementation
        try {
            console.log(`Getting assignments for auditor ${auditorId}`);
            // In a real implementation, you would fetch assignments from the database
            return ['Assignment 1', 'Assignment 2'];
        } catch (error) {
            this.handleServiceError(error);
            return [];
        }
    }
}