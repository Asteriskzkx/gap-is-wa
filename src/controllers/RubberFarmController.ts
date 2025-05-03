import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './BaseController';
import { RubberFarmModel } from '../models/RubberFarmModel';
import { RubberFarmService } from '../services/RubberFarmService';
import { requireValidId } from '../utils/ParamUtils';

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

            // Validate basic farm data
            if (!farmData || !farmData.farmerId || !farmData.villageName || !farmData.moo) {
                return NextResponse.json(
                    { message: 'Required farm fields missing' },
                    { status: 400 }
                );
            }

            // Check if planting details are provided
            if (!plantingDetailsData || !Array.isArray(plantingDetailsData) || plantingDetailsData.length === 0) {
                return NextResponse.json(
                    { message: 'At least one planting detail is required' },
                    { status: 400 }
                );
            }

            // Create farm with details
            const rubberFarm = await this.rubberFarmService.createRubberFarmWithDetails(
                farmData,
                plantingDetailsData
            );

            return NextResponse.json(rubberFarm, { status: 201 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async getRubberFarmsByFarmerId(req: NextRequest): Promise<NextResponse> {
        try {
            const url = new URL(req.url);
            const farmerIdParam = url.searchParams.get('farmerId');

            if (!farmerIdParam) {
                return NextResponse.json(
                    { message: 'Farmer ID is required' },
                    { status: 400 }
                );
            }

            let farmerId: number;
            try {
                farmerId = requireValidId(farmerIdParam, 'farmerId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const farms = await this.rubberFarmService.getRubberFarmsByFarmerId(farmerId);
            return NextResponse.json(farms, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async getRubberFarmWithDetails(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            let farmId: number;
            try {
                farmId = requireValidId(params.id, 'rubberFarmId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const farm = await this.rubberFarmService.getRubberFarmWithDetails(farmId);

            if (!farm) {
                return NextResponse.json(
                    { message: 'Rubber farm not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(farm, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async updateRubberFarm(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            let farmId: number;
            try {
                farmId = requireValidId(params.id, 'rubberFarmId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const data = await req.json();
            const updatedFarm = await this.rubberFarmService.updateRubberFarm(farmId, data);

            if (!updatedFarm) {
                return NextResponse.json(
                    { message: 'Rubber farm not found or update failed' },
                    { status: 404 }
                );
            }

            return NextResponse.json(updatedFarm, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async deleteRubberFarm(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            let farmId: number;
            try {
                farmId = requireValidId(params.id, 'rubberFarmId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const success = await this.rubberFarmService.deleteRubberFarm(farmId);

            if (!success) {
                return NextResponse.json(
                    { message: 'Rubber farm not found or delete failed' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ message: 'Rubber farm deleted successfully' }, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    protected async createModel(data: any): Promise<RubberFarmModel> {
        return RubberFarmModel.create(
            data.farmerId,
            data.villageName,
            data.moo,
            data.road || '',
            data.alley || '',
            data.subDistrict,
            data.district,
            data.province,
            data.location || {}
        );
    }
}