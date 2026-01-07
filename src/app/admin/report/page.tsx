"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import {
  PrimaryCard,
  PrimaryDropdown,
  PrimaryMultiSelect,
} from "@/components/ui";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useEffect, useMemo, useState } from "react";
import { useChart } from "@/hooks/useChart";

interface UserCountByRole {
  role: string;
  count: number;
}

interface UserReportSummary {
  totalUsers: number;
  countByRole: UserCountByRole[];
}

interface NewUsersByDateAndRole {
  date: string;
  counts: Record<string, number>;
}

interface NewUsersTimeSeriesReport {
  data: NewUsersByDateAndRole[];
  roles: string[];
  granularity: "hour" | "day" | "week" | "month" | "year";
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  COMMITTEE: "คณะกรรมการ",
  FARMER: "เกษตรกร",
  AUDITOR: "ผู้ตรวจสอบ",
  BASIC: "ผู้ใช้ทั่วไป",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#60a5fa",
  COMMITTEE: "#34d399",
  FARMER: "#fbbf24",
  AUDITOR: "#f87171",
  BASIC: "#a78bfa",
};

// Helper function for point styles
const getPointStyle = (role: string): string => {
  const styles: Record<string, string> = {
    ADMIN: "circle",
    COMMITTEE: "triangle",
    FARMER: "rect",
    AUDITOR: "star",
    BASIC: "cross",
  };
  return styles[role] || "circle";
};

export default function AdminReportPage() {
  const [dates, setDates] = useState<(Date | null)[] | null>(null);
  const [reportData, setReportData] = useState<UserReportSummary | null>(null);
  const [newUsersData, setNewUsersData] = useState<NewUsersTimeSeriesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingNewUsers, setLoadingNewUsers] = useState(false);

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        let url = "/api/v1/reports/users";
        
        // If dates are selected, add them to the query
        if (dates && dates[0] && dates[1]) {
          const startDate = formatDateLocal(dates[0]);
          const endDate = formatDateLocal(dates[1]);
          url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setReportData(data);
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [dates]);

  // Fetch new users data when date range changes or on initial load
  useEffect(() => {
    const fetchNewUsersData = async () => {
      try {
        setLoadingNewUsers(true);
        let url = "/api/v1/reports/users/new-users";
        
        // If dates are selected, add them to the query
        if (dates && dates[0] && dates[1]) {
          const startDate = formatDateLocal(dates[0]);
          const endDate = formatDateLocal(dates[1]);
          url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setNewUsersData(data);
        }
      } catch (error) {
        console.error("Error fetching new users data:", error);
      } finally {
        setLoadingNewUsers(false);
      }
    };

    fetchNewUsersData();
  }, [dates]);

  const data = useMemo(() => {
    if (!reportData) {
      return {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }],
      };
    }

    const filteredRoles = reportData.countByRole.filter((r) => r.count > 0);
    
    // ถ้าไม่มีข้อมูลเลย ให้แสดง chart ว่างสีเทา
    if (filteredRoles.length === 0) {
      return {
        labels: ["ไม่มีข้อมูล"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#d1d5db"],
            borderColor: ["#9ca3af"],
            borderWidth: 1,
          },
        ],
      };
    }
    
    return {
      labels: filteredRoles.map((r) => ROLE_LABELS[r.role] || r.role),
      datasets: [
        {
          data: filteredRoles.map((r) => r.count),
          backgroundColor: filteredRoles.map(
            (r) => ROLE_COLORS[r.role] || "#9ca3af"
          ),
        },
      ],
    };
  }, [reportData]);

  // Line chart data for new users by date
  const lineChartData = useMemo(() => {
    if (!newUsersData || newUsersData.data.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Labels are already formatted from the API based on granularity
    const labels = newUsersData.data.map((d) => {
      // For day and hour granularity, format nicely; for others, use directly
      if (newUsersData.granularity === "day") {
        const date = new Date(d.date);
        return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
      } else if (newUsersData.granularity === "hour") {
        // Format: "2026-01-07 14:00" -> "14:00"
        const parts = d.date.split(" ");
        return parts[1] || d.date;
      }
      // For week, month, year - already formatted in Thai from API
      return d.date;
    });

    const datasets = newUsersData.roles
      .filter((role) => role !== "BASIC") // Filter out BASIC role for clarity
      .map((role) => ({
        label: ROLE_LABELS[role] || role,
        data: newUsersData.data.map((d) => d.counts[role] || 0),
        borderColor: ROLE_COLORS[role] || "#9ca3af",
        backgroundColor: ROLE_COLORS[role] || "#9ca3af",
        pointStyle: getPointStyle(role),
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.1,
        fill: false,
      }));

    return { labels, datasets };
  }, [newUsersData]);

  // Helper function to get granularity label in Thai
  const getGranularityLabel = (granularity: string | undefined): string => {
    const labels: Record<string, string> = {
      hour: "รายชั่วโมง",
      day: "รายวัน",
      week: "รายสัปดาห์",
      month: "รายเดือน",
      year: "รายปี",
    };
    return labels[granularity || "day"] || "รายวัน";
  };

  // Helper function to get X-axis label based on granularity
  const getXAxisLabel = (granularity: string | undefined): string => {
    const labels: Record<string, string> = {
      hour: "ชั่วโมง",
      day: "วันที่",
      week: "สัปดาห์",
      month: "เดือน",
      year: "ปี",
    };
    return labels[granularity || "day"] || "วันที่";
  };

  const pieChartRef = useChart({
    type: "pie",
    data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });

  const lineChartRef = useChart({
    type: "line",
    data: lineChartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
          },
        },
        title: {
          display: true,
          text: `จำนวนผู้ใช้ใหม่ (${getGranularityLabel(newUsersData?.granularity)})`,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
          title: {
            display: true,
            text: "จำนวนผู้ใช้ (คน)",
          },
        },
        x: {
          title: {
            display: true,
            text: getXAxisLabel(newUsersData?.granularity),
          },
        },
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
        <div className="mt-8 flex flex-col bg-white rounded-lg shadow p-6">
          {/* Header Section of Content Contain Filter*/}
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

          {/* Card Area - 5 columns: Total + 4 Roles */}
          <div id="card-area" className="mb-6 scroll-mt-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* All Members Card */}
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-gray-400">
                <p className="text-sm text-gray-600 mb-1 text-center">
                  {dates && dates[0] && dates[1] ? "ผู้ใช้ทั้งหมด" : "ผู้ใช้ทั้งหมด"}
                </p>
                {loading ? (
                  <p className="text-3xl font-bold text-gray-400">...</p>
                ) : (
                  <p className="text-3xl font-bold text-gray-700">
                    {reportData?.totalUsers ?? 0}
                  </p>
                )}
                <p className="text-xs text-gray-500">คน</p>
              </div>

              {/* Role Cards */}
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-gray-200"
                    >
                      <p className="text-sm text-gray-400 mb-1">กำลังโหลด...</p>
                      <p className="text-3xl font-bold text-gray-300">-</p>
                      <p className="text-xs text-gray-400">คน</p>
                    </div>
                  ))}
                </>
              ) : (
                ["ADMIN", "COMMITTEE", "FARMER", "AUDITOR"].map((role) => {
                  const roleData = reportData?.countByRole.find((r) => r.role === role);
                  const count = roleData?.count ?? 0;
                  return (
                    <div
                      key={role}
                      className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2"
                      style={{ borderColor: ROLE_COLORS[role] || "#9ca3af" }}
                    >
                      <p className="text-sm text-gray-600 mb-1 text-center">
                        {ROLE_LABELS[role] || role}
                      </p>
                      <p
                        className="text-3xl font-bold"
                        style={{ color: ROLE_COLORS[role] || "#9ca3af" }}
                      >
                        {count}
                      </p>
                      <p className="text-xs text-gray-500">คน</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chart Area  */}
          {/* Pie Chart */}
          <div id="chart-area" className="flex flex-wrap gap-6">
            <div id="chart-pie" className="mb-6 scroll-mt-8 w-full max-w-md">
              <PrimaryCard className="p-5 h-auto">
                <p className="mb-2 text-lg text-center">
                  สัดส่วนผู้ใช้ในระบบ
                  {dates && dates[0] && dates[1] ? " (ตามช่วงวันที่เลือก)" : " (ทั้งหมด)"}
                </p>
                {loading ? (
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    <p>กำลังโหลดข้อมูล...</p>
                  </div>
                ) : (
                  <canvas ref={pieChartRef} id="pieChart"></canvas>
                )}
              </PrimaryCard>
            </div>

            {/* Line Chart - New Users by Date */}
            <div id="chart-line" className="mb-6 scroll-mt-8 flex-1 min-w-56 overflow-x-auto">
              <PrimaryCard className="p-5 overflow-x-auto">
                <p className="mb-2 text-lg text-center">
                  จำนวนผู้ใช้ใหม่แยกตามบทบาท
                  {dates && dates[0] && dates[1] ? " (ตามช่วงวันที่เลือก)" : " (ทั้งหมด)"}
                </p>
                {loadingNewUsers ? (
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    <p>กำลังโหลดข้อมูล...</p>
                  </div>
                ) : (
                  <div className="h-[358px]">
                    <canvas ref={lineChartRef} id="lineChart"></canvas>
                  </div>
                )}
              </PrimaryCard>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
