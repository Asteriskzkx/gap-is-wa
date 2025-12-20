"use client";

import Link from "next/link";

// Icons
import { ChevronRightIcon } from "@/components/icons";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminNavItems } from "@/config/navItems";

const navItems = adminNavItems;

// Helper functions สำหรับกำหนด color และ description
const getActionCardColorClass = (index: number): string => {
  if (index === 0) return "bg-indigo-100 text-indigo-600";
  if (index === 1) return "bg-emerald-100 text-emerald-600";
  return "bg-blue-100 text-blue-600";
};

const getActionCardDescription = (index: number): string => {
  if (index === 0) return "จัดการ เพิ่ม ลบ หรือแก้ไข ข้อมูลผู้ใช้ในระบบ";
  if (index === 1) return "ตรวจสอบบันทึกเหตุการณ์ต่างๆ ในระบบ";
  return "ตรวจสอบรายงานต่างๆ ในระบบ";
};

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            หน้าหลักผู้ดูแลระบบ
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            ยินดีต้อนรับสู่ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
          </p>
        </div>

        {/* Action Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navItems
            .filter((item) => item.title !== "หน้าหลัก") // กรองการ์ดที่ไม่ต้องการแสดง
            .map((item, index) => (
              <div
                key={`action-${item.href}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <Link href={item.href} className="block">
                  <div className="flex flex-col h-full">
                    <div
                      className={`p-3 rounded-full mb-4 w-12 h-12 flex items-center justify-center ${getActionCardColorClass(
                        index
                      )}`}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 flex-grow">
                      {getActionCardDescription(index)}
                    </p>
                    <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm">
                      <span>เข้าสู่เมนู</span>
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
        </div>
      </div>
    </AdminLayout>
  );
}
