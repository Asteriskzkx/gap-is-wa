import { BaseModel } from "./BaseModel";

export class CertificateModel extends BaseModel {
  certificateId: number;
  inspectionId: number;
  effectiveDate: Date;
  expiryDate: Date;
  cancelRequestFlag: boolean;
  activeFlag: boolean;
  version?: number;

  // Relations
  inspection?: any;

  constructor(
    certificateId: number,
    inspectionId: number,
    effectiveDate: Date,
    expiryDate: Date,
    meta?: {
      createdAt?: Date;
      updatedAt?: Date;
      cancelRequestFlag?: boolean;
      activeFlag?: boolean;
      version?: number;
    }
  ) {
    const createdAt = meta?.createdAt ?? new Date();
    const updatedAt = meta?.updatedAt ?? new Date();
    super(certificateId, createdAt, updatedAt);
    this.certificateId = certificateId;
    this.inspectionId = inspectionId;
    this.effectiveDate = effectiveDate;
    this.expiryDate = expiryDate;
    this.cancelRequestFlag = meta?.cancelRequestFlag ?? false;
    this.activeFlag = meta?.activeFlag ?? true;
    this.version = meta?.version;
  }

  // Create a certificate with sensible defaults: effectiveDate defaults to now,
  // expiryDate defaults to effectiveDate + 2 years (max allowed).
  static createCertificate(
    inspectionId: number,
    effectiveDate?: Date | string,
    expiryDate?: Date | string,
    cancelRequestFlag?: boolean,
    activeFlag?: boolean
  ): CertificateModel {
    const eff = effectiveDate ? new Date(effectiveDate) : new Date();

    let exp: Date;
    if (expiryDate) {
      exp = new Date(expiryDate);
    } else {
      exp = new Date(eff);
      exp.setFullYear(exp.getFullYear() + 2);
    }

    // Enforce maximum 2-year span
    const max = new Date(eff);
    max.setFullYear(max.getFullYear() + 2);
    if (exp > max) {
      exp = max;
    }

    return new CertificateModel(0, inspectionId, eff, exp, {
      createdAt: new Date(),
      updatedAt: new Date(),
      cancelRequestFlag: cancelRequestFlag ?? false,
      activeFlag: activeFlag ?? true,
    });
  }

  validate(): boolean {
    if (typeof this.inspectionId !== "number" || this.inspectionId <= 0) {
      return false;
    }

    if (
      !(this.effectiveDate instanceof Date) ||
      Number.isNaN(this.effectiveDate.getTime())
    ) {
      return false;
    }

    if (
      !(this.expiryDate instanceof Date) ||
      Number.isNaN(this.expiryDate.getTime())
    ) {
      return false;
    }

    // expiryDate must be >= effectiveDate and <= effectiveDate + 2 years
    const eff = this.effectiveDate;
    const exp = this.expiryDate;
    if (exp < eff) return false;

    const max = new Date(eff);
    max.setFullYear(max.getFullYear() + 2);
    if (exp > max) return false;

    if (typeof this.cancelRequestFlag !== "boolean") return false;
    if (typeof this.activeFlag !== "boolean") return false;

    return true;
  }

  toJSON(): Record<string, any> {
    return {
      certificateId: this.certificateId,
      inspectionId: this.inspectionId,
      effectiveDate: this.effectiveDate,
      expiryDate: this.expiryDate,
      cancelRequestFlag: this.cancelRequestFlag,
      activeFlag: this.activeFlag,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      inspection: this.inspection || null,
    };
  }
}
