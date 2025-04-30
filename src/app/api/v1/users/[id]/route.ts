import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/utils/dependencyInjections';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return userController.getById(req, { params });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return userController.update(req, { params });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return userController.delete(req, { params });
}