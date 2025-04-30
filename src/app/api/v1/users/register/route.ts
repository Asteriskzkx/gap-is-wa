import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/utils/dependencyInjections';

export async function POST(req: NextRequest) {
    return userController.register(req);
}