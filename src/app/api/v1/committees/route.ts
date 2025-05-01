import { NextRequest, NextResponse } from 'next/server';
import { committeeController } from '@/utils/dependencyInjections';

// Route handlers for /api/v1/committees
export async function GET(req: NextRequest) {
    // Get all committees
    return committeeController.getAll(req);
}

export async function POST(req: NextRequest) {
    // Check if it's a registration request
    const path = req.nextUrl.pathname;

    if (path.endsWith('/register')) {
        return committeeController.registerCommittee(req);
    }

    if (path.endsWith('/login')) {
        return committeeController.login(req);
    }

    // If not registration or login, create a new committee (admin only)
    return committeeController.create(req);
}