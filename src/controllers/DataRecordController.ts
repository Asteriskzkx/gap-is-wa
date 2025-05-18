import { NextRequest, NextResponse } from "next/server";
import { BaseController } from "./BaseController";
import { DataRecordModel } from "../models/DataRecordModel";
import { DataRecordService } from "../services/DataRecordService";
import { requireValidId } from "../utils/ParamUtils";

export class DataRecordController extends BaseController<DataRecordModel> {
  private dataRecordService: DataRecordService;

  constructor(dataRecordService: DataRecordService) {
    super(dataRecordService);
    this.dataRecordService = dataRecordService;
  }

  async createDataRecord(req: NextRequest): Promise<NextResponse> {
    try {
      const data = await req.json();
      const {
        inspectionId,
        species,
        waterSystem,
        fertilizers,
        previouslyCultivated,
        plantDisease,
        relatedPlants,
        moreInfo,
        map,
      } = data;

      // Basic validation
      if (!inspectionId) {
        return NextResponse.json(
          { message: "Inspection ID is required" },
          { status: 400 }
        );
      }

      const dataRecord = await this.dataRecordService.createDataRecord({
        inspectionId,
        species: species || {},
        waterSystem: waterSystem || {},
        fertilizers: fertilizers || {},
        previouslyCultivated: previouslyCultivated || {},
        plantDisease: plantDisease || {},
        relatedPlants: relatedPlants || {},
        moreInfo: moreInfo || "",
        map: map || {},
      });

      return NextResponse.json(dataRecord.toJSON(), { status: 201 });
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
      return this.handleControllerError(error);
    }
  }

  async getDataRecordByInspectionId(req: NextRequest): Promise<NextResponse> {
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

      const dataRecord =
        await this.dataRecordService.getDataRecordByInspectionId(inspectionId);

      if (!dataRecord) {
        return NextResponse.json(
          { message: "Data record not found for this inspection" },
          { status: 404 }
        );
      }

      return NextResponse.json(dataRecord.toJSON(), { status: 200 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  async updateDataRecord(
    req: NextRequest,
    { params }: { params: { id: string } }
  ): Promise<NextResponse> {
    try {
      let dataRecordId: number;
      try {
        dataRecordId = requireValidId(params.id, "dataRecordId");
      } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      const data = await req.json();
      const updatedDataRecord = await this.dataRecordService.updateDataRecord(
        dataRecordId,
        data
      );

      if (!updatedDataRecord) {
        return NextResponse.json(
          { message: "Data record not found or update failed" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedDataRecord.toJSON(), { status: 200 });
    } catch (error: any) {
      return this.handleControllerError(error);
    }
  }

  protected async createModel(data: any): Promise<DataRecordModel> {
    return DataRecordModel.create(
      data.inspectionId,
      data.species || {},
      data.waterSystem || {},
      data.fertilizers || {},
      data.previouslyCultivated || {},
      data.plantDisease || {},
      data.relatedPlants || {},
      data.moreInfo || "",
      data.map || {}
    );
  }
}
