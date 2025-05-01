import { NextRequest, NextResponse } from 'next/server';
import { committeeController } from '@/utils/dependencyInjections';

// Route handlers for /api/v1/committees/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return committeeController.getById(req, { params });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return committeeController.updateCommitteeProfile(req, { params });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return committeeController.delete(req, { params });
}