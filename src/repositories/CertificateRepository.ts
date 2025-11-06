import { BaseRepository } from "./BaseRepository";
import { BaseMapper } from "@/mappers/BaseMapper";
import { CertificateModel } from "@/models/CertificateModel";

export class CertificateRepository extends BaseRepository<CertificateModel> {
  constructor(mapper: BaseMapper<any, CertificateModel>) {
    super(mapper);
  }

  async create(model: CertificateModel): Promise<CertificateModel> {
    try {
      const cert = await this.prisma.certificate.create({
        data: this.mapper.toPrisma(model),
      });

      return this.mapper.toDomain(cert);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async findById(id: number): Promise<CertificateModel | null> {
    try {
      const cert = await this.prisma.certificate.findUnique({
        where: { certificateId: id },
      });

      return cert ? this.mapper.toDomain(cert) : null;
    } catch (error) {
      console.error("Error finding certificate by ID:", error);
      return null;
    }
  }

  async findAll(): Promise<CertificateModel[]> {
    try {
      const certs = await this.prisma.certificate.findMany();
      return certs.map((c) => this.mapper.toDomain(c));
    } catch (error) {
      console.error("Error finding all certificates:", error);
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<CertificateModel>
  ): Promise<CertificateModel | null> {
    try {
      const updated = await this.prisma.certificate.update({
        where: { certificateId: id },
        data: {
          inspectionId: data.inspectionId,
          pdfFileUrl: data.pdfFileUrl,
          version: data.version,
          updatedAt: new Date(),
        },
      });

      return this.mapper.toDomain(updated);
    } catch (error) {
      console.error("Error updating certificate:", error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.certificate.delete({ where: { certificateId: id } });
      return true;
    } catch (error) {
      console.error("Error deleting certificate:", error);
      return false;
    }
  }

  async linkCommittee(committeeId: number, certificateId: number) {
    try {
      await this.prisma.committeeCertificate.create({
        data: {
          committeeId,
          certificateId,
        },
      });

      return true;
    } catch (error) {
      console.error("Error linking committee to certificate:", error);
      return false;
    }
  }
}
