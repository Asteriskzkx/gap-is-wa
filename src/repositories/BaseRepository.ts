import { prisma } from "../utils/db";
import { BaseModel } from "../models/BaseModel";
import { BaseMapper } from "../mappers/BaseMapper";

export abstract class BaseRepository<T extends BaseModel> {
  protected prisma = prisma;
  protected mapper: BaseMapper<any, T>;

  constructor(mapper: BaseMapper<any, T>) {
    this.mapper = mapper;
  }

  abstract create(model: T): Promise<T>;
  abstract findById(id: number): Promise<T | null>;
  abstract findAll(): Promise<T[]>;
  abstract update(id: number, data: Partial<T>): Promise<T | null>;
  abstract delete(id: number): Promise<boolean>;

  // Common utility methods can be added here
  protected handleDatabaseError(error: any): never {
    console.error("Database operation failed:", error);
    throw new Error(`Database operation failed: ${error.message}`);
  }
}
