import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";
import { AuditorInspectionModel } from "../models/AuditorInspectionModel";
import { AuditorInspectionService } from "../services/AuditorInspectionService";
import { requireValidId } from "../utils/ParamUtils";

export class AuditorInspectionController extends BaseController<AuditorInspectionModel> {
  private auditorInspectionService: AuditorInspectionService;

  constructor(auditorInspectionService: AuditorInspectionService) {
    super(auditorInspectionService);
    this.auditorInspectionService = auditorInspectionService;
  }

  async createAuditorInspection(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const { auditorId, inspectionId } = data;

      // Basic validation
      if (!auditorId || !inspectionId) {
        return NextResponse.json(
          { message: "Auditor ID and Inspection ID are required" },
          { status: 400 }
        );
      }

      // Convert IDs to numbers if needed
      let auditorIdNum: number;
      let inspectionIdNum: number;
      try {
        auditorIdNum = requireValidId(auditorId, "auditorId");
        inspectionIdNum = requireValidId(inspectionId, "inspectionId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const auditorInspection =
        await this.auditorInspectionService.createAuditorInspection(
          auditorIdNum,
          inspectionIdNum
        );

      return NextResponse.json(auditorInspection.toJSON(), { status: 201 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async getAuditorInspectionsByAuditorId(
    req: NextRequest
  ): Promise<NextResponse> {
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

      const auditorInspections =
        await this.auditorInspectionService.getAuditorInspectionsByAuditorId(
          auditorId
        );
      const auditorInspectionsJson = auditorInspections.map((ai) =>
        ai.toJSON()
      );

      return NextResponse.json(auditorInspectionsJson, { status: 200 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async getAuditorInspectionsByInspectionId(
    req: NextRequest
  ): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const inspectionIdParam = searchParams.get("inspectionId");

      if (!inspectionIdParam) {
        return NextResponse.json(
          { message: "Inspection ID is required" },
          { status: 400 }
        );
      }

      let inspectionId: number;
      try {
        inspectionId = requireValidId(inspectionIdParam, "inspectionId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const auditorInspections =
        await this.auditorInspectionService.getAuditorInspectionsByInspectionId(
          inspectionId
        );
      const auditorInspectionsJson = auditorInspections.map((ai) =>
        ai.toJSON()
      );

      return NextResponse.json(auditorInspectionsJson, { status: 200 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  protected async createModel(data: any): Promise<AuditorInspectionModel> {
    return AuditorInspectionModel.create(data.auditorId, data.inspectionId);
  }
}
