import { NextRequest, NextResponse } from 'next/server';
import { farmerController } from '@/utils/dependencyInjections';

export async function POST(req: NextRequest) {
    return farmerController.login(req);
}