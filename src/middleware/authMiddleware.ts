import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/UserService';
import { UserRepository } from '@/repositories/UserRepository';
import { UserRole } from '@/models/UserModel';

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

/**
 * Middleware to check if user is authenticated
 * @param req - The incoming request
 * @returns NextResponse or undefined to continue
 */
export async function authMiddleware(req: NextRequest) {
    // Skip authentication for login and register routes
    const path = req.nextUrl.pathname;
    if (
        path.includes('/login') ||
        path.includes('/register') ||
        path === '/' ||
        path.startsWith('/_next')
    ) {
        return;
    }

    // Check for Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { message: 'Authentication required' },
            { status: 401 }
        );
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = userService.verifyToken(token);

    if (!decodedToken) {
        return NextResponse.json(
            { message: 'Invalid or expired token' },
            { status: 401 }
        );
    }

    // Allow the request to continue
    return;
}

/**
 * Middleware to check if user has specific role
 * @param requiredRoles - Array of roles that are allowed
 */
export function roleMiddleware(requiredRoles: UserRole[]) {
    return async (req: NextRequest) => {
        // First check authentication
        const authResult = await authMiddleware(req);
        if (authResult) {
            return authResult; // Forward authentication error
        }

        // Get token and decode it
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Authentication required' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = userService.verifyToken(token);

        // Check role
        if (!decodedToken || !requiredRoles.includes(decodedToken.role)) {
            return NextResponse.json(
                { message: 'Access denied. Insufficient permissions.' },
                { status: 403 }
            );
        }

        // Allow the request to continue
        return;
    };
}

// Example usage:
// export const adminGuard = roleMiddleware([UserRole.ADMIN]);
// export const committeeGuard = roleMiddleware([UserRole.COMMITTEE, UserRole.ADMIN]);