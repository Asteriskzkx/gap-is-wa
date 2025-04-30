import { BaseService } from './BaseService';
import { CommitteeModel } from '../models/CommitteeModel';
import { CommitteeRepository } from '../repositories/CommitteeRepository';
import { UserService } from './UserService';

export class CommitteeService extends BaseService<CommitteeModel> {
    private committeeRepository: CommitteeRepository;
    private userService: UserService;

    constructor(committeeRepository: CommitteeRepository, userService: UserService) {
        super(committeeRepository);
        this.committeeRepository = committeeRepository;
        this.userService = userService;
    }

    async registerCommittee(committeeData: {
        email: string;
        password: string;
        namePrefix: string;
        firstName: string;
        lastName: string;
    }): Promise<CommitteeModel> {
        try {
            // Check if user already exists
            const existingUser = await this.userService.findByEmail(committeeData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Create new committee
            const committeeModel = await CommitteeModel.createCommittee(
                committeeData.email,
                committeeData.password,
                committeeData.namePrefix,
                committeeData.firstName,
                committeeData.lastName
            );

            return await this.create(committeeModel);
        } catch (error) {
            this.handleServiceError(error);
            throw error;
        }
    }

    async getCommitteeByUserId(userId: string): Promise<CommitteeModel | null> {
        try {
            return await this.committeeRepository.findByUserId(userId);
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }

    async updateCommitteeProfile(committeeId: string, data: Partial<CommitteeModel>): Promise<CommitteeModel | null> {
        try {
            // If updating email, check if it's already in use
            if (data.email) {
                const existingUser = await this.userService.findByEmail(data.email);
                if (existingUser && existingUser.id !== data.id) {
                    throw new Error('Email is already in use by another account');
                }
            }

            return await this.update(committeeId, data);
        } catch (error) {
            this.handleServiceError(error);
            throw error;
        }
    }

    // Committee-specific business logic
    async reviewAudit(auditId: string, committeeId: string, decision: string, comments: string): Promise<boolean> {
        // This would be implemented based on your specific business requirements
        // For now, returning a placeholder implementation
        try {
            console.log(`Committee ${committeeId} reviewed audit ${auditId} with decision: ${decision}`);
            // In a real implementation, you would store this review in the database
            return true;
        } catch (error) {
            this.handleServiceError(error);
            return false;
        }
    }

    async approveCertification(applicationId: string, committeeId: string): Promise<boolean> {
        // This would be implemented based on your specific business requirements
        // For now, returning a placeholder implementation
        try {
            console.log(`Committee ${committeeId} approved certification for application ${applicationId}`);
            // In a real implementation, you would update the certification status in the database
            return true;
        } catch (error) {
            this.handleServiceError(error);
            return false;
        }
    }
}