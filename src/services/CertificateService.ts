import { BaseService } from "./BaseService";
import { CertificateModel } from "@/models/CertificateModel";
import { CertificateRepository } from "@/repositories/CertificateRepository";

export class CertificateService extends BaseService<CertificateModel> {
  private certificateRepository: CertificateRepository;

  constructor(certificateRepository: CertificateRepository) {
    super(certificateRepository);
    this.certificateRepository = certificateRepository;
  }

  async uploadCertificate(data: {
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
}
