import { NextRequest, NextResponse } from 'next/server';
import { userController } from '@/utils/dependencyInjections';

// Route handlers สำหรับ /api/v1/users เท่านั้น
export async function GET(req: NextRequest) {
    // ไม่ต้องตรวจสอบ pathname เพราะมั่นใจว่าเป็น /api/v1/users แล้ว

    // Check if it's a get current user request
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
        return userController.getCurrentUser(req);
    }

    // Otherwise return all users
    return userController.getAll(req);
}

export async function POST(req: NextRequest) {
    // เฉพาะสำหรับการสร้างผู้ใช้ใหม่เท่านั้น (สำหรับ admin)
    return userController.create(req);
}