// src/app/api/v1/farmers/current/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auditorController } from '@/utils/dependencyInjections';

export async function GET(req: NextRequest) {
    return auditorController.getCurrentAuditor(req);
}