import { NextRequest, NextResponse } from 'next/server';
import { plantingDetailController } from '@/utils/dependencyInjections';

// Route handlers for /api/v1/planting-details/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return plantingDetailController.getById(req, { params });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return plantingDetailController.updatePlantingDetail(req, { params });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return plantingDetailController.delete(req, { params });
}