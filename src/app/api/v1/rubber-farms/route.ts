import { NextRequest, NextResponse } from 'next/server';
import { rubberFarmController } from '@/utils/dependencyInjections';

// Route handlers for /api/v1/rubber-farms
export async function GET(req: NextRequest) {
    const url = new URL(req.url);

    // If farmerId is provided, get farms by farmer ID
    if (url.searchParams.has('farmerId')) {
        return rubberFarmController.getRubberFarmsByFarmerId(req);
    }

    // Otherwise, get all farms
    return rubberFarmController.getAll(req);
}

export async function POST(req: NextRequest) {
    // Handle creating a new rubber farm with planting details
    return rubberFarmController.createRubberFarmWithDetails(req);
}