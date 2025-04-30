import { NextRequest, NextResponse } from 'next/server';
import { AdminController } from '@/controllers/AdminController';
import { AdminService } from '@/services/AdminService';
import { AdminRepository } from '@/repositories/AdminRepository';
import { UserService } from '@/services/UserService';
import { UserRepository } from '@/repositories/UserRepository';

// Initialize the dependency chain
const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const adminService = new AdminService(adminRepository, userService);
const adminController = new AdminController(adminService);

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
    } else if (path.endsWith('/change-role')) {
        return adminController.changeUserRole(req);
    } else if (path.endsWith('/config')) {
        return adminController.updateSystemConfig(req);
    }

    // Default to create a new admin
    return adminController.create(req);
}