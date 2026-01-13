"use client";

import CommitteeLayout from "@/components/layout/CommitteeLayout";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { useEffect, useState, useRef, useMemo } from "react";
import { useChart } from "@/hooks/useChart";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PrimaryButton } from "@/components/ui";

// ==================== Interfaces ====================

interface CertificateStats {
  totalCertificates: number;
  activeCertificates: number;
  expiredCertificates: number;
  cancelRequested: number;
}

interface ExpiringCertificate {
  certificateId: number;
  farmerName: string;
  farmLocation: string;
  province: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

interface CertificateExpiryAlerts {
  expiring30Days: ExpiringCertificate[];
  expiring60Days: ExpiringCertificate[];
  expiring90Days: ExpiringCertificate[];
}

interface InspectionStats {
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  pendingInspections: number;
  passRate: number;
}

interface InspectionByType {
  typeId: number;
  typeName: string;
  count: number;
  passed: number;
  failed: number;
  pending?: number;
}

interface InspectionByStatus {
  status: string;
  count: number;
}

interface MyCommitteeStats {
  committeeName: string;
  totalCertificatesIssued: number;
  certificatesThisMonth: number;
  certificatesThisYear: number;
  recentCertificates: {
    certificateId: number;
    farmerName: string;
    farmLocation: string;
    province: string;
    effectiveDate: string;
    expiryDate: string;
  }[];
  monthlyIssuance: {
    month: string;
    count: number;
  }[];
}

interface CommitteeReportSummary {
  certificateStats: CertificateStats;
  certificateExpiryAlerts: CertificateExpiryAlerts;
  inspectionStats: InspectionStats;
  inspectionsByType: InspectionByType[];
  inspectionsByStatus: InspectionByStatus[];
  myCommitteeStats?: MyCommitteeStats;
}

export default function CommitteeReportPage() {
  const [dates, setDates] = useState<(Date | null)[] | null>(null);
  const [reportData, setReportData] = useState<CommitteeReportSummary | null>(
    null
  );
  const [chartData, setChartData] = useState<{
    inspectionStats: CommitteeReportSummary["inspectionStats"] | null;
    inspectionsByType: CommitteeReportSummary["inspectionsByType"];
    inspectionsByStatus: CommitteeReportSummary["inspectionsByStatus"];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  // Export PDF states
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportSections, setExportSections] = useState({
    myCommitteeStats: true,
    certificateStats: true,
    expiryAlerts: true,
    inspectionStats: true,
    charts: true,
  });
  const [exporting, setExporting] = useState(false);

  // Refs for export
  const myCommitteeStatsRef = useRef<HTMLDivElement>(null);
  const certificateStatsRef = useRef<HTMLDivElement>(null);
  const expiryAlertsRef = useRef<HTMLDivElement>(null);
  const inspectionStatsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

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

  // Fetch base report data (without date filter)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/reports/committee");
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
          // Initialize chart data from base data
          setChartData({
            inspectionStats: data.inspectionStats,
            inspectionsByType: data.inspectionsByType,
            inspectionsByStatus: data.inspectionsByStatus,
          });
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch chart data with date filter
  useEffect(() => {
    const fetchChartData = async () => {
      if (!dates || !dates[0] || !dates[1]) {
        // Reset to base data when dates are cleared
        if (reportData) {
          setChartData({
            inspectionStats: reportData.inspectionStats,
            inspectionsByType: reportData.inspectionsByType,
            inspectionsByStatus: reportData.inspectionsByStatus,
          });
        }
        return;
      }

      setChartLoading(true);
      try {
        const url = buildUrl("/api/v1/reports/committee");
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setChartData({
            inspectionStats: data.inspectionStats,
            inspectionsByType: data.inspectionsByType,
            inspectionsByStatus: data.inspectionsByStatus,
          });
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setChartLoading(false);
      }
    };
    fetchChartData();
  }, [dates, reportData]);

  // ==================== Chart Data ====================

  // Pie Chart: Certificate Status
  const certificateChartData = useMemo(() => {
    if (!reportData?.certificateStats) {
      return {
        labels: ["ไม่มีข้อมูล"],
        datasets: [{ data: [1], backgroundColor: ["#d1d5db"] }],
      };
    }
    const { activeCertificates, expiredCertificates, cancelRequested } =
      reportData.certificateStats;
    const hasData =
      activeCertificates > 0 || expiredCertificates > 0 || cancelRequested > 0;
    if (!hasData) {
      return {
        labels: ["ไม่มีข้อมูล"],
        datasets: [{ data: [1], backgroundColor: ["#d1d5db"] }],
      };
    }
    return {
      labels: ["ใช้งานอยู่", "หมดอายุ", "ขอยกเลิก"],
      datasets: [
        {
          data: [activeCertificates, expiredCertificates, cancelRequested],
          backgroundColor: ["#22c55e", "#6b7280", "#f97316"],
        },
      ],
    };
  }, [reportData]);

  // Pie Chart: Inspection Results
  const inspectionResultChartData = useMemo(() => {
    if (!chartData?.inspectionStats) {
      return {
        labels: ["ไม่มีข้อมูล"],
        datasets: [{ data: [1], backgroundColor: ["#d1d5db"] }],
      };
    }
    const { passedInspections, failedInspections, pendingInspections } =
      chartData.inspectionStats;
    const hasData =
      passedInspections > 0 || failedInspections > 0 || pendingInspections > 0;
    if (!hasData) {
      return {
        labels: ["ไม่มีข้อมูล"],
        datasets: [{ data: [1], backgroundColor: ["#d1d5db"] }],
      };
    }
    return {
      labels: ["ผ่าน", "ไม่ผ่าน", "รอดำเนินการ"],
      datasets: [
        {
          data: [passedInspections, failedInspections, pendingInspections],
          backgroundColor: ["#22c55e", "#ef4444", "#f59e0b"],
        },
      ],
    };
  }, [chartData]);

  // Bar Chart: Inspection by Type
  const inspectionByTypeChartData = useMemo(() => {
    if (
      !chartData?.inspectionsByType ||
      chartData.inspectionsByType.length === 0
    ) {
      return {
        labels: ["ไม่มีข้อมูล"],
        datasets: [{ data: [0], backgroundColor: ["#d1d5db"] }],
      };
    }
    return {
      labels: chartData.inspectionsByType.map((t) => t.typeName),
      datasets: [
        {
          label: "ผ่าน",
          data: chartData.inspectionsByType.map((t) => t.passed),
          backgroundColor: "#22c55e",
        },
        {
          label: "ไม่ผ่าน",
          data: chartData.inspectionsByType.map((t) => t.failed),
          backgroundColor: "#ef4444",
        },
      ],
    };
  }, [chartData]);

  // Line Chart: My Committee Monthly Issuance
  const myCommitteeLineChartData = useMemo(() => {
    if (
      !reportData?.myCommitteeStats?.monthlyIssuance ||
      reportData.myCommitteeStats.monthlyIssuance.length === 0
    ) {
      return {
        labels: ["ไม่มีข้อมูล"],
        datasets: [
          { data: [0], borderColor: "#d1d5db", backgroundColor: "#d1d5db" },
        ],
      };
    }
    return {
      labels: reportData.myCommitteeStats.monthlyIssuance.map((m) => m.month),
      datasets: [
        {
          label: "จำนวนใบรับรองที่ออก",
          data: reportData.myCommitteeStats.monthlyIssuance.map((m) => m.count),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.2)",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [reportData]);

  // ==================== useChart Hooks ====================
  const certificatePieRef = useChart({
    type: "pie",
    data: certificateChartData,
    options: {
      responsive: true,
      animation: false,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "สถานะใบรับรอง" },
      },
    },
  });

  const inspectionPieRef = useChart({
    type: "pie",
    data: inspectionResultChartData,
    options: {
      responsive: true,
      animation: false,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "ผลการตรวจประเมิน" },
      },
    },
  });

  const inspectionTypeBarRef = useChart({
    type: "bar",
    data: inspectionByTypeChartData,
    options: {
      responsive: true,
      animation: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "การตรวจประเมินตามประเภท" },
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true },
      },
    },
  });

  const myCommitteeLineRef = useChart({
    type: "line",
    data: myCommitteeLineChartData,
    options: {
      responsive: true,
      animation: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        title: {
          display: true,
          text: "แนวโน้มการออกใบรับรอง (12 เดือนล่าสุด)",
        },
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    },
  });

  // Export PDF handler
  const handleExportPDF = async () => {
    setShowExportDialog(false);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setExporting(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      let currentY = margin;
      let isFirstPage = true;

      // Helper function to add section to PDF
      const addSectionToPDF = async (ref: React.RefObject<HTMLDivElement>) => {
        if (!ref.current) return;

        const canvas = await html2canvas(ref.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (!isFirstPage && currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        if (!isFirstPage) {
          currentY += 5;
        }

        pdf.addImage(imgData, "PNG", margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight;
        isFirstPage = false;
      };

      // Create header
      const headerDiv = document.createElement("div");
      headerDiv.style.cssText =
        "position: absolute; left: -9999px; top: 0; background: white; padding: 20px; width: 800px; text-align: center; font-family: 'Sarabun', sans-serif;";

      let headerHTML = `<h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #1f2937;">รายงานสำหรับคณะกรรมการ</h1>`;

      headerHTML += `<p style="font-size: 12px; color: #6b7280;">วันที่ส่งออก: ${new Date().toLocaleDateString(
        "th-TH"
      )}</p>`;

      headerDiv.innerHTML = headerHTML;
      document.body.appendChild(headerDiv);

      const headerCanvas = await html2canvas(headerDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      document.body.removeChild(headerDiv);

      const headerImgData = headerCanvas.toDataURL("image/png");
      const headerImgWidth = pageWidth - margin * 2;
      const headerImgHeight =
        (headerCanvas.height * headerImgWidth) / headerCanvas.width;

      pdf.addImage(
        headerImgData,
        "PNG",
        margin,
        currentY,
        headerImgWidth,
        headerImgHeight
      );
      currentY += headerImgHeight + 5;
      isFirstPage = false;

      // Add selected sections
      if (exportSections.myCommitteeStats && myCommitteeStatsRef.current) {
        await addSectionToPDF(myCommitteeStatsRef);
      }
      if (exportSections.certificateStats && certificateStatsRef.current) {
        await addSectionToPDF(certificateStatsRef);
      }
      if (exportSections.expiryAlerts && expiryAlertsRef.current) {
        await addSectionToPDF(expiryAlertsRef);
      }
      if (exportSections.charts && chartsRef.current) {
        await addSectionToPDF(chartsRef);
      }
      if (exportSections.inspectionStats && inspectionStatsRef.current) {
        await addSectionToPDF(inspectionStatsRef);
      }

      // Download PDF
      const dateStr = new Date().toISOString().split("T")[0];
      pdf.save(`รายงานคณะกรรมการ_${dateStr}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("เกิดข้อผิดพลาดในการส่งออก PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <CommitteeLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-4">
            <h1 className="text-2xl font-bold text-gray-900">
              รายงานสำหรับคณะกรรมการ
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              ดูสรุปรายงานใบรับรอง การตรวจประเมิน และประสิทธิภาพผู้ตรวจประเมิน
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
                    myCommitteeStats: checked,
                    certificateStats: checked,
                    expiryAlerts: checked,
                    inspectionStats: checked,
                    charts: checked,
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
                inputId="export-my-stats"
                checked={exportSections.myCommitteeStats}
                onChange={(e) =>
                  setExportSections({
                    ...exportSections,
                    myCommitteeStats: e.checked ?? false,
                  })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-my-stats" className="cursor-pointer">
                รายงานประสิทธิภาพของฉัน
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-cert"
                checked={exportSections.certificateStats}
                onChange={(e) =>
                  setExportSections({
                    ...exportSections,
                    certificateStats: e.checked ?? false,
                  })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-cert" className="cursor-pointer">
                รายงานใบรับรอง
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-expiry"
                checked={exportSections.expiryAlerts}
                onChange={(e) =>
                  setExportSections({
                    ...exportSections,
                    expiryAlerts: e.checked ?? false,
                  })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-expiry" className="cursor-pointer">
                รายงานใบรับรองใกล้หมดอายุ
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-inspection"
                checked={exportSections.inspectionStats}
                onChange={(e) =>
                  setExportSections({
                    ...exportSections,
                    inspectionStats: e.checked ?? false,
                  })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-inspection" className="cursor-pointer">
                รายงานการตรวจประเมิน
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-charts"
                checked={exportSections.charts}
                onChange={(e) =>
                  setExportSections({
                    ...exportSections,
                    charts: e.checked ?? false,
                  })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-charts" className="cursor-pointer">
                แผนภูมิสรุปข้อมูล
              </label>
            </div>
          </div>
        </Dialog>

        {/* Global Date Filter Section */}
        <div className="flex flex-col bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-700 font-medium whitespace-nowrap">
                📅 ช่วงวันที่:
              </span>
              <Calendar
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
              * ช่วงวันที่จะกรองเฉพาะข้อมูลในส่วน &quot;กราฟสรุปข้อมูล&quot; และ
              &quot;สรุปการตรวจประเมิน&quot;
            </p>
            {chartLoading && (
              <span className="text-blue-600 text-sm animate-pulse">
                กำลังโหลดข้อมูลกราฟ...
              </span>
            )}
          </div>
        </div>

        {/* ==================== MY COMMITTEE STATS ==================== */}
        {reportData?.myCommitteeStats && (
          <div
            ref={myCommitteeStatsRef}
            className="mt-6 flex flex-col bg-white rounded-lg shadow p-6 border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  รายงานประสิทธิภาพของฉัน
                </h2>
                <p className="text-sm text-gray-600">
                  {reportData.myCommitteeStats.committeeName}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-blue-600">
                <p className="text-sm text-gray-600 mb-1 text-center">
                  ใบรับรองที่ออกทั้งหมด
                </p>
                {loading ? (
                  <p className="text-3xl font-bold text-gray-300">...</p>
                ) : (
                  <p className="text-3xl font-bold text-blue-600">
                    {reportData.myCommitteeStats.totalCertificatesIssued}
                  </p>
                )}
                <p className="text-xs text-gray-500">ใบ</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-green-500">
                <p className="text-sm text-gray-600 mb-1 text-center">
                  ออกเดือนนี้
                </p>
                {loading ? (
                  <p className="text-3xl font-bold text-gray-300">...</p>
                ) : (
                  <p className="text-3xl font-bold text-green-500">
                    {reportData.myCommitteeStats.certificatesThisMonth}
                  </p>
                )}
                <p className="text-xs text-gray-500">ใบ</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-purple-500">
                <p className="text-sm text-gray-600 mb-1 text-center">
                  ออกปีนี้
                </p>
                {loading ? (
                  <p className="text-3xl font-bold text-gray-300">...</p>
                ) : (
                  <p className="text-3xl font-bold text-purple-500">
                    {reportData.myCommitteeStats.certificatesThisYear}
                  </p>
                )}
                <p className="text-xs text-gray-500">ใบ</p>
              </div>
            </div>

            {/* Monthly Issuance Chart */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="h-64">
                <canvas ref={myCommitteeLineRef} />
              </div>
            </div>

            {/* Recent Certificates Table */}
            {reportData.myCommitteeStats.recentCertificates.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  ใบรับรองที่ออกล่าสุด
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          เลขที่
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ชื่อเกษตรกร
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ที่ตั้ง
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          จังหวัด
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          วันที่ออก
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          วันหมดอายุ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.myCommitteeStats.recentCertificates.map(
                        (cert) => (
                          <tr key={cert.certificateId}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {cert.certificateId}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {cert.farmerName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {cert.farmLocation}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {cert.province}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">
                              {new Date(cert.effectiveDate).toLocaleDateString(
                                "th-TH"
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">
                              {new Date(cert.expiryDate).toLocaleDateString(
                                "th-TH"
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== CERTIFICATE STATS ==================== */}
        <div
          ref={certificateStatsRef}
          className="mt-6 flex flex-col bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            รายงานใบรับรอง
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-blue-600">
              <p className="text-sm text-gray-600 mb-1 text-center">
                ใบรับรองทั้งหมด
              </p>
              {loading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-blue-600">
                  {reportData?.certificateStats.totalCertificates ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ใบ</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-green-500">
              <p className="text-sm text-gray-600 mb-1 text-center">
                ใช้งานอยู่
              </p>
              {loading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-green-500">
                  {reportData?.certificateStats.activeCertificates ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ใบ</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-gray-500">
              <p className="text-sm text-gray-600 mb-1 text-center">
                หมดอายุแล้ว
              </p>
              {loading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-gray-500">
                  {reportData?.certificateStats.expiredCertificates ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ใบ</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-orange-500">
              <p className="text-sm text-gray-600 mb-1 text-center">ขอยกเลิก</p>
              {loading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-orange-500">
                  {reportData?.certificateStats.cancelRequested ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ใบ</p>
            </div>
          </div>
        </div>

        {/* ==================== EXPIRY ALERTS ==================== */}
        <div
          ref={expiryAlertsRef}
          className="mt-6 flex flex-col bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            รายงานใบรับรองใกล้หมดอายุ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-700 font-medium">ใน 30 วัน</span>
                <span className="text-2xl font-bold text-red-600">
                  {reportData?.certificateExpiryAlerts.expiring30Days.length ??
                    0}
                </span>
              </div>
              <p className="text-xs text-red-600">ใบรับรอง</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-700 font-medium">ใน 60 วัน</span>
                <span className="text-2xl font-bold text-orange-600">
                  {reportData?.certificateExpiryAlerts.expiring60Days.length ??
                    0}
                </span>
              </div>
              <p className="text-xs text-orange-600">ใบรับรอง</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-700 font-medium">ใน 90 วัน</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {reportData?.certificateExpiryAlerts.expiring90Days.length ??
                    0}
                </span>
              </div>
              <p className="text-xs text-yellow-600">ใบรับรอง</p>
            </div>
          </div>

          {/* Expiring Certificates Table */}
          {(reportData?.certificateExpiryAlerts.expiring30Days.length ?? 0) >
            0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-red-700 mb-3">
                  ใบรับรองที่จะหมดอายุใน 30 วัน
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          เลขที่ใบรับรอง
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ชื่อเกษตรกร
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ที่ตั้ง
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          จังหวัด
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          เหลืออีก
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData?.certificateExpiryAlerts.expiring30Days.map(
                        (cert) => (
                          <tr key={cert.certificateId}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {cert.certificateId}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {cert.farmerName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {cert.farmLocation}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {cert.province}
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {cert.daysUntilExpiry} วัน
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>

        {/* ==================== CHARTS SECTION ==================== */}
        <div
          ref={chartsRef}
          className="mt-6 flex flex-col bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              แผนภูมิสรุปข้อมูล
            </h2>
            {dates && dates[0] && dates[1] && (
              <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                📅 {dates[0].toLocaleDateString("th-TH")} -{" "}
                {dates[1].toLocaleDateString("th-TH")}
              </span>
            )}
          </div>

          {chartLoading && (
            <div className="flex items-center justify-center py-4 mb-4">
              <span className="text-blue-600 animate-pulse">
                กำลังโหลดข้อมูล...
              </span>
            </div>
          )}

          {/* Pie Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Certificate Status Pie */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="w-full max-w-xs mx-auto">
                <canvas ref={certificatePieRef} />
              </div>
            </div>

            {/* Inspection Result Pie */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="w-full max-w-xs mx-auto">
                <canvas ref={inspectionPieRef} />
              </div>
            </div>
          </div>

          {/* Inspection by Type Bar Chart */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="h-64">
              <canvas ref={inspectionTypeBarRef} />
            </div>
          </div>
        </div>

        {/* ==================== INSPECTION STATS ==================== */}
        <div
          ref={inspectionStatsRef}
          className="mt-6 flex flex-col bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              สรุปการตรวจประเมิน
            </h2>
            {dates && dates[0] && dates[1] && (
              <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                📅 {dates[0].toLocaleDateString("th-TH")} -{" "}
                {dates[1].toLocaleDateString("th-TH")}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-blue-600">
              <p className="text-sm text-gray-600 mb-1 text-center">ทั้งหมด</p>
              {chartLoading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-blue-600">
                  {chartData?.inspectionStats?.totalInspections ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ครั้ง</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-green-500">
              <p className="text-sm text-gray-600 mb-1 text-center">ผ่าน</p>
              {chartLoading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-green-500">
                  {chartData?.inspectionStats?.passedInspections ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ครั้ง</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-red-500">
              <p className="text-sm text-gray-600 mb-1 text-center">ไม่ผ่าน</p>
              {chartLoading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-red-500">
                  {chartData?.inspectionStats?.failedInspections ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ครั้ง</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-yellow-500">
              <p className="text-sm text-gray-600 mb-1 text-center">
                รอดำเนินการ
              </p>
              {chartLoading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-yellow-500">
                  {chartData?.inspectionStats?.pendingInspections ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ครั้ง</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-purple-500">
              <p className="text-sm text-gray-600 mb-1 text-center">
                อัตราผ่าน
              </p>
              {chartLoading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-purple-500">
                  {chartData?.inspectionStats?.passRate ?? 0}%
                </p>
              )}
            </div>
          </div>

          {/* Inspections by Type Table */}
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              การตรวจประเมินตามประเภท
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ประเภท
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      ทั้งหมด
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      ผ่าน
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      ไม่ผ่าน
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      รอดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chartData?.inspectionsByType.map((type) => (
                    <tr key={type.typeId}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {type.typeName}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">
                        {type.count}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-green-600 font-medium">
                        {type.passed}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-red-600 font-medium">
                        {type.failed}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-yellow-600 font-medium">
                        {type.pending}
                      </td>
                    </tr>
                  ))}
                  {(!chartData?.inspectionsByType ||
                    chartData.inspectionsByType.length === 0) && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-3 text-sm text-center text-gray-500"
                        >
                          ไม่มีข้อมูล
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </CommitteeLayout>
  );
}
