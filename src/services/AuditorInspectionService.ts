import { BaseService } from "./BaseService";
import { AuditorInspectionModel } from "../models/AuditorInspectionModel";
import { AuditorInspectionRepository } from "../repositories/AuditorInspectionRepository";

export class AuditorInspectionService extends BaseService<AuditorInspectionModel> {
  private auditorInspectionRepository: AuditorInspectionRepository;

  constructor(auditorInspectionRepository: AuditorInspectionRepository) {
    super(auditorInspectionRepository);
    this.auditorInspectionRepository = auditorInspectionRepository;
  }

  async createAuditorInspection(
    auditorId: number,
    inspectionId: number
  ): Promise<AuditorInspectionModel> {
    try {
      const auditorInspectionModel = AuditorInspectionModel.create(
        auditorId,
        inspectionId
      );

      return await this.create(auditorInspectionModel);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getAuditorInspectionsByAuditorId(
    auditorId: number
  ): Promise<AuditorInspectionModel[]> {
    try {
      return await this.auditorInspectionRepository.findByAuditorId(auditorId);
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  async getAuditorInspectionsByInspectionId(
    inspectionId: number
  ): Promise<AuditorInspectionModel[]> {
    try {
      return await this.auditorInspectionRepository.findByInspectionId(
        inspectionId
      );
    } catch (error) {
      this.handleServiceError(error);
      return [];
    }
  }

  async deleteAuditorInspection(auditorInspectionId: number): Promise<boolean> {
    try {
      return await this.delete(auditorInspectionId);
    } catch (error) {
      this.handleServiceError(error);
      return false;
    }
  }
}
