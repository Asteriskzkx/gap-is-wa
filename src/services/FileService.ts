import { BaseService } from "./BaseService";
import { FileModel } from "@/models/FileModel";
import { FileRepository } from "@/repositories/FileRepository";

export class FileService extends BaseService<FileModel> {
  private readonly fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    super(fileRepository);
    this.fileRepository = fileRepository;
  }

  async createFile(model: FileModel): Promise<FileModel> {
    try {
      return await this.create(model);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async findByReference(
    tableReference: string,
    idReference: number
  ): Promise<FileModel[]> {
    try {
      return await this.fileRepository.findByReference(
        tableReference,
        idReference
      );
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }
}
