"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import {
  PrimaryButton,
  PrimaryCard,
  PrimaryDropdown,
  PrimaryMultiSelect,
} from "@/components/ui";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { useEffect, useMemo, useState, useRef } from "react";
import { useChart } from "@/hooks/useChart";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { exportReportPDF } from "@/lib/pdf/exportReportPDF";
import { resizeChartsForPDF, resetChartsAfterPDF } from "@/lib/pdf/chartResize";
import PrimaryDataTable, {
  PrimaryDataTableColumn,
} from "@/components/ui/PrimaryDataTable";

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

// Inspection Report Interfaces
interface InspectionStatusCount {
  status: string;
  count: number;
}

interface InspectionResultCount {
  result: string;
  count: number;
}

interface InspectionTypeCount {
  typeId: number;
  typeName: string;
  count: number;
}

interface InspectionReportSummary {
  totalInspections: number;
  byStatus: InspectionStatusCount[];
  byResult: InspectionResultCount[];
  byType: InspectionTypeCount[];
}

// Rubber Farm Report Interfaces
interface RubberFarmProvinceCount {
  province: string;
  count: number;
  totalArea: number;
}

interface RubberFarmReportSummary {
  totalFarms: number;
  totalArea: number;
  byProvince: RubberFarmProvinceCount[];
  byDistributionType: { type: string; count: number }[];
}

// Certificate Report Interfaces
interface CertificateReportSummary {
  totalCertificates: number;
  activeCertificates: number;
  expiredCertificates: number;
  expiringIn30Days: number;
  expiringIn60Days: number;
  expiringIn90Days: number;
  cancelRequested: number;
}

// Auditor Performance Interfaces
interface AuditorPerformance {
  auditorId: number;
  auditorName: string;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  passRate: number;
}

interface AuditorPerformanceReport {
  auditors: AuditorPerformance[];
  totalInspections: number;
  averagePassRate: number;
}

// Paginated Response Interfaces
interface Paginator {
  limit: number;
  offset: number;
  total: number;
}

interface PaginatedProvinceResponse {
  results: RubberFarmProvinceCount[];
  paginator: Paginator;
}

interface PaginatedAuditorResponse {
  results: AuditorPerformance[];
  paginator: Paginator;
  summary: { totalInspections: number; averagePassRate: number; totalAuditors: number };
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  COMMITTEE: "คณะกรรมการ",
  FARMER: "เกษตรกร",
  AUDITOR: "ผู้ตรวจประเมิน",
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
  const [newUsersData, setNewUsersData] =
    useState<NewUsersTimeSeriesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingNewUsers, setLoadingNewUsers] = useState(false);

  // New report states
  const [inspectionData, setInspectionData] =
    useState<InspectionReportSummary | null>(null);
  const [loadingInspection, setLoadingInspection] = useState(true);
  const [rubberFarmData, setRubberFarmData] =
    useState<RubberFarmReportSummary | null>(null);
  const [loadingRubberFarm, setLoadingRubberFarm] = useState(true);
  const [certificateData, setCertificateData] =
    useState<CertificateReportSummary | null>(null);
  const [loadingCertificate, setLoadingCertificate] = useState(true);
  const [auditorData, setAuditorData] =
    useState<AuditorPerformanceReport | null>(null);
  const [loadingAuditor, setLoadingAuditor] = useState(true);

  // Pagination states for province table
  const [provinceData, setProvinceData] = useState<RubberFarmProvinceCount[]>([]);
  const [provinceTotalRecords, setProvinceTotalRecords] = useState(0);
  const [provinceLazyParams, setProvinceLazyParams] = useState({ first: 0, rows: 5 });
  const [loadingProvince, setLoadingProvince] = useState(true);

  // Pagination states for auditor table
  const [auditorPaginatedData, setAuditorPaginatedData] = useState<AuditorPerformance[]>([]);
  const [auditorTotalRecords, setAuditorTotalRecords] = useState(0);
  const [auditorSummary, setAuditorSummary] = useState<{ totalInspections: number; averagePassRate: number; totalAuditors: number } | null>(null);
  const [auditorLazyParams, setAuditorLazyParams] = useState({ first: 0, rows: 5 });

  // Export PDF states
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportSections, setExportSections] = useState({
    users: true,
    inspections: true,
    rubberFarms: true,
    certificates: true,
    auditors: true,
  });
  const [exporting, setExporting] = useState(false);

  // Refs for export
  const userReportRef = useRef<HTMLDivElement>(null);
  const inspectionReportRef = useRef<HTMLDivElement>(null);
  const rubberFarmReportRef = useRef<HTMLDivElement>(null);
  const certificateReportRef = useRef<HTMLDivElement>(null);
  const auditorReportRef = useRef<HTMLDivElement>(null);

  // Helper function to format date as YYYY-MM-DD in local timezone
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Build URL with date params
  const buildUrl = (baseUrl: string): string => {
    if (dates && dates[0] && dates[1]) {
      const startDate = formatDateLocal(dates[0]);
      const endDate = formatDateLocal(dates[1]);
      return `${baseUrl}?startDate=${startDate}&endDate=${endDate}`;
    }
    return baseUrl;
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

  // Fetch inspection data
  useEffect(() => {
    const fetchInspectionData = async () => {
      try {
        setLoadingInspection(true);
        const url = buildUrl("/api/v1/reports/inspections");
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setInspectionData(data);
        }
      } catch (error) {
        console.error("Error fetching inspection data:", error);
      } finally {
        setLoadingInspection(false);
      }
    };
    fetchInspectionData();
  }, [dates]);

  // Fetch rubber farm data (summary without pagination)
  useEffect(() => {
    const fetchRubberFarmData = async () => {
      try {
        setLoadingRubberFarm(true);
        const url = buildUrl("/api/v1/reports/rubber-farms");
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setRubberFarmData(data);
        }
      } catch (error) {
        console.error("Error fetching rubber farm data:", error);
      } finally {
        setLoadingRubberFarm(false);
      }
    };
    fetchRubberFarmData();
  }, [dates]);

  // Fetch province data with pagination
  useEffect(() => {
    const fetchProvinceData = async () => {
      try {
        setLoadingProvince(true);
        let url = `/api/v1/reports/rubber-farms?limit=${provinceLazyParams.rows}&offset=${provinceLazyParams.first}`;
        if (dates && dates[0] && dates[1]) {
          const startDate = formatDateLocal(dates[0]);
          const endDate = formatDateLocal(dates[1]);
          url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await fetch(url);
        if (response.ok) {
          const data: PaginatedProvinceResponse = await response.json();
          setProvinceData(data.results);
          setProvinceTotalRecords(data.paginator.total);
        }
      } catch (error) {
        console.error("Error fetching province data:", error);
      } finally {
        setLoadingProvince(false);
      }
    };
    fetchProvinceData();
  }, [dates, provinceLazyParams]);

  // Fetch certificate data
  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoadingCertificate(true);
        const url = buildUrl("/api/v1/reports/certificates");
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setCertificateData(data);
        }
      } catch (error) {
        console.error("Error fetching certificate data:", error);
      } finally {
        setLoadingCertificate(false);
      }
    };
    fetchCertificateData();
  }, [dates]);

  // Fetch auditor performance data with pagination
  useEffect(() => {
    const fetchAuditorData = async () => {
      try {
        setLoadingAuditor(true);
        let url = `/api/v1/reports/auditor-performance?limit=${auditorLazyParams.rows}&offset=${auditorLazyParams.first}`;
        if (dates && dates[0] && dates[1]) {
          const startDate = formatDateLocal(dates[0]);
          const endDate = formatDateLocal(dates[1]);
          url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await fetch(url);
        if (response.ok) {
          const data: PaginatedAuditorResponse = await response.json();
          setAuditorPaginatedData(data.results);
          setAuditorTotalRecords(data.paginator.total);
          setAuditorSummary(data.summary);
        }
      } catch (error) {
        console.error("Error fetching auditor data:", error);
      } finally {
        setLoadingAuditor(false);
      }
    };
    fetchAuditorData();
  }, [dates, auditorLazyParams]);

  // Reset pagination when dates change
  useEffect(() => {
    setProvinceLazyParams((prev) => ({ ...prev, first: 0 }));
    setAuditorLazyParams((prev) => ({ ...prev, first: 0 }));
  }, [dates]);

  // Export PDF function
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      resizeChartsForPDF();

      await exportReportPDF({
        filename: `รายงานระบบ_${new Date().toISOString().split("T")[0]}.pdf`,
        header: {
          title: "รายงานสรุปข้อมูลระบบ",
          dateRangeText:
            dates && dates[0] && dates[1]
              ? `ช่วงวันที่: ${dates[0].toLocaleDateString(
                "th-TH"
              )} - ${dates[1].toLocaleDateString("th-TH")}`
              : undefined,
        },
        sections: [
          exportSections.users && { ref: userReportRef },
          exportSections.inspections && { ref: inspectionReportRef },
          exportSections.rubberFarms && { ref: rubberFarmReportRef },
          exportSections.certificates && { ref: certificateReportRef },
          exportSections.auditors && { ref: auditorReportRef },
        ].filter(Boolean) as any,
      });
    } finally {
      resetChartsAfterPDF();
      setExporting(false);
    }
  };

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
        return date.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        });
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
      animation: false,
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
      animation: false,
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
          text: `จำนวนผู้ใช้ใหม่ (${getGranularityLabel(
            newUsersData?.granularity
          )})`,
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

  const auditorColumns: PrimaryDataTableColumn[] = [
    {
      field: "auditorName",
      bodyAlign: "left",
      header: "ชื่อผู้ตรวจประเมิน",
      headerAlign: "center"
    },
    {
      field: "totalInspections",
      bodyAlign: "right",
      header: "ตรวจทั้งหมด",
      headerAlign: "center"
    },
    {
      field: "passedInspections",
      header: "ผ่าน",
      bodyAlign: "right",
      headerAlign: "center",
      body: (row) => (
        <span className="text-green-600 font-medium">
          {row.passedInspections}
        </span>
      ),
    },
    {
      field: "failedInspections",
      header: "ไม่ผ่าน",
      bodyAlign: "right",
      headerAlign: "center",
      body: (row) => (
        <span className="text-red-600 font-medium">
          {row.failedInspections}
        </span>
      ),
    },
    {
      field: "passRate",
      header: "อัตราผ่าน",
      headerAlign: "center",
      bodyAlign: "center",
      body: (row) => (
        <span
          className={`font-medium ${row.passRate >= 80
            ? "text-green-600"
            : row.passRate >= 50
              ? "text-yellow-600"
              : "text-red-600"
            }`}
        >
          {row.passRate}%
        </span>
      ),
    },
  ];

  const topRankColumns: PrimaryDataTableColumn[] = [
    {
      field: "province",
      header: "จังหวัด",
      headerAlign: "center",
      bodyAlign: "left",
    },
    {
      field: "count",
      header: "จำนวนแปลง",
      headerAlign: "center",
      bodyAlign: "right",
    },
    {
      field: "totalArea",
      header: "พื้นที่รวม (ไร่)",
      headerAlign: "center",
      bodyAlign: "right",
      body: (row) => row.totalArea.toLocaleString(),
    }]

  return (
    <AdminLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-4">
            <h1 className="text-2xl font-bold text-gray-900">ตรวจสอบรายงาน</h1>
            <p className="mt-1 text-sm text-gray-500">
              ตรวจสอบรายงานสรุปข้อมูลต่างๆ สำหรับผู้ดูแลระบบ
            </p>
          </div>
          <div className="lg:col-start-6 self-end">
            <PrimaryButton
              label="ส่งออก PDF"
              icon="pi pi-file-pdf"
              fullWidth
              onClick={() => setShowExportDialog(true)}
            />
          </div>
        </div>

        {/* Export PDF Dialog */}
        <Dialog
          header="เลือกรายงานที่ต้องการส่งออก"
          visible={showExportDialog}
          blockScroll={true}
          draggable={false}
          style={{ width: "450px" }}
          onHide={() => setShowExportDialog(false)}
          footer={
            <div className="flex justify-end gap-2">
              <Button
                label="ยกเลิก"
                icon="pi pi-times"
                className="p-button-text p-2"
                onClick={() => setShowExportDialog(false)}
              />
              <Button
                label={exporting ? "กำลังส่งออก..." : "ส่งออก PDF"}
                icon="pi pi-file-pdf"
                className="p-button-success p-2"
                onClick={handleExportPDF}
                disabled={
                  exporting || !Object.values(exportSections).some(Boolean)
                }
                loading={exporting}
              />
            </div>
          }
        >
          <div className="flex flex-col gap-3 py-2">
            {/* Select All */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Checkbox
                inputId="export-all"
                checked={Object.values(exportSections).every(Boolean)}
                onChange={(e) => {
                  const checked = e.checked ?? false;
                  setExportSections({
                    users: checked,
                    inspections: checked,
                    rubberFarms: checked,
                    certificates: checked,
                    auditors: checked,
                  });
                }}
                className="border border-gray-300 rounded"
              />
              <label
                htmlFor="export-all"
                className="cursor-pointer font-medium"
              >
                ✅ เลือกทั้งหมด
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-users"
                checked={exportSections.users}
                onChange={(e) =>
                  setExportSections({
                    ...exportSections,
                    users: e.checked ?? false,
                  })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-users" className="cursor-pointer">
                รายงานผู้ใช้งาน
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-inspections"
                checked={exportSections.inspections}
                onChange={(e) =>
                  setExportSections({
                    ...exportSections,
                    inspections: e.checked ?? false,
                  })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-inspections" className="cursor-pointer">
                รายงานการตรวจประเมิน
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-rubberFarms"
                checked={exportSections.rubberFarms}
                onChange={(e) =>
                  setExportSections({
                    ...exportSections,
                    rubberFarms: e.checked ?? false,
                  })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-rubberFarms" className="cursor-pointer">
                รายงานแปลงสวนยางพารา
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-certificates"
                checked={exportSections.certificates}
                onChange={(e) =>
                  setExportSections({
                    ...exportSections,
                    certificates: e.checked ?? false,
                  })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-certificates" className="cursor-pointer">
                รายงานใบรับรอง
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-auditors"
                checked={exportSections.auditors}
                onChange={(e) =>
                  setExportSections({
                    ...exportSections,
                    auditors: e.checked ?? false,
                  })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-auditors" className="cursor-pointer">
                รายงานประสิทธิภาพผู้ตรวจประเมิน
              </label>
            </div>
          </div>
        </Dialog>

        {/* Global Date Filter Section */}
        <div className="mt-8 flex flex-col bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-700 font-medium whitespace-nowrap">
                📅 ช่วงวันที่:
              </span>
              <Calendar
                data-testid="date-range"
                showIcon
                value={dates}
                placeholder="เลือกช่วงวันที่"
                onChange={(e) => setDates(e.value ?? null)}
                selectionMode="range"
                readOnlyInput
                hideOnRangeSelection
                dateFormat="dd/mm/yy"
                style={{ minWidth: "250px" }}
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
            <p className="text-sm text-gray-500">
              * ช่วงวันที่นี้ใช้กับรายงานทุกประเภท
            </p>
          </div>
        </div>

        {/* User Report Section */}
        <div
          ref={userReportRef}
          className="mt-6 flex flex-col report-section bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            รายงานผู้ใช้งาน
          </h2>

          {/* Card Area - 5 columns: Total + 4 Roles */}
          <div id="card-area" className="mb-6 scroll-mt-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* All Members Card */}
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-gray-400">
                <p className="text-sm text-gray-600 mb-1 text-center">
                  {dates && dates[0] && dates[1]
                    ? "ผู้ใช้ทั้งหมด"
                    : "ผู้ใช้ทั้งหมด"}
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
                  const roleData = reportData?.countByRole.find(
                    (r) => r.role === role
                  );
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
                  {dates && dates[0] && dates[1]
                    ? " (ตามช่วงวันที่เลือก)"
                    : " (ทั้งหมด)"}
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
            <div
              id="chart-line"
              className="mb-6 scroll-mt-8 flex-1 min-w-56 overflow-x-auto"
            >
              <PrimaryCard className="p-5 overflow-x-auto">
                <p className="mb-2 text-lg text-center">
                  จำนวนผู้ใช้ใหม่แยกตามบทบาท
                  {dates && dates[0] && dates[1]
                    ? " (ตามช่วงวันที่เลือก)"
                    : " (ทั้งหมด)"}
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

        {/* ==================== INSPECTION REPORTS ==================== */}
        <div
          ref={inspectionReportRef}
          className="mt-8 flex flex-col report-section bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            รายงานการตรวจประเมิน
          </h2>

          {/* Inspection Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-blue-500">
              <p className="text-sm text-gray-600 mb-1">การตรวจทั้งหมด</p>
              {loadingInspection ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-blue-500">
                  {inspectionData?.totalInspections ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ครั้ง</p>
            </div>

            {/* By Result */}
            {loadingInspection ? (
              <>
                <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-gray-200">
                  <p className="text-sm text-gray-400 mb-1">กำลังโหลด...</p>
                  <p className="text-3xl font-bold text-gray-300">-</p>
                </div>
              </>
            ) : (
              inspectionData?.byResult.map((result) => (
                <div
                  key={result.result}
                  className={`bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 ${result.result === "ผ่าน" || result.result === "PASSED"
                    ? "border-green-500"
                    : "border-red-500"
                    }`}
                >
                  <p className="text-sm text-gray-600 mb-1">{result.result}</p>
                  <p
                    className={`text-3xl font-bold ${result.result === "ผ่าน" || result.result === "PASSED"
                      ? "text-green-500"
                      : "text-red-500"
                      }`}
                  >
                    {result.count}
                  </p>
                  <p className="text-xs text-gray-500">ครั้ง</p>
                </div>
              ))
            )}
          </div>

          {/* Inspection by Type */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              แยกตามประเภทการตรวจ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loadingInspection ? (
                <p className="text-gray-400">กำลังโหลด...</p>
              ) : inspectionData?.byType.length === 0 ? (
                <p className="text-gray-400">ไม่มีข้อมูล</p>
              ) : (
                inspectionData?.byType.map((type) => (
                  <div
                    key={type.typeId}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <p className="text-sm text-gray-600">{type.typeName}</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {type.count}{" "}
                      <span className="text-sm font-normal">ครั้ง</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Inspection by Status */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              แยกตามสถานะ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loadingInspection ? (
                <p className="text-gray-400">กำลังโหลด...</p>
              ) : inspectionData?.byStatus.length === 0 ? (
                <p className="text-gray-400">ไม่มีข้อมูล</p>
              ) : (
                inspectionData?.byStatus.map((status) => (
                  <div
                    key={status.status}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center"
                  >
                    <p className="text-xs text-gray-500">{status.status}</p>
                    <p className="text-xl font-bold text-gray-700">
                      {status.count}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ==================== RUBBER FARM REPORTS ==================== */}
        <div
          ref={rubberFarmReportRef}
          className="mt-8 flex flex-col report-section bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            รายงานแปลงสวนยางพารา
          </h2>

          {/* Farm Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-green-600">
              <p className="text-sm text-gray-600 mb-1">แปลงทั้งหมด</p>
              {loadingRubberFarm ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-green-600">
                  {rubberFarmData?.totalFarms ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">แปลง</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-amber-600">
              <p className="text-sm text-gray-600 mb-1">พื้นที่รวม</p>
              {loadingRubberFarm ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-amber-600">
                  {rubberFarmData?.totalArea ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ไร่</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-purple-600">
              <p className="text-sm text-gray-600 mb-1">จังหวัด</p>
              {loadingRubberFarm ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-purple-600">
                  {rubberFarmData?.byProvince.length ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">จังหวัด</p>
            </div>
          </div>

          {/* By Distribution Type */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              แยกตามประเภทการจำหน่าย
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loadingRubberFarm ? (
                <p className="text-gray-400">กำลังโหลด...</p>
              ) : rubberFarmData?.byDistributionType.length === 0 ? (
                <p className="text-gray-400">ไม่มีข้อมูล</p>
              ) : (
                rubberFarmData?.byDistributionType.map((dist) => (
                  <div
                    key={dist.type}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center"
                  >
                    <p className="text-xs text-gray-500">
                      {dist.type || "ไม่ระบุ"}
                    </p>
                    <p className="text-xl font-bold text-gray-700">
                      {dist.count}{" "}
                      <span className="text-sm font-normal">แปลง</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* By Province - Paginated Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              จังหวัดที่มีแปลงสวนยางพารามากที่สุด
            </h3>
            <PrimaryDataTable
              value={provinceData}
              columns={topRankColumns}
              loading={loadingProvince}
              emptyMessage="ไม่มีข้อมูลแปลงสวนยางพารา"
              lazy
              paginator
              rows={provinceLazyParams.rows}
              totalRecords={provinceTotalRecords}
              first={provinceLazyParams.first}
              onPage={(e) => setProvinceLazyParams({ first: e.first, rows: e.rows })}
              rowsPerPageOptions={[5, 10, 25]}
              dataKey="province"
            />
          </div>
        </div>

        {/* ==================== CERTIFICATE REPORTS ==================== */}
        <div
          ref={certificateReportRef}
          className="mt-8 flex flex-col report-section bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            รายงานใบรับรอง
          </h2>

          {/* Certificate Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-blue-600">
              <p className="text-sm text-gray-600 mb-1">ใบรับรองทั้งหมด</p>
              {loadingCertificate ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-blue-600">
                  {certificateData?.totalCertificates ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ใบ</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-green-500">
              <p className="text-sm text-gray-600 mb-1">ใช้งานอยู่</p>
              {loadingCertificate ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-green-500">
                  {certificateData?.activeCertificates ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ใบ</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-red-500">
              <p className="text-sm text-gray-600 mb-1">หมดอายุแล้ว</p>
              {loadingCertificate ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-red-500">
                  {certificateData?.expiredCertificates ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ใบ</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-orange-500">
              <p className="text-sm text-gray-600 mb-1">ขอยกเลิก</p>
              {loadingCertificate ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-orange-500">
                  {certificateData?.cancelRequested ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ใบ</p>
            </div>
          </div>

          {/* Expiring Alerts */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              ใบรับรองใกล้หมดอายุ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-red-600">ภายใน 30 วัน</p>
                {loadingCertificate ? (
                  <p className="text-2xl font-bold text-gray-300">...</p>
                ) : (
                  <p className="text-2xl font-bold text-red-600">
                    {certificateData?.expiringIn30Days ?? 0}{" "}
                    <span className="text-sm font-normal">ใบ</span>
                  </p>
                )}
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-sm text-orange-600">ภายใน 60 วัน</p>
                {loadingCertificate ? (
                  <p className="text-2xl font-bold text-gray-300">...</p>
                ) : (
                  <p className="text-2xl font-bold text-orange-600">
                    {certificateData?.expiringIn60Days ?? 0}{" "}
                    <span className="text-sm font-normal">ใบ</span>
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-600">ภายใน 90 วัน</p>
                {loadingCertificate ? (
                  <p className="text-2xl font-bold text-gray-300">...</p>
                ) : (
                  <p className="text-2xl font-bold text-yellow-600">
                    {certificateData?.expiringIn90Days ?? 0}{" "}
                    <span className="text-sm font-normal">ใบ</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== AUDITOR PERFORMANCE REPORTS ==================== */}
        <div
          ref={auditorReportRef}
          className="mt-8 flex flex-col report-section bg-white rounded-lg shadow p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            รายงานประสิทธิภาพผู้ตรวจประเมิน
          </h2>

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-indigo-600">
              <p className="text-sm text-gray-600 mb-1">การตรวจทั้งหมด</p>
              {loadingAuditor ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-indigo-600">
                  {auditorSummary?.totalInspections ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ครั้ง</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-teal-600">
              <p className="text-sm text-gray-600 mb-1">อัตราการผ่านเฉลี่ย</p>
              {loadingAuditor ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-teal-600">
                  {auditorSummary?.averagePassRate ?? 0}%
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-cyan-600">
              <p className="text-sm text-gray-600 mb-1">
                ผู้ตรวจประเมินที่มีผลงาน
              </p>
              {loadingAuditor ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-cyan-600">
                  {auditorSummary?.totalAuditors ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">คน</p>
            </div>
          </div>

          {/* Auditor Performance Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              ผลงานแต่ละผู้ตรวจประเมิน
            </h3>
            <PrimaryDataTable
              data-testid="auditor-performance-table"
              value={auditorPaginatedData}
              columns={auditorColumns}
              loading={loadingAuditor}
              emptyMessage="ไม่มีข้อมูลผู้ตรวจประเมิน"
              lazy
              paginator
              rows={auditorLazyParams.rows}
              totalRecords={auditorTotalRecords}
              first={auditorLazyParams.first}
              onPage={(e) => setAuditorLazyParams({ first: e.first, rows: e.rows })}
              rowsPerPageOptions={[5, 10, 25]}
              dataKey="auditorId"
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
