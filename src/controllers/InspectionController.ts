import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";
import { InspectionModel } from "../models/InspectionModel";
import { InspectionService } from "../services/InspectionService";
import { requireValidId } from "../utils/ParamUtils";
import { checkAuthorization, getSessionFromRequest } from "@/lib/session";
import { OptimisticLockError } from "../errors/OptimisticLockError";

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
        additionalAuditorIds || []
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

      const inspections =
        await this.inspectionService.getInspectionsByAuditorId(auditorId);
      const inspectionsJson = inspections.map((inspection) =>
        inspection.toJSON()
      );

      return NextResponse.json(inspectionsJson, { status: 200 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async updateInspectionStatus(
    req: NextRequest,
    { params }: { params: { id: string } }
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

      const updatedInspection =
        await this.inspectionService.updateInspectionStatus(
          inspectionId,
          status,
          version // Pass version for optimistic locking (optional, backward compatible)
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
    { params }: { params: { id: string } }
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

      const updatedInspection =
        await this.inspectionService.updateInspectionResult(
          inspectionId,
          result,
          version // Pass version for optimistic locking (optional, backward compatible)
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
