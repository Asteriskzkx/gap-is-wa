import { CertificateModel } from "@/models/CertificateModel";
import { CertificateRepository } from "@/repositories/CertificateRepository";
import { AuditLogService } from "./AuditLogService";
import { BaseService } from "./BaseService";

export class CertificateService extends BaseService<CertificateModel> {
  private certificateRepository: CertificateRepository;
  private auditLogService: AuditLogService;

  constructor(
    certificateRepository: CertificateRepository,
    auditLogService: AuditLogService
  ) {
    super(certificateRepository);
    this.certificateRepository = certificateRepository;
    this.auditLogService = auditLogService;
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
    multiSortMeta?: string | Array<{ field: string; order: number }>;
    limit?: number;
    offset?: number;
    activeFlag?: boolean;
    cancelRequestFlag?: boolean;
    farmerId?: number;
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
    cancelRequestDetail?: string,
    version?: number
  ): Promise<CertificateModel | null> {
    try {
      const payload: any = {
        cancelRequestFlag: true,
        cancelRequestDetail: cancelRequestDetail,
        activeFlag: false,
      };

      // If a version is provided, use optimistic locking update
      if (version !== undefined && !Number.isNaN(Number(version))) {
        return await this.certificateRepository.updateWithLock(
          certificateId,
          payload,
          Number(version)
        );
      }

      const updated = await this.certificateRepository.update(
        certificateId,
        payload
      );

      return updated;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }

  async updateCancelRequestDetail(
    certificateId: number,
    cancelRequestDetail: string,
    version: number,
    userId?: number
  ): Promise<CertificateModel | null> {
    try {
      const payload: any = {
        cancelRequestFlag: true,
        cancelRequestDetail: cancelRequestDetail,
      };

      const oldRecord = await this.certificateRepository.findById(
        certificateId
      );

      let updated: CertificateModel | null;

      updated = await this.certificateRepository.updateWithLock(
        certificateId,
        payload,
        Number(version)
      );

      if (updated && oldRecord && this.auditLogService && userId) {
        const {
          createdAt: oldCreatedAt,
          updatedAt: oldUpdatedAt,
          inspection: oldInspection,
          ...oldData
        } = oldRecord.toJSON();
        const {
          createdAt: newCreatedAt,
          updatedAt: newUpdatedAt,
          inspection: newInspection,
          ...createdData
        } = updated.toJSON();

        await this.auditLogService.logAction(
          "Certificate",
          "UPDATE",
          updated.certificateId,
          userId,
          oldData,
          createdData
        );
      }

      return updated;
    } catch (error) {
      this.handleServiceError(error);
      throw error;
    }
  }
}
