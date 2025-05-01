import { NextRequest, NextResponse } from 'next/server';
import { adminController } from '@/utils/dependencyInjections';

// Route handlers for /api/v1/admins/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return adminController.getById(req, { params });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return adminController.updateAdminProfile(req, { params });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return adminController.delete(req, { params });
}