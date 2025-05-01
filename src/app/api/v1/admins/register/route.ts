import { NextRequest, NextResponse } from 'next/server';
import { adminController } from '@/utils/dependencyInjections';

export async function POST(req: NextRequest) {
    return adminController.registerAdmin(req);
}