import { NextRequest, NextResponse } from 'next/server';
import { rubberFarmController } from '@/utils/dependencyInjections';

// Route handlers for /api/v1/rubber-farms/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return rubberFarmController.getRubberFarmWithDetails(req, { params });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return rubberFarmController.updateRubberFarm(req, { params });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return rubberFarmController.deleteRubberFarm(req, { params });
}