import { NextRequest, NextResponse } from 'next/server';
import { committeeController } from '@/utils/dependencyInjections';

export async function POST(req: NextRequest) {
    return committeeController.login(req);
}