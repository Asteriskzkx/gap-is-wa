"use client";

import React from "react";
import Link from "next/link";

// Icons
import {
  HomeIcon,
  TextClipboardIcon,
  EditIcon,
  XIcon,
  FileIcon,
} from "@/components/icons";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminNavItems } from "@/config/navItems";

const navItems = adminNavItems;

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
                key={index}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <Link href={item.href} className="block">
                  <div className="flex flex-col h-full">
                    <div
                      className={`p-3 rounded-full mb-4 w-12 h-12 flex items-center justify-center ${
                        index === 0
                          ? "bg-indigo-100 text-indigo-600"
                          : index === 1
                          ? "bg-emerald-100 text-emerald-600"
                          : index === 2
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 flex-grow">
                      {index === 0
                        ? "จัดการ เพิ่ม ลบ หรือแก้ไข ข้อมูลผู้ใช้ในระบบ"
                        : index === 1
                        ? "ตรวจสอบความเคลื่อนไหวและกิจกรรมต่างๆ ในระบบ"
                        : index === 2
                        ? "สร้างรายงาน"
                        : "ตรวจสอบรายงานและเอกสารต่างๆ ที่สร้างขึ้นในระบบ"}
                    </p>
                    <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm">
                      <span>เข้าสู่เมนู</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
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
