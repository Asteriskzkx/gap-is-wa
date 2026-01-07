"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import {
  PrimaryCard,
  PrimaryDropdown,
  PrimaryMultiSelect,
} from "@/components/ui";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useMemo, useState } from "react";
import { useChart } from "@/hooks/useChart";

export default function AdminReportPage() {
  const [dates, setDates] = useState<(Date | null)[] | null>(null);

  const data = useMemo(
    () => ({
      labels: ["Admin", "Committee", "Farmer", "Auditor"],
      datasets: [
        {
          data: [40, 35, 25, 50],
          backgroundColor: ["#60a5fa", "#34d399", "#fbbf24", "#f87171"],
        },
      ],
    }),
    []
  );

  const pieChartRef = useChart({
    type: "pie",
    data,
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
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
        {/* Header Area */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              กราฟแสดงข้อมูลรายงาน
            </h2>
            <div className="items-center justify-end gap-2 mb-6">
              <div className="w-auto">
                <Calendar
                  showIcon
                  className=""
                  value={dates}
                  placeholder="เลือกช่วงวันที่แสดงแผนผัง"
                  onChange={(e) => setDates(e.value ?? null)}
                  selectionMode="range"
                  readOnlyInput
                  hideOnRangeSelection
                  footerTemplate={() => (
                    <div className="flex justify-end m-3">
                      <Button
                        label="ล้างวันที่"
                        className="p-button-text p-button-danger p-2"
                        onClick={() => setDates(null)}
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Graph Area */}

          {/* All-member-chart */}
          <div id="all-member-chart" className="mb-6 scroll-mt-8">
            <PrimaryCard className="w-full max-w-md h-auto px-6">
              <div id="all-member-content" className="flex items-center gap-4 p-4">
                <div className="flex flex-col items-start ">
                  <p className="text-lg text-left">ผู้ใช้ทั้งหมดในระบบ</p>
                  {/* TODO: Change to use real data */}
                  <p className="text-2xl font-bold">150 คน</p>
                  
                </div>
                {dates && <div className="">
                 <p className="text-lg text-left">ในช่วงวันที่</p>
                </div>}
              </div>
            </PrimaryCard>
          </div>

          {/* Pie Chart */}
          <div id="chart-pie" className="mb-6 scroll-mt-8">
            <PrimaryCard className="p-5 w-full max-w-md flex items-center justify-center">
              <p className="mb-2 text-lg text-center">สัดส่วนผู้ใช้ในระบบ</p>
              <canvas ref={pieChartRef} id="pieChart"></canvas>
            </PrimaryCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
