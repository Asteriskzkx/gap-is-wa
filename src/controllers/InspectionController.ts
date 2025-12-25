import { checkAuthorization } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { OptimisticLockError } from "../errors/OptimisticLockError";
import { InspectionModel } from "../models/InspectionModel";
import { InspectionService } from "../services/InspectionService";
import { requireValidId } from "../utils/ParamUtils";
import { BaseController } from "./BaseController";

export class InspectionController extends BaseController<InspectionModel> {
  private inspectionService: InspectionService;

  constructor(inspectionService: InspectionService) {
    super(inspectionService);
    this.inspectionService = inspectionService;
  }

  async scheduleInspection(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const {
        rubberFarmId,
        inspectionTypeId,
        inspectionDateAndTime,
        additionalAuditorIds,
      } = data;

      // ตรวจสอบ authorization ด้วย NextAuth
      const { authorized, session, error } = await checkAuthorization(req, [
        "AUDITOR",
      ]);

      if (!authorized || !session) {
        return NextResponse.json(
          { message: error || "Authorization required" },
          { status: 401 }
        );
      }

      const userId = session ? Number(session.user.id) : undefined;

      // ดึง auditorId จาก session
      const auditorId = session.user.roleData?.auditorId;
      if (!auditorId) {
        return NextResponse.json(
          { message: "Auditor data not found in session" },
          { status: 400 }
        );
      }

      // Basic validation
      if (!rubberFarmId || !inspectionTypeId || !inspectionDateAndTime) {
        return NextResponse.json(
          { message: "Required fields missing" },
          { status: 400 }
        );
      }

      // ใช้ auditorId จาก session เป็น auditorChiefId โดยอัตโนมัติ
      const auditorChiefId = auditorId;

      // สร้างการตรวจประเมินพร้อมรายการตรวจและข้อกำหนดตามประเภทที่เลือก
      const inspection = await this.inspectionService.scheduleInspection(
        rubberFarmId,
        inspectionTypeId,
        new Date(inspectionDateAndTime),
        auditorChiefId,
        additionalAuditorIds || [],
        userId
      );

      return NextResponse.json(inspection, { status: 201 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async createInspection(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const {
        inspectionNo,
        inspectionDateAndTime,
        inspectionTypeId,
        inspectionStatus,
        inspectionResult,
        auditorChiefId,
        rubberFarmId,
        auditorIds,
      } = data;

      // Basic validation
      if (
        !inspectionNo ||
        !inspectionTypeId ||
        !inspectionStatus ||
        !inspectionResult ||
        !auditorChiefId ||
        !rubberFarmId
      ) {
        return NextResponse.json(
          { message: "Required fields missing" },
          { status: 400 }
        );
      }

      // Parse the date if it's a string
      const parsedDate =
        inspectionDateAndTime instanceof Date
          ? inspectionDateAndTime
          : new Date(inspectionDateAndTime);

      const inspection = await this.inspectionService.createInspection({
        inspectionNo,
        inspectionDateAndTime: parsedDate,
        inspectionTypeId,
        inspectionStatus,
        inspectionResult,
        auditorChiefId,
        rubberFarmId,
        auditorIds,
      });

      return NextResponse.json(inspection.toJSON(), { status: 201 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async getInspectionsByRubberFarm(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const rubberFarmIdParam = searchParams.get("rubberFarmId");

      if (!rubberFarmIdParam) {
        return NextResponse.json(
          { message: "Rubber Farm ID is required" },
          { status: 400 }
        );
      }

      let rubberFarmId: number;
      try {
        rubberFarmId = requireValidId(rubberFarmIdParam, "rubberFarmId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const inspections =
        await this.inspectionService.getInspectionsByRubberFarmId(rubberFarmId);
      const inspectionsJson = inspections.map((inspection) =>
        inspection.toJSON()
      );

      return NextResponse.json(inspectionsJson, { status: 200 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async getInspectionsByAuditor(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const auditorIdParam = searchParams.get("auditorId");

      if (!auditorIdParam) {
        return NextResponse.json(
          { message: "Auditor ID is required" },
          { status: 400 }
        );
      }

      let auditorId: number;
      try {
        auditorId = requireValidId(auditorIdParam, "auditorId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      // Pagination parameters
      const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
      const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

      // Filter parameters
      const inspectionNo = searchParams.get("inspectionNo") || undefined;
      const inspectionStatus =
        searchParams.get("inspectionStatus") || undefined;
      const inspectionResult =
        searchParams.get("inspectionResult") || undefined;
      const province = searchParams.get("province") || undefined;
      const district = searchParams.get("district") || undefined;
      const subDistrict = searchParams.get("subDistrict") || undefined;

      // Sort parameters
      const sortField = searchParams.get("sortField") || undefined;
      const sortOrder = searchParams.get("sortOrder") || undefined;
      const multiSortMeta = searchParams.get("multiSortMeta") || undefined;

      const result = await this.inspectionService.getInspectionsByAuditorId(
        auditorId,
        {
          inspectionNo,
          inspectionStatus,
          inspectionResult,
          province,
          district,
          subDistrict,
          sortField,
          sortOrder: sortOrder as "asc" | "desc" | undefined,
          multiSortMeta: multiSortMeta ? JSON.parse(multiSortMeta) : undefined,
          limit,
          offset,
        }
      );

      return NextResponse.json(
        {
          results: result.data,
          paginator: {
            limit,
            offset,
            total: result.total,
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  // Override getAll to support pagination, filtering and sorting for the public inspections endpoint
  async getAll(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);

      // Pagination parameters
      const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
      const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

      // Filter parameters
      const inspectionNo = searchParams.get("inspectionNo") || undefined;
      const inspectionStatus =
        searchParams.get("inspectionStatus") || undefined;
      const inspectionResult =
        searchParams.get("inspectionResult") || undefined;
      const province = searchParams.get("province") || undefined;
      const district = searchParams.get("district") || undefined;
      const subDistrict = searchParams.get("subDistrict") || undefined;

      // Sort parameters
      const sortField = searchParams.get("sortField") || undefined;
      const sortOrder = searchParams.get("sortOrder") || undefined;
      const multiSortMeta = searchParams.get("multiSortMeta") || undefined;

      const result = await this.inspectionService.getAllWithPagination({
        inspectionNo,
        inspectionStatus,
        inspectionResult,
        province,
        district,
        subDistrict,
        sortField,
        sortOrder: sortOrder as "asc" | "desc" | undefined,
        multiSortMeta: multiSortMeta ? JSON.parse(multiSortMeta) : undefined,
        limit,
        offset,
      });

      return NextResponse.json(
        {
          results: result.data,
          paginator: {
            limit,
            offset,
            total: result.total,
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  // GET /api/v1/inspections/ready-to-issue
  async getReadyToIssue(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);

      // Pagination
      const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
      const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

      // Date range
      const fromDate = searchParams.get("from") || undefined;
      const toDate = searchParams.get("to") || undefined;

      const result = await this.inspectionService.getReadyToIssueInspections({
        fromDate,
        toDate,
        limit,
        offset,
        sortField: searchParams.get("sortField") || undefined,
        sortOrder:
          (searchParams.get("sortOrder") as "asc" | "desc") || undefined,
        multiSortMeta: searchParams.get("multiSortMeta")
          ? JSON.parse(searchParams.get("multiSortMeta") || "[]")
          : undefined,
      });

      return NextResponse.json(
        {
          results: result.data,
          paginator: {
            limit,
            offset,
            total: result.total,
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async updateInspectionStatus(
    req: NextRequest,
    { params }: { params: { id: string } },
    session?: any
  ): Promise<NextResponse> {
    try {
      let inspectionId: number;
      try {
        inspectionId = requireValidId(params.id, "inspectionId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const data = await req.json();
      const { status, version } = data;

      if (!status) {
        return NextResponse.json(
          { message: "Status is required" },
          { status: 400 }
        );
      }

      // Validate that version is provided
      if (version === undefined || version === null) {
        return NextResponse.json(
          { message: "Version is required for optimistic locking" },
          { status: 400 }
        );
      }

      const userId = session ? Number(session.user.id) : undefined;

      const updatedInspection =
        await this.inspectionService.updateInspectionStatus(
          inspectionId,
          status,
          version,
          userId
        );

      if (!updatedInspection) {
        return NextResponse.json(
          { message: "Inspection not found or update failed" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedInspection.toJSON(), { status: 200 });
    } catch (error: any) {
      // Handle optimistic lock error specifically
      if (error instanceof OptimisticLockError) {
        return NextResponse.json(error.toJSON(), { status: 409 }); // 409 Conflict
      }
      return this.handleControllerError(error);
    }
  }

  async updateInspectionResult(
    req: NextRequest,
    { params }: { params: { id: string } },
    session?: any
  ): Promise<NextResponse> {
    try {
      let inspectionId: number;
      try {
        inspectionId = requireValidId(params.id, "inspectionId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const data = await req.json();
      const { result, version } = data;

      if (!result) {
        return NextResponse.json(
          { message: "Result is required" },
          { status: 400 }
        );
      }

      // Validate that version is provided
      if (version === undefined || version === null) {
        return NextResponse.json(
          { message: "Version is required for optimistic locking" },
          { status: 400 }
        );
      }

      const userId = session ? Number(session.user.id) : undefined;

      const updatedInspection =
        await this.inspectionService.updateInspectionResult(
          inspectionId,
          result,
          version,
          userId
        );

      if (!updatedInspection) {
        return NextResponse.json(
          { message: "Inspection not found or update failed" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedInspection.toJSON(), { status: 200 });
    } catch (error: any) {
      // Handle optimistic lock error specifically
      if (error instanceof OptimisticLockError) {
        return NextResponse.json(error.toJSON(), { status: 409 }); // 409 Conflict
      }
      return this.handleControllerError(error);
    }
  }

  async addAuditorToInspection(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const { inspectionId, auditorId } = data;

      if (!inspectionId || !auditorId) {
        return NextResponse.json(
          { message: "Inspection ID and Auditor ID are required" },
          { status: 400 }
        );
      }

      // Convert IDs to numbers if needed
      let inspectionIdNum: number;
      let auditorIdNum: number;
      try {
        inspectionIdNum = requireValidId(inspectionId, "inspectionId");
        auditorIdNum = requireValidId(auditorId, "auditorId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const success = await this.inspectionService.addAuditorToInspection(
        inspectionIdNum,
        auditorIdNum
      );

      if (!success) {
        return NextResponse.json(
          { message: "Failed to add auditor to inspection" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Auditor added to inspection successfully" },
        { status: 200 }
      );
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async removeAuditorFromInspection(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const { inspectionId, auditorId } = data;

      if (!inspectionId || !auditorId) {
        return NextResponse.json(
          { message: "Inspection ID and Auditor ID are required" },
          { status: 400 }
        );
      }

      // Convert IDs to numbers if needed
      let inspectionIdNum: number;
      let auditorIdNum: number;
      try {
        inspectionIdNum = requireValidId(inspectionId, "inspectionId");
        auditorIdNum = requireValidId(auditorId, "auditorId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const success = await this.inspectionService.removeAuditorFromInspection(
        inspectionIdNum,
        auditorIdNum
      );

      if (!success) {
        return NextResponse.json(
          { message: "Failed to remove auditor from inspection" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Auditor removed from inspection successfully" },
        { status: 200 }
      );
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  protected async createModel(data: any): Promise<InspectionModel> {
    const inspectionDateAndTime =
      data.inspectionDateAndTime instanceof Date
        ? data.inspectionDateAndTime
        : new Date(data.inspectionDateAndTime || new Date());

    return InspectionModel.create(
      data.inspectionNo,
      inspectionDateAndTime,
      data.inspectionTypeId,
      data.inspectionStatus,
      data.inspectionResult,
      data.auditorChiefId,
      data.rubberFarmId
    );
  }
}
