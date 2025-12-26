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

  async updateRequirementsEvaluations(
    req: NextRequest,
    session?: any
  ): Promise<NextResponse> {
    try {
      const data = await req.json();

      if (!Array.isArray(data)) {
        return NextResponse.json(
          { message: "Payload must be an array" },
          { status: 400 }
        );
      }

      const results: any[] = [];
      const errors: any[] = [];

      const userId = session ? Number(session.user.id) : undefined;

      for (const entry of data) {
        const {
          requirementId,
          evaluationResult,
          evaluationMethod,
          note,
          version,
        } = entry;

        if (!requirementId || !evaluationResult || !evaluationMethod) {
          errors.push({ requirementId, message: "Missing fields" });
          continue;
        }

        // Validate that version is provided
        if (version === undefined || version === null) {
          errors.push({
            requirementId,
            message: "Version is required for optimistic locking",
          });
          continue;
        }

        try {
          const updated =
            await this.requirementService.updateRequirementEvaluation(
              requirementId,
              evaluationResult,
              evaluationMethod,
              note || "",
              version,
              userId
            );

          if (updated) {
            results.push(updated.toJSON());
          } else {
            errors.push({
              requirementId,
              message: "Not found or update failed",
            });
          }
        } catch (err: any) {
          if (err instanceof OptimisticLockError) {
            errors.push({
              requirementId,
              message: "optimistic_lock",
              details: err.toJSON(),
            });
          } else {
            errors.push({
              requirementId,
              message: err?.message || String(err),
            });
          }
        }
      }

      return NextResponse.json({ updated: results, errors }, { status: 200 });
    } catch (error: any) {
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
