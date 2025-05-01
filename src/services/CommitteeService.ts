import { BaseService } from './BaseService';
import { CommitteeModel } from '../models/CommitteeModel';
import { CommitteeRepository } from '../repositories/CommitteeRepository';
import { UserService } from './UserService';
import jwt from 'jsonwebtoken';

export class CommitteeService extends BaseService<CommitteeModel> {
    private committeeRepository: CommitteeRepository;
    private userService: UserService;
    private jwtSecret: string;

    constructor(committeeRepository: CommitteeRepository, userService: UserService) {
        super(committeeRepository);
        this.committeeRepository = committeeRepository;
        this.userService = userService;
        this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    }

    async login(email: string, password: string): Promise<{ committee: CommitteeModel; token: string } | null> {
        try {
            // First authenticate using UserService
            const userResult = await this.userService.login(email, password);
            if (!userResult) {
                return null;
            }

            // Check if the user is a committee member
            const { user, token } = userResult;
            if (user.role !== 'COMMITTEE') {
                return null;
            }

            // Get committee profile
            const committee = await this.committeeRepository.findByUserId(user.id);
            if (!committee) {
                return null;
            }

            // Generate committee-specific token with more info
            const committeeToken = this.generateToken(committee);

            return { committee, token: committeeToken };
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
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

    async getCommitteeByUserId(userId: number): Promise<CommitteeModel | null> {
        try {
            return await this.committeeRepository.findByUserId(userId);
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }

    async updateCommitteeProfile(committeeId: number, data: Partial<CommitteeModel>): Promise<CommitteeModel | null> {
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
    async reviewAudit(auditId: number, committeeId: number, decision: string, comments: string): Promise<boolean> {
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

    async approveCertification(applicationId: number, committeeId: number): Promise<boolean> {
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

    private generateToken(committee: CommitteeModel): string {
        return jwt.sign(
            {
                userId: committee.id,
                committeeId: committee.committeeId,
                email: committee.email,
                role: committee.role,
                name: committee.name,
                fullName: `${committee.namePrefix}${committee.firstName} ${committee.lastName}`
            },
            this.jwtSecret,
            { expiresIn: '24h' }
        );
    }

    verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            return null;
        }
    }
}