import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";
import { CertificateModel } from "@/models/CertificateModel";
import { CertificateService } from "@/services/CertificateService";
import { checkAuthorization } from "@/lib/session";

export class CertificateController extends BaseController<CertificateModel> {
  private certificateService: CertificateService;

  constructor(certificateService: CertificateService) {
    super(certificateService);
    this.certificateService = certificateService;
  }

  async uploadCertificate(req: NextRequest): Promise<NextResponse> {
    try {
      // Ensure only COMMITTEE or ADMIN can call
      const { authorized, session, error } = await checkAuthorization(req, [
        "COMMITTEE",
        "ADMIN",
      ]);

      if (!authorized) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      const data = await req.json();
      const { inspectionId, effectiveDate, expiryDate } = data;

      if (!inspectionId) {
        return NextResponse.json(
          { message: "inspectionId is required" },
          { status: 400 }
        );
      }

      // If committee role, try to get committeeId from session.roleData
      let committeeId: number | undefined;
      if (session && session.user && session.user.role === "COMMITTEE") {
        committeeId =
          session.user.roleData?.committeeId || session.user.roleData?.id;
      }

      const created = await this.certificateService.uploadCertificate({
        inspectionId: Number(inspectionId),
        effectiveDate,
        expiryDate,
        committeeId,
      });

      return NextResponse.json(created, { status: 201 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  protected async createModel(data: any): Promise<CertificateModel> {
    return CertificateModel.createCertificate(
      Number(data.inspectionId),
      data.effectiveDate,
      data.expiryDate
    );
  }
}
