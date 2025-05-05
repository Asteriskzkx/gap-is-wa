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

    /**
     * Updates rubber farm certification information
     * This method handles updates specifically for certification purposes
     */
    async updateCertification(req: NextRequest): Promise<NextResponse> {
        try {
            const data = await req.json();
            const { farmData, plantingDetailsData } = data;

            // Validate the request data
            if (!farmData || !farmData.rubberFarmId || !plantingDetailsData) {
                return NextResponse.json(
                    { message: 'Missing required fields for certification update' },
                    { status: 400 }
                );
            }

            // Get farm ID
            const rubberFarmId = farmData.rubberFarmId;

            // First check if the farm exists
            const existingFarm = await this.rubberFarmService.getById(rubberFarmId);
            if (!existingFarm) {
                return NextResponse.json(
                    { message: 'Rubber farm not found' },
                    { status: 404 }
                );
            }

            // Get the token from the authorization header and validate ownership
            const authHeader = req.headers.get('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return NextResponse.json(
                    { message: 'Authorization required' },
                    { status: 401 }
                );
            }

            const token = authHeader.split(' ')[1];
            const decodedToken = this.rubberFarmService.verifyToken(token);

            if (!decodedToken || decodedToken.role !== 'FARMER') {
                return NextResponse.json(
                    { message: 'Invalid token or insufficient permissions' },
                    { status: 403 }
                );
            }

            // Ensure the farm belongs to the authenticated farmer
            if (existingFarm.farmerId !== decodedToken.farmerId) {
                return NextResponse.json(
                    { message: 'You do not have permission to update this farm' },
                    { status: 403 }
                );
            }

            // Update farm data
            const updatedFarm = await this.rubberFarmService.updateRubberFarm(
                rubberFarmId,
                farmData
            );

            if (!updatedFarm) {
                return NextResponse.json(
                    { message: 'Failed to update farm data' },
                    { status: 500 }
                );
            }

            // Process planting details
            const updatedDetails = [];

            // Loop through all provided planting details
            for (const detail of plantingDetailsData) {
                if (detail.plantingDetailId) {
                    // Update existing planting detail
                    const updatedDetail = await this.rubberFarmService.updatePlantingDetail(
                        detail.plantingDetailId,
                        detail
                    );

                    if (updatedDetail) {
                        updatedDetails.push(updatedDetail);
                    }
                } else {
                    // Create new planting detail
                    const newDetail = {
                        ...detail,
                        rubberFarmId: rubberFarmId
                    };

                    const createdDetail = await this.rubberFarmService.createPlantingDetail(
                        newDetail
                    );

                    if (createdDetail) {
                        updatedDetails.push(createdDetail);
                    }
                }
            }

            // Return the updated farm with details
            return NextResponse.json({
                message: 'Certification update submitted successfully',
                farm: updatedFarm,
                plantingDetails: updatedDetails
            }, { status: 200 });
        } catch (error: any) {
            console.error('Error updating certification:', error);
            return NextResponse.json(
                { message: error.message || 'Failed to update certification' },
                { status: 500 }
            );
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