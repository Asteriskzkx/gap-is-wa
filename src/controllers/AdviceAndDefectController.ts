import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";
import { AdviceAndDefectModel } from "../models/AdviceAndDefectModel";
import { AdviceAndDefectService } from "../services/AdviceAndDefectService";
import { requireValidId } from "../utils/ParamUtils";

export class AdviceAndDefectController extends BaseController<AdviceAndDefectModel> {
  private adviceAndDefectService: AdviceAndDefectService;

  constructor(adviceAndDefectService: AdviceAndDefectService) {
    super(adviceAndDefectService);
    this.adviceAndDefectService = adviceAndDefectService;
  }

  async createAdviceAndDefect(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const { inspectionId, date, adviceList, defectList } = data;

      // Basic validation
      if (!inspectionId) {
        return NextResponse.json(
          { message: "Inspection ID is required" },
          { status: 400 }
        );
      }

      // Parse the date if it's a string
      const parsedDate =
        date instanceof Date ? date : new Date(date || new Date());

      const adviceAndDefect =
        await this.adviceAndDefectService.createAdviceAndDefect({
          inspectionId,
          date: parsedDate,
          adviceList: adviceList || [],
          defectList: defectList || [],
        });

      return NextResponse.json(adviceAndDefect.toJSON(), { status: 201 });
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
      return this.handleControllerError(error);
    }
  }

  async getAdviceAndDefectByInspectionId(
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

      const adviceAndDefect =
        await this.adviceAndDefectService.getAdviceAndDefectByInspectionId(
          inspectionId
        );

      if (!adviceAndDefect) {
        return NextResponse.json(
          { message: "Advice and defect record not found for this inspection" },
          { status: 404 }
        );
      }

      return NextResponse.json(adviceAndDefect.toJSON(), { status: 200 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async updateAdviceAndDefect(
    req: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      let adviceAndDefectId: number;
      try {
        adviceAndDefectId = requireValidId(params.id, "adviceAndDefectId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const data = await req.json();

      // Parse the date if it's a string and provided
      if (data.date && !(data.date instanceof Date)) {
        data.date = new Date(data.date);
      }

      const updatedAdviceAndDefect =
        await this.adviceAndDefectService.updateAdviceAndDefect(
          adviceAndDefectId,
          data
        );

      if (!updatedAdviceAndDefect) {
        return NextResponse.json(
          { message: "Advice and defect record not found or update failed" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedAdviceAndDefect.toJSON(), {
        status: 200,
      });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  protected async createModel(data: any): Promise<AdviceAndDefectModel> {
    const date =
      data.date instanceof Date ? data.date : new Date(data.date || new Date());

    return AdviceAndDefectModel.create(
      data.inspectionId,
      date,
      data.adviceList || [],
      data.defectList || []
    );
  }
}
