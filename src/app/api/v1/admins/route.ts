import { NextRequest, NextResponse } from 'next/server';
import { adminController } from '@/utils/dependencyInjections';

// Route handlers
export async function GET(req: NextRequest) {
    const path = req.nextUrl.pathname;

    if (path.endsWith('/statistics')) {
        return adminController.getUserStatistics(req);
    } else if (path.endsWith('/config')) {
        return adminController.getSystemConfig(req);
    }

    // Default to get all admins
    return adminController.getAll(req);
}

export async function POST(req: NextRequest) {
    const path = req.nextUrl.pathname;

    if (path.endsWith('/register')) {
        return adminController.registerAdmin(req);
    } else if (path.endsWith('/login')) {
        return adminController.login(req);
    } else if (path.endsWith('/change-role')) {
        return adminController.changeUserRole(req);
    } else if (path.endsWith('/config')) {
        return adminController.updateSystemConfig(req);
    }

    // Default to create a new admin
    return adminController.create(req);
}