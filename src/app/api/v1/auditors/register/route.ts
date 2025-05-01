import { NextRequest, NextResponse } from 'next/server';
import { auditorController } from '@/utils/dependencyInjections';

export async function POST(req: NextRequest) {
    return auditorController.registerAuditor(req);
}