import { NextRequest, NextResponse } from 'next/server';
import { farmerController } from '@/utils/dependencyInjections';

// Route handlers for a specific farmer by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return farmerController.getById(req, { params });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return farmerController.updateFarmerProfile(req, { params });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return farmerController.delete(req, { params });
}