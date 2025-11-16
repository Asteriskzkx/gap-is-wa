import { BaseMapper } from "@/mappers/BaseMapper";
import { CertificateModel } from "@/models/CertificateModel";
import { BaseRepository } from "./BaseRepository";

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

  async findAllWithPagination(options?: {
    fromDate?: string;
    toDate?: string;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    multiSortMeta?: Array<{ field: string; order: number }>;
    limit?: number;
    offset?: number;
    activeFlag?: boolean;
  }): Promise<{ data: CertificateModel[]; total: number }> {
    try {
      const where: any = {};

      if (options?.fromDate || options?.toDate) {
        where.effectiveDate = {} as any;
        if (options?.fromDate) {
          where.effectiveDate.gte = new Date(options.fromDate);
        }
        if (options?.toDate) {
          where.effectiveDate.lte = new Date(options.toDate);
        }
      }

      if (typeof options?.activeFlag === "boolean") {
        where.activeFlag = options?.activeFlag;
      }

      const mapSortFieldToPrisma = (field: string, order: "asc" | "desc") => {
        const cleanField = field.replaceAll("?", "");
        const parts = cleanField.split(".");
        if (parts.length === 1) {
          return { [parts[0]]: order } as any;
        }

        return parts.reduceRight((acc: any, part: string) => {
          if (Object.keys(acc).length === 0) {
            return { [part]: order };
          }
          return { [part]: acc };
        }, {} as any);
      };

      let orderBy: any = {};
      if (options?.multiSortMeta && options.multiSortMeta.length > 0) {
        orderBy = options.multiSortMeta.map((sort) => {
          const order = sort.order === 1 ? "asc" : "desc";
          return mapSortFieldToPrisma(sort.field, order);
        });
      } else if (options?.sortField) {
        orderBy = mapSortFieldToPrisma(
          options.sortField,
          options.sortOrder === "desc" ? "desc" : "asc"
        );
      } else {
        orderBy = { createdAt: "desc" };
      }

      const limit = options?.limit ?? 10;
      const offset = options?.offset ?? 0;

      const [items, total] = await Promise.all([
        this.prisma.certificate.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
          include: {
            inspection: {
              include: {
                rubberFarm: true,
                auditorChief: true,
              },
            },
            committeeCertificates: true,
          },
        }),
        this.prisma.certificate.count({ where }),
      ]);

      return { data: items.map((c) => this.mapper.toDomain(c)), total };
    } catch (error) {
      console.error("Error finding certificates with pagination:", error);
      return { data: [], total: 0 };
    }
  }

  async update(
    id: number,
    data: Partial<CertificateModel>
  ): Promise<CertificateModel | null> {
    try {
      const updateData: any = {
        inspectionId: data.inspectionId,
        effectiveDate: (data as any).effectiveDate,
        expiryDate: (data as any).expiryDate,
        cancelRequestFlag: (data as any).cancelRequestFlag,
        activeFlag: (data as any).activeFlag,
        version: data.version,
        updatedAt: new Date(),
      };

      const updated = await this.prisma.certificate.update({
        where: { certificateId: id },
        data: updateData,
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
