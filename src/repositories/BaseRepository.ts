import { PrismaClient } from '@prisma/client';
import { BaseModel } from '../models/BaseModel';

export abstract class BaseRepository<T extends BaseModel> {
    protected prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    abstract create(model: T): Promise<T>;
    abstract findById(id: string): Promise<T | null>;
    abstract findAll(): Promise<T[]>;
    abstract update(id: string, data: Partial<T>): Promise<T | null>;
    abstract delete(id: string): Promise<boolean>;

    // Common utility methods can be added here
    protected handleDatabaseError(error: any): never {
        console.error('Database operation failed:', error);
        throw new Error(`Database operation failed: ${error.message}`);
    }
}