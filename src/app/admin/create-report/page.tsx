"use client";

import React from "react";

import AdminLayout from "@/components/layout/AdminLayout";

export default function AdminCreateReportPage() {
  return (
    <>
    <AdminLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">สร้างรายงาน</h1>
          <p className="mt-1 text-sm text-gray-500">
            สร้างรายงานสรุปข้อมูลต่างๆ
            ที่เกี่ยวข้องกับการจัดการข้อมูลทางการเกษตรผลผลิตยางพารา
          </p>
        </div>
        {/* Content Area */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700">
            ที่นี่คุณสามารถสร้างรายงานต่างๆ ได้ตามความต้องการ เช่น
            รายงานผลการตรวจประเมินสวนยางพารา
            รายงานการออกใบรับรองแหล่งผลิตยางพารา เป็นต้น
          </p>
        </div>
      </div>
      </AdminLayout>
    </>
  );
}
