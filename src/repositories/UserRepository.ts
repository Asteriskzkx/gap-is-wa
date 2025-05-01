import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { UserModel, UserRole } from '../models/UserModel';

export class UserRepository extends BaseRepository<UserModel> {

    async create(model: UserModel): Promise<UserModel> {
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: model.email,
                    password: model.password,
                    hashedPassword: model.hashedPassword,
                    name: model.name,
                    role: model.role
                }
            });

            return this.mapToModel(user);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    async findById(id: number): Promise<UserModel | null> { // เปลี่ยนจาก string เป็น number
        try {
            const user = await this.prisma.user.findUnique({
                where: { userId: id }
            });

            return user ? this.mapToModel(user) : null;
        } catch (error) {
            this.handleDatabaseError(error);
            return null;
        }
    }

    async findByEmail(email: string): Promise<UserModel | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email }
            });

            return user ? this.mapToModel(user) : null;
        } catch (error) {
            this.handleDatabaseError(error);
            return null;
        }
    }

    async findAll(): Promise<UserModel[]> {
        try {
            const users = await this.prisma.user.findMany();
            return users.map(user => this.mapToModel(user));
        } catch (error) {
            this.handleDatabaseError(error);
            return [];
        }
    }

    async update(id: number, data: Partial<UserModel>): Promise<UserModel | null> { // เปลี่ยนจาก string เป็น number
        try {
            const user = await this.prisma.user.update({
                where: { userId: id },
                data: {
                    email: data.email,
                    name: data.name,
                    role: data.role as UserRole,
                    hashedPassword: data.hashedPassword,
                    updatedAt: new Date()
                }
            });

            return this.mapToModel(user);
        } catch (error) {
            console.error('Error updating user:', error);
            return null;
        }
    }

    async delete(id: number): Promise<boolean> { // เปลี่ยนจาก string เป็น number
        try {
            await this.prisma.user.delete({
                where: { userId: id }
            });

            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            return false;
        }
    }

    private mapToModel(prismaUser: PrismaUser): UserModel {
        return new UserModel(
            prismaUser.userId, // อ้างอิงตาม schema.prisma ที่เป็น Int
            prismaUser.email,
            '', // We don't store or return plain text passwords
            prismaUser.hashedPassword,
            prismaUser.name,
            prismaUser.role as UserRole,
            prismaUser.createdAt,
            prismaUser.updatedAt
        );
    }
}