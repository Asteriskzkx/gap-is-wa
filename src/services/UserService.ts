import { BaseService } from './BaseService';
import { UserModel } from '../models/UserModel';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserService extends BaseService<UserModel> {
    private userRepository: UserRepository;
    private jwtSecret: string;

    constructor(userRepository: UserRepository) {
        super(userRepository);
        this.userRepository = userRepository;
        this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    }

    async findByEmail(email: string): Promise<UserModel | null> {
        try {
            return await this.userRepository.findByEmail(email);
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }

    async register(userData: {
        email: string;
        password: string;
        name: string;
        role?: string;
    }): Promise<UserModel> {
        try {
            // Check if user already exists
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Create new user
            const userModel = await UserModel.create(
                userData.email,
                userData.password,
                userData.name,
                userData.role as any || undefined
            );

            return await this.create(userModel);
        } catch (error) {
            this.handleServiceError(error);
            throw error;
        }
    }

    async login(email: string, password: string): Promise<{ user: UserModel; token: string } | null> {
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                return null;
            }

            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return null;
            }

            const token = this.generateToken(user);
            return { user, token };
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
        try {
            const user = await this.getById(userId);
            if (!user) {
                return false;
            }

            const isPasswordValid = await user.comparePassword(currentPassword);
            if (!isPasswordValid) {
                return false;
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.update(userId, {
                password: newPassword,
                hashedPassword
            });

            return true;
        } catch (error) {
            this.handleServiceError(error);
            return false;
        }
    }

    private generateToken(user: UserModel): string {
        return jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
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