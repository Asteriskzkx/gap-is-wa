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

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        let url = "/api/v1/reports/users";
        
        // If dates are selected, add them to the query
        if (dates && dates[0] && dates[1]) {
          const startDate = dates[0].toISOString().split("T")[0];
          const endDate = dates[1].toISOString().split("T")[0];
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
          const startDate = dates[0].toISOString().split("T")[0];
          const endDate = dates[1].toISOString().split("T")[0];
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

          {/* Card Area */}
          {/* All-member-chart */}
          <div id="all-member-chart" className="mb-6 scroll-mt-8">
            <PrimaryCard className="w-full max-w-md h-auto px-6">
              <div id="all-member-content" className="flex items-center gap-4 p-4">
                <div className="flex flex-col items-start ">
                  <p className="text-lg text-left">
                    ผู้ใช้ทั้งหมดในระบบ
                    {dates && dates[0] && dates[1] ? "" : " (ทั้งหมด)"}
                  </p>
                  {loading ? (
                    <p className="text-2xl font-bold text-gray-400">กำลังโหลด...</p>
                  ) : (
                    <p className="text-2xl font-bold">{reportData?.totalUsers ?? 0} คน</p>
                  )}
                  
                </div>
                {dates && dates[0] && dates[1] && (
                  <div className="">
                    <p className="text-sm text-gray-500">
                      {dates[0].toLocaleDateString("th-TH")} - {dates[1].toLocaleDateString("th-TH")}
                    </p>
                  </div>
                )}
              </div>
            </PrimaryCard>
          </div>

          {/* Chart Area  */}
          {/* Pie Chart */}
          <div id="chart-area" className="flex flex-wrap gap-6">
            <div id="chart-pie" className="mb-6 scroll-mt-8 w-full max-w-md">
              <PrimaryCard className="p-5 h-auto">
                <p className="mb-2 text-lg text-center">
                  สัดส่วนผู้ใช้ในระบบ
                  {dates && dates[0] && dates[1] ? "" : " (ทั้งหมด)"}
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
                  {dates && dates[0] && dates[1] ? "" : " (ทั้งหมด)"}
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
