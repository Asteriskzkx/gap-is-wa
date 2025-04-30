import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/utils/dependencyInjections';

// Route handlers
export async function GET(req: NextRequest) {
    // Check if it's a get current user request
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
        return userController.getCurrentUser(req);
    }

    // Otherwise return all users
    return userController.getAll(req);
}

export async function POST(req: NextRequest) {
    // Get the path to determine the action
    const path = req.nextUrl.pathname;

    if (path.endsWith('/register')) {
        return userController.register(req);
    } else if (path.endsWith('/login')) {
        return userController.login(req);
    } else if (path.endsWith('/change-password')) {
        return userController.changePassword(req);
    }

    // Default to create a new user
    return userController.create(req);
}