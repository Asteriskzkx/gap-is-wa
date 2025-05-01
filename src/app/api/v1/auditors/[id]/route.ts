import { NextRequest, NextResponse } from 'next/server';
import { auditorController } from '@/utils/dependencyInjections';

// Route handlers สำหรับ /api/v1/auditors/[id] เท่านั้น
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return auditorController.getById(req, { params });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return auditorController.updateAuditorProfile(req, { params });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return auditorController.delete(req, { params });
}