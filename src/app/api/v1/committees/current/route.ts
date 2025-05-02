import { NextRequest, NextResponse } from 'next/server';
import { committeeController } from '@/utils/dependencyInjections';

export async function GET(req: NextRequest) {
    return committeeController.getCurrentCommittee(req);
}