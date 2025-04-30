import { BaseModel } from '../models/BaseModel';
import { BaseRepository } from '../repositories/BaseRepository';

export abstract class BaseService<T extends BaseModel> {
    protected repository: BaseRepository<T>;

    constructor(repository: BaseRepository<T>) {
        this.repository = repository;
    }

    async getById(id: string): Promise<T | null> {
        try {
            return await this.repository.findById(id);
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }

    async getAll(): Promise<T[]> {
        try {
            return await this.repository.findAll();
        } catch (error) {
            this.handleServiceError(error);
            return [];
        }
    }

    async create(model: T): Promise<T> {
        try {
            if (!model.validate()) {
                throw new Error('Invalid model data');
            }
            return await this.repository.create(model);
        } catch (error) {
            this.handleServiceError(error);
            throw error;
        }
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        try {
            return await this.repository.update(id, data);
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            return await this.repository.delete(id);
        } catch (error) {
            this.handleServiceError(error);
            return false;
        }
    }

    protected handleServiceError(error: any): void {
        console.error('Service operation failed:', error);
        // Additional error handling logic can be implemented here
    }
}