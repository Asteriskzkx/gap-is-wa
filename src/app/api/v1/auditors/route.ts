import { NextRequest, NextResponse } from 'next/server';
import { auditorController } from '@/utils/dependencyInjections';

// Route handlers สำหรับ /api/v1/auditors เท่านั้น
export async function GET(req: NextRequest) {
    // ดึงข้อมูลผู้ตรวจสอบทั้งหมด
    return auditorController.getAll(req);
}

export async function POST(req: NextRequest) {
    // ตรวจสอบว่าเป็นการลงทะเบียนผู้ตรวจสอบหรือไม่
    const path = req.nextUrl.pathname;

    if (path.endsWith('/register')) {
        return auditorController.registerAuditor(req);
    }

    // ถ้าไม่ใช่การลงทะเบียน ให้สร้างผู้ตรวจสอบใหม่ (สำหรับ admin)
    return auditorController.create(req);
}