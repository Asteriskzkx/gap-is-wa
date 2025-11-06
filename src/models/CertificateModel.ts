import { BaseModel } from "./BaseModel";

export class CertificateModel extends BaseModel {
  certificateId: number;
  inspectionId: number;
  pdfFileUrl: string;
  version?: number;

  constructor(
    certificateId: number,
    inspectionId: number,
    pdfFileUrl: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    version?: number
  ) {
    super(certificateId, createdAt, updatedAt);
    this.certificateId = certificateId;
    this.inspectionId = inspectionId;
    this.pdfFileUrl = pdfFileUrl;
    this.version = version;
  }

  static createCertificate(
    inspectionId: number,
    pdfFileUrl: string
  ): CertificateModel {
    return new CertificateModel(0, inspectionId, pdfFileUrl);
  }

  validate(): boolean {
    return (
      typeof this.inspectionId === "number" &&
      this.inspectionId > 0 &&
      typeof this.pdfFileUrl === "string" &&
      this.pdfFileUrl.trim().length > 0
    );
  }

  toJSON(): Record<string, any> {
    return {
      certificateId: this.certificateId,
      inspectionId: this.inspectionId,
      pdfFileUrl: this.pdfFileUrl,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
