"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import { PrimaryDropdown, PrimaryMultiSelect } from "@/components/ui";
import { useState } from "react";

export default function AdminReportPage() {
  const OptionForReport = [
    { value: "user-management", label: "รายงานผู้ใช้ในระบบ" },
  ];
  const [selectedReport, setSelectedReport] = useState<string[]>([]);
  const reportCategories = [
    {
      label: "รายงานหมวดการจัดการผู้ใช้",
      code: "User Management",
      items: [
        { value: "user-list", label: "รายงานรายการผู้ใช้" },
        { value: "user-activity", label: "รายงานกิจกรรมผู้ใช้" },
      ],
    },
    {
      label: "รายงานหมวดการจัดการข้อมูลทางการเกษตร",
      code: "Agricultural Data Management",
      items: [
        { value: "crop-yield", label: "รายงานผลผลิตทางการเกษตร" },
        { value: "pest-control", label: "รายงานการควบคุมศัตรูพืช" },
      ],
    },
  ];

  const groupTemplate = (option: any) => {
    return (
            <div className="flex align-items-center">
                <img alt={option.label} src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
                <div>{option.label}</div>
            </div>
        );
  };
  return (
    <AdminLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ตรวจสอบรายงาน</h1>
          <p className="mt-1 text-sm text-gray-500">
            ตรวจสอบรายงานสรุปข้อมูลต่างๆ
            ที่เกี่ยวข้องกับการจัดการข้อมูลทางการเกษตรผลผลิตยางพารา
          </p>
        </div>
        {/* Content Area */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700">
            ที่นี่คุณสามารถตรวจสอบรายงานต่างๆ ได้ตามความต้องการ
          </p>
          <p>โปรดเลือกรายงานที่ต้องการแสดง</p>
          <PrimaryMultiSelect
            value={selectedReport}
            options={reportCategories}
            onChange={(value) => setSelectedReport(value)}
            placeholder="เลือกประเภทรายงานที่ต้องการแสดง"
            optionLabel="label"
            optionGroupLabel="label"
            optionGroupChildren="items"
            optionGroupTemplate={groupTemplate}
            display="chip"
          ></PrimaryMultiSelect>
        </div>
      </div>
    </AdminLayout>
  );
}
