import { PrismaClient } from '@prisma/client';
import { BaseModel } from '../models/BaseModel';

export abstract class BaseRepository<T extends BaseModel> {
    protected prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    abstract create(model: T): Promise<T>;
    abstract findById(id: number): Promise<T | null>; // เปลี่ยนจาก string เป็น number
    abstract findAll(): Promise<T[]>;
    abstract update(id: number, data: Partial<T>): Promise<T | null>; // เปลี่ยนจาก string เป็น number
    abstract delete(id: number): Promise<boolean>; // เปลี่ยนจาก string เป็น number

    // Common utility methods can be added here
    protected handleDatabaseError(error: any): never {
        console.error('Database operation failed:', error);
        throw new Error(`Database operation failed: ${error.message}`);
    }
}