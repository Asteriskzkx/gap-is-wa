import { CertificateModel } from "@/models/CertificateModel";
import { CertificateRepository } from "@/repositories/CertificateRepository";
import { BaseService } from "./BaseService";

export class CertificateService extends BaseService<CertificateModel> {
  private certificateRepository: CertificateRepository;

  constructor(certificateRepository: CertificateRepository) {
    super(certificateRepository);
    this.certificateRepository = certificateRepository;
  }

  async createCertificate(data: {
    inspectionId: number;
    effectiveDate?: Date | string;
    expiryDate?: Date | string;
    committeeId?: number;
  }): Promise<CertificateModel> {
    try {
      const model = CertificateModel.createCertificate(
        data.inspectionId,
        data.effectiveDate,
        data.expiryDate
      );

      const created = await this.create(model);

      if (data.committeeId) {
        await this.certificateRepository.linkCommittee(
          data.committeeId,
          (created as any).certificateId || created.id
        );
      }

      return created;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async getAlreadyIssued(options?: {
    fromDate?: string;
    toDate?: string;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    multiSortMeta?: Array<{ field: string; order: number }>;
    limit?: number;
    offset?: number;
    activeFlag?: boolean;
    cancelRequestFlag?: boolean;
  }): Promise<{ data: CertificateModel[]; total: number }> {
    try {
      return await this.certificateRepository.findAllWithPagination(options);
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async revokeCertificate(
    certificateId: number,
    cancelRequestDetail?: string
  ): Promise<CertificateModel | null> {
    try {
      const updated = await this.certificateRepository.update(certificateId, {
        cancelRequestFlag: true,
        cancelRequestDetail: cancelRequestDetail,
        activeFlag: false,
      } as any);

      return updated;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }
}
