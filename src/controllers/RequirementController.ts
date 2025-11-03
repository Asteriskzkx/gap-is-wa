import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";
import { RequirementModel } from "../models/RequirementModel";
import { RequirementService } from "../services/RequirementService";
import { requireValidId } from "../utils/ParamUtils";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export class RequirementController extends BaseController<RequirementModel> {
  private requirementService: RequirementService;

  constructor(requirementService: RequirementService) {
    super(requirementService);
    this.requirementService = requirementService;
  }

  async createRequirement(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const {
        inspectionItemId,
        requirementMasterId,
        requirementNo,
        evaluationResult,
        evaluationMethod,
        note,
      } = data;

      // Basic validation
      if (
        !inspectionItemId ||
        !requirementMasterId ||
        !requirementNo ||
        !evaluationResult ||
        !evaluationMethod
      ) {
        return NextResponse.json(
          { message: "Required fields missing" },
          { status: 400 }
        );
      }

      const requirement = await this.requirementService.createRequirement({
        inspectionItemId,
        requirementMasterId,
        requirementNo,
        evaluationResult,
        evaluationMethod,
        note: note || "",
      });

      return NextResponse.json(requirement.toJSON(), { status: 201 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async getRequirementsByInspectionItemId(
    req: NextRequest
  ): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const inspectionItemIdParam = searchParams.get("inspectionItemId");

      if (!inspectionItemIdParam) {
        return NextResponse.json(
          { message: "Inspection Item ID is required" },
          { status: 400 }
        );
      }

      let inspectionItemId: number;
      try {
        inspectionItemId = requireValidId(
          inspectionItemIdParam,
          "inspectionItemId"
        );
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const requirements =
        await this.requirementService.getRequirementsByInspectionItemId(
          inspectionItemId
        );
      const requirementsJson = requirements.map((req) => req.toJSON());

      return NextResponse.json(requirementsJson, { status: 200 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async updateRequirementEvaluation(
    req: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      let requirementId: number;
      try {
        requirementId = requireValidId(params.id, "requirementId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const data = await req.json();
      const { evaluationResult, evaluationMethod, note, version } = data;

      if (!evaluationResult || !evaluationMethod) {
        return NextResponse.json(
          { message: "Evaluation result and method are required" },
          { status: 400 }
        );
      }

      const updatedRequirement =
        await this.requirementService.updateRequirementEvaluation(
          requirementId,
          evaluationResult,
          evaluationMethod,
          note || "",
          version
        );

      if (!updatedRequirement) {
        return NextResponse.json(
          { message: "Requirement not found or update failed" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedRequirement.toJSON(), { status: 200 });
    } catch (error: any) {
      // Handle optimistic lock error
      if (error instanceof OptimisticLockError) {
        return NextResponse.json(error.toJSON(), { status: 409 });
      }
      return this.handleControllerError(error);
    }
  }

  protected async createModel(data: any): Promise<RequirementModel> {
    return RequirementModel.create(
      data.inspectionItemId,
      data.requirementMasterId,
      data.requirementNo,
      data.evaluationResult,
      data.evaluationMethod,
      data.note || ""
    );
  }
}
