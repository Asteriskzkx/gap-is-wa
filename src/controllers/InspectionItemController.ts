import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";
import { InspectionItemModel } from "../models/InspectionItemModel";
import { InspectionItemService } from "../services/InspectionItemService";
import { requireValidId } from "../utils/ParamUtils";
import { OptimisticLockError } from "../errors/OptimisticLockError";

export class InspectionItemController extends BaseController<InspectionItemModel> {
  private inspectionItemService: InspectionItemService;

  constructor(inspectionItemService: InspectionItemService) {
    super(inspectionItemService);
    this.inspectionItemService = inspectionItemService;
  }

  async createInspectionItem(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const {
        inspectionId,
        inspectionItemMasterId,
        inspectionItemNo,
        inspectionItemResult,
        otherConditions,
        requirements,
      } = data;

      // Basic validation
      if (
        !inspectionId ||
        !inspectionItemMasterId ||
        !inspectionItemNo ||
        !inspectionItemResult
      ) {
        return NextResponse.json(
          { message: "Required fields missing" },
          { status: 400 }
        );
      }

      const inspectionItem =
        await this.inspectionItemService.createInspectionItem({
          inspectionId,
          inspectionItemMasterId,
          inspectionItemNo,
          inspectionItemResult,
          otherConditions: otherConditions || {},
          requirements,
        });

      return NextResponse.json(inspectionItem.toJSON(), { status: 201 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async getInspectionItemsByInspectionId(
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

      const items =
        await this.inspectionItemService.getInspectionItemsByInspectionId(
          inspectionId
        );
      const itemsJson = items.map((item) => item.toJSON());

      return NextResponse.json(itemsJson, { status: 200 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async updateInspectionItemResult(
    req: NextRequest,
    { params }: { params: { id: string } },
    session?: any
  ): Promise<NextResponse> {
    try {
      let itemId: number;
      try {
        itemId = requireValidId(params.id, "inspectionItemId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const data = await req.json();
      const { result, version, otherConditions } = data;

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

      const updatedItem =
        await this.inspectionItemService.updateInspectionItemResult(
          itemId,
          result,
          version,
          otherConditions,
          userId
        );

      if (!updatedItem) {
        return NextResponse.json(
          { message: "Inspection item not found or update failed" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedItem.toJSON(), { status: 200 });
    } catch (error: any) {
      // Handle optimistic lock error
      if (error instanceof OptimisticLockError) {
        return NextResponse.json(error.toJSON(), { status: 409 });
      }
      return this.handleControllerError(error);
    }
  }

  async updateInspectionItemResultsBulk(
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
        const { inspectionItemId, result, version, otherConditions } = entry;

        if (!inspectionItemId || !result) {
          errors.push({ inspectionItemId, message: "Missing fields" });
          continue;
        }

        // Validate that version is provided
        if (version === undefined || version === null) {
          errors.push({
            inspectionItemId,
            message: "Version is required for optimistic locking",
          });
          continue;
        }

        try {
          const updated =
            await this.inspectionItemService.updateInspectionItemResult(
              inspectionItemId,
              result,
              version,
              otherConditions,
              userId
            );

          if (updated) {
            results.push(updated.toJSON());
          } else {
            errors.push({
              inspectionItemId,
              message: "Not found or update failed",
            });
          }
        } catch (err: any) {
          if (err instanceof OptimisticLockError) {
            errors.push({
              inspectionItemId,
              message: "optimistic_lock",
              details: err.toJSON(),
            });
          } else {
            errors.push({
              inspectionItemId,
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

  protected async createModel(data: any): Promise<InspectionItemModel> {
    return InspectionItemModel.create(
      data.inspectionId,
      data.inspectionItemMasterId,
      data.inspectionItemNo,
      data.inspectionItemResult,
      data.otherConditions || {}
    );
  }
}
