import { checkAuthorization } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { OptimisticLockError } from "../errors/OptimisticLockError";
import { RubberFarmModel } from "../models/RubberFarmModel";
import { RubberFarmService } from "../services/RubberFarmService";
import { requireValidId } from "../utils/ParamUtils";
import { BaseController } from "./BaseController";

export class RubberFarmController extends BaseController<RubberFarmModel> {
  private rubberFarmService: RubberFarmService;

  constructor(rubberFarmService: RubberFarmService) {
    super(rubberFarmService);
    this.rubberFarmService = rubberFarmService;
  }

  async createRubberFarmWithDetails(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const { farmData, plantingDetailsData } = data;

      const { authorized, session, error } = await checkAuthorization(req, [
        "FARMER",
        "ADMIN",
      ]);

      if (!authorized || !session) {
        return NextResponse.json(
          { message: error || "Authorization required" },
          { status: 401 }
        );
      }

      const userId = session ? Number(session.user.id) : undefined;

      // Validate basic farm data
      if (!farmData?.farmerId || !farmData?.villageName || !farmData?.moo) {
        return NextResponse.json(
          { message: "Required farm fields missing" },
          { status: 400 }
        );
      }

      // Check if planting details are provided
      if (
        !plantingDetailsData ||
        !Array.isArray(plantingDetailsData) ||
        plantingDetailsData.length === 0
      ) {
        return NextResponse.json(
          { message: "At least one planting detail is required" },
          { status: 400 }
        );
      }

      // Create farm with details
      const rubberFarm =
        await this.rubberFarmService.createRubberFarmWithDetails(
          farmData,
          plantingDetailsData,
          userId
        );

      return NextResponse.json(rubberFarm, { status: 201 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async getRubberFarmsByFarmerId(req: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(req.url);
      const farmerIdParam = url.searchParams.get("farmerId");

      if (!farmerIdParam) {
        return NextResponse.json(
          { message: "Farmer ID is required" },
          { status: 400 }
        );
      }

      let farmerId: number;
      try {
        farmerId = requireValidId(farmerIdParam, "farmerId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      // ตรวจสอบว่ามี pagination parameters หรือไม่
      const usePagination =
        url.searchParams.has("limit") || url.searchParams.has("offset");

      if (usePagination) {
        // ใช้ pagination
        const limit = Number.parseInt(
          url.searchParams.get("limit") || "10",
          10
        );
        const offset = Number.parseInt(
          url.searchParams.get("offset") || "0",
          10
        );
        const province = url.searchParams.get("province") || undefined;
        const district = url.searchParams.get("district") || undefined;
        const subDistrict = url.searchParams.get("subDistrict") || undefined;
        const sortField = url.searchParams.get("sortField") || undefined;
        const sortOrder = url.searchParams.get("sortOrder") as
          | "asc"
          | "desc"
          | undefined;
        const includeInspections =
          url.searchParams.get("includeInspections") === "true";
        const priorityStatus =
          url.searchParams.get("priorityStatus") || undefined;

        // Handle multi-sort
        let multiSortMeta: Array<{ field: string; order: 1 | -1 }> | undefined;
        const multiSortParam = url.searchParams.get("multiSortMeta");
        if (multiSortParam) {
          try {
            multiSortMeta = JSON.parse(multiSortParam);
          } catch (error) {
            console.error("Invalid multiSortMeta format");
          }
        }

        const result =
          await this.rubberFarmService.getRubberFarmsByFarmerIdWithPagination({
            farmerId,
            province,
            district,
            subDistrict,
            sortField,
            sortOrder,
            multiSortMeta,
            limit,
            offset,
            includeInspections,
            priorityStatus,
          });

        return NextResponse.json(
          {
            results: result.data,
            paginator: {
              total: result.total,
              limit,
              offset,
            },
          },
          { status: 200 }
        );
      } else {
        // ไม่ใช้ pagination (เหมือนเดิม)
        const farms = await this.rubberFarmService.getRubberFarmsByFarmerId(
          farmerId
        );
        return NextResponse.json(farms, { status: 200 });
      }
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async getRubberFarmWithDetails(
    req: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      let farmId: number;
      try {
        farmId = requireValidId(params.id, "rubberFarmId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const farm = await this.rubberFarmService.getRubberFarmWithDetails(
        farmId
      );

      if (!farm) {
        return NextResponse.json(
          { message: "Rubber farm not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(farm, { status: 200 });
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  async updateRubberFarm(
    req: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      let farmId: number;
      try {
        farmId = requireValidId(params.id, "rubberFarmId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const { authorized, session, error } = await checkAuthorization(req, [
        "FARMER",
        "ADMIN",
      ]);

      if (!authorized || !session) {
        return NextResponse.json(
          { message: error || "Authorization required" },
          { status: 401 }
        );
      }

      const userId = session ? Number(session.user.id) : undefined;

      const data = await req.json();
      const { version, ...updateData } = data;

      const updatedFarm = await this.rubberFarmService.updateRubberFarm(
        farmId,
        updateData,
        version,
        userId
      );

      if (!updatedFarm) {
        return NextResponse.json(
          { message: "Rubber farm not found or update failed" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedFarm, { status: 200 });
    } catch (error: any) {
      // Handle optimistic lock error
      if (error instanceof OptimisticLockError) {
        return NextResponse.json(error.toJSON(), { status: 409 });
      }
      return this.handleControllerError(error);
    }
  }

  async deleteRubberFarm(
    req: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      let farmId: number;
      try {
        farmId = requireValidId(params.id, "rubberFarmId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const success = await this.rubberFarmService.deleteRubberFarm(farmId);

      if (!success) {
        return NextResponse.json(
          { message: "Rubber farm not found or delete failed" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "Rubber farm deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      return this.handleControllerError(error);
    }
  }

  protected async createModel(data: any): Promise<RubberFarmModel> {
    return RubberFarmModel.create(
      data.farmerId,
      data.villageName,
      data.moo,
      data.road || "",
      data.alley || "",
      data.subDistrict,
      data.district,
      data.province,
      data.location || {},
      data.productDistributionType || ""
    );
  }
}
