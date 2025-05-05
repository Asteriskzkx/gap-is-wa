import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './BaseController';
import { PlantingDetailModel } from '../models/PlantingDetailModel';
import { PlantingDetailService } from '../services/PlantingDetailService';
import { requireValidId } from '../utils/ParamUtils';

export class PlantingDetailController extends BaseController<PlantingDetailModel> {
    private plantingDetailService: PlantingDetailService;

    constructor(plantingDetailService: PlantingDetailService) {
        super(plantingDetailService);
        this.plantingDetailService = plantingDetailService;
    }

    async createPlantingDetail(req: NextRequest): Promise<NextResponse> {
        try {
            const data = await req.json();

            if (!data.rubberFarmId || !data.specie || data.areaOfPlot === undefined) {
                return NextResponse.json(
                    { message: 'Required fields missing' },
                    { status: 400 }
                );
            }

            // แปลงค่า string ให้เป็น Date object ก่อนเรียก createPlantingDetail
            const yearOfTapping = data.yearOfTapping ? new Date(data.yearOfTapping) : new Date();
            const monthOfTapping = data.monthOfTapping ? new Date(data.monthOfTapping) : new Date();

            // เพิ่ม debugging log
            console.log("Creating planting detail with data:", {
                ...data,
                yearOfTapping,
                monthOfTapping
            });

            const plantingDetail = await this.plantingDetailService.createPlantingDetail({
                ...data,
                rubberFarmId: Number(data.rubberFarmId),  // ตรวจสอบให้แน่ใจว่าเป็นตัวเลข
                specie: String(data.specie),
                areaOfPlot: Number(data.areaOfPlot),
                numberOfRubber: Number(data.numberOfRubber),
                numberOfTapping: Number(data.numberOfTapping || 0),
                ageOfRubber: Number(data.ageOfRubber || 0),
                yearOfTapping,
                monthOfTapping,
                totalProduction: Number(data.totalProduction || 0)
            });

            return NextResponse.json(plantingDetail, { status: 201 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async getPlantingDetailsByRubberFarmId(req: NextRequest): Promise<NextResponse> {
        try {
            const url = new URL(req.url);
            const rubberFarmIdParam = url.searchParams.get('rubberFarmId');

            if (!rubberFarmIdParam) {
                return NextResponse.json(
                    { message: 'Rubber Farm ID is required' },
                    { status: 400 }
                );
            }

            let rubberFarmId: number;
            try {
                rubberFarmId = requireValidId(rubberFarmIdParam, 'rubberFarmId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const details = await this.plantingDetailService.getPlantingDetailsByRubberFarmId(rubberFarmId);
            return NextResponse.json(details, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async updatePlantingDetail(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            let detailId: number;
            try {
                detailId = requireValidId(params.id, 'plantingDetailId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const data = await req.json();

            // Parse date strings to Date objects if they exist
            if (data.yearOfTapping) {
                data.yearOfTapping = new Date(data.yearOfTapping);
            }
            if (data.monthOfTapping) {
                data.monthOfTapping = new Date(data.monthOfTapping);
            }

            const updatedDetail = await this.plantingDetailService.updatePlantingDetail(detailId, data);

            if (!updatedDetail) {
                return NextResponse.json(
                    { message: 'Planting detail not found or update failed' },
                    { status: 404 }
                );
            }

            return NextResponse.json(updatedDetail, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    protected async createModel(data: any): Promise<PlantingDetailModel> {
        // Parse date strings to Date objects
        const yearOfTapping = data.yearOfTapping ? new Date(data.yearOfTapping) : new Date();
        const monthOfTapping = data.monthOfTapping ? new Date(data.monthOfTapping) : new Date();

        return PlantingDetailModel.create(
            data.rubberFarmId,
            data.specie,
            data.areaOfPlot,
            data.numberOfRubber || 0,
            data.numberOfTapping || 0,
            data.ageOfRubber || 0,
            yearOfTapping,
            monthOfTapping,
            data.totalProduction || 0
        );
    }
}