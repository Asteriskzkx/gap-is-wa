import { NextRequest, NextResponse } from 'next/server';
import { plantingDetailController } from '@/utils/dependencyInjections';

// Route handlers for /api/v1/planting-details
export async function GET(req: NextRequest) {
    const url = new URL(req.url);

    // If rubberFarmId is provided, get details by rubber farm ID
    if (url.searchParams.has('rubberFarmId')) {
        return plantingDetailController.getPlantingDetailsByRubberFarmId(req);
    }

    // Otherwise, get all planting details
    return plantingDetailController.getAll(req);
}

export async function POST(req: NextRequest) {
    // Handle creating a new planting detail
    return plantingDetailController.createPlantingDetail(req);
}