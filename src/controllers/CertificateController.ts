import { checkAuthorization } from "@/lib/session";
import { CertificateModel } from "@/models/CertificateModel";
import { CertificateService } from "@/services/CertificateService";
import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";

export class CertificateController extends BaseController<CertificateModel> {
  private certificateService: CertificateService;

  constructor(certificateService: CertificateService) {
    super(certificateService);
    this.certificateService = certificateService;
  }

  async createCertificate(req: NextRequest): Promise<NextResponse> {
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

      const created = await this.certificateService.createCertificate({
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

  // GET /api/v1/certificates/already-issue
  // GET /api/v1/certificates/revoke-list
  async getAlreadyIssued(req: NextRequest): Promise<NextResponse> {
    try {
      const { authorized, error } = await checkAuthorization(req, [
        "COMMITTEE",
        "ADMIN",
      ]);

      if (!authorized) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      const url = new URL(req.url);
      const params = url.searchParams;

      const fromDate = params.get("fromDate") || undefined;
      const toDate = params.get("toDate") || undefined;
      const sortField = params.get("sortField") || undefined;
      const sortOrder =
        (params.get("sortOrder") as "asc" | "desc") || undefined;
      const multiSortMeta = params.get("multiSortMeta") || undefined;
      const limit = params.get("limit")
        ? Number(params.get("limit"))
        : undefined;
      const offset = params.get("offset")
        ? Number(params.get("offset"))
        : undefined;
      const activeFlag = params.has("activeFlag")
        ? params.get("activeFlag") === "true"
        : undefined;

      const cancelRequestFlag = params.has("cancelRequestFlag")
        ? params.get("cancelRequestFlag") === "true"
        : undefined;

      const usedLimit = limit ?? 10;
      const usedOffset = offset ?? 0;

      const result = await this.certificateService.getAlreadyIssued({
        fromDate,
        toDate,
        sortField,
        sortOrder,
        multiSortMeta: multiSortMeta,
        limit: usedLimit,
        offset: usedOffset,
        activeFlag,
        cancelRequestFlag,
      });

      const results = result.data.map((m) => {
        const json = m.toJSON();
        json.cancelRequestDetail = m.cancelRequestDetail ?? null;
        return json;
      });

      return NextResponse.json(
        {
          results,
          paginator: {
            limit: usedLimit,
            offset: usedOffset,
            total: result.total,
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  // GET /api/v1/certificates/revoke-list-for-farmer
  async getAlreadyIssuedForFarmer(req: NextRequest): Promise<NextResponse> {
    try {
      const { authorized, session, error } = await checkAuthorization(req, [
        "FARMER",
      ]);

      if (!authorized) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }

      const farmerId =
        (session as any)?.user?.roleData?.farmerId ||
        (session as any)?.user?.roleData?.id;

      if (!farmerId) {
        return NextResponse.json(
          { message: "Farmer identification not found in session" },
          { status: 400 }
        );
      }

      const url = new URL(req.url);
      const params = url.searchParams;

      const fromDate = params.get("fromDate") || undefined;
      const toDate = params.get("toDate") || undefined;
      const sortField = params.get("sortField") || undefined;
      const sortOrder =
        (params.get("sortOrder") as "asc" | "desc") || undefined;
      const multiSortMeta = params.get("multiSortMeta") || undefined;
      const limit = params.get("limit")
        ? Number(params.get("limit"))
        : undefined;
      const offset = params.get("offset")
        ? Number(params.get("offset"))
        : undefined;
      const activeFlag = params.has("activeFlag")
        ? params.get("activeFlag") === "true"
        : undefined;

      const cancelRequestFlag = params.has("cancelRequestFlag")
        ? params.get("cancelRequestFlag") === "true"
        : undefined;

      const usedLimit = limit ?? 10;
      const usedOffset = offset ?? 0;

      const result = await this.certificateService.getAlreadyIssued({
        fromDate,
        toDate,
        sortField,
        sortOrder,
        multiSortMeta: multiSortMeta,
        limit: usedLimit,
        offset: usedOffset,
        activeFlag,
        cancelRequestFlag,
        farmerId: Number(farmerId),
      });

      const results = result.data.map((m) => {
        const json = m.toJSON();
        json.cancelRequestDetail = m.cancelRequestDetail ?? null;
        return json;
      });

      return NextResponse.json(
        {
          results,
          paginator: {
            limit: usedLimit,
            offset: usedOffset,
            total: result.total,
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async revokeCertificate(req: NextRequest): Promise<NextResponse> {
    try {
      const { authorized, error } = await checkAuthorization(req, [
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
      const certificateId = Number(data.certificateId || data.id);
      const cancelRequestDetail = data.cancelRequestDetail;
      const version =
        data.version === undefined ? undefined : Number(data.version);

      if (!certificateId || Number.isNaN(certificateId)) {
        return NextResponse.json(
          { message: "certificateId is required" },
          { status: 400 }
        );
      }

      const updated = await this.certificateService.revokeCertificate(
        certificateId,
        cancelRequestDetail,
        version
      );

      if (!updated) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }

      return NextResponse.json(updated.toJSON(), { status: 200 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async updateCancelRequestDetail(req: NextRequest): Promise<NextResponse> {
    try {
      const { authorized, error } = await checkAuthorization(req, [
        "FARMER",
        "ADMIN",
      ]);
      if (!authorized) {
        return NextResponse.json(
          { message: error || "Unauthorized" },
          { status: 401 }
        );
      }
      const data = await req.json();
      const certificateId = Number(data.certificateId || data.id);
      const cancelRequestDetail = data.cancelRequestDetail;
      const version = Number(data.version);
      if (!certificateId || Number.isNaN(certificateId)) {
        return NextResponse.json(
          { message: "certificateId is required" },
          { status: 400 }
        );
      }
      if (!cancelRequestDetail) {
        return NextResponse.json(
          { message: "cancelRequestDetail is required" },
          { status: 400 }
        );
      }
      const updated = await this.certificateService.updateCancelRequestDetail(
        certificateId,
        cancelRequestDetail,
        version
      );

      if (!updated) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }

      return NextResponse.json(updated.toJSON(), { status: 200 });
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
