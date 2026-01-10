"use client";

import AuditorLayout from "@/components/layout/AuditorLayout";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Interfaces
interface MyInspectionStats {
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
}

interface InspectionByStatus {
  status: string;
  count: number;
}

interface RecentInspection {
  id: number;
  farmerName: string;
  farmLocation: string;
  province: string;
  inspectionDate: string;
  result: string | null;
  status: string;
}

interface InspectedFarm {
  rubberFarmId: number;
  farmLocation: string;
  province: string;
  farmerName: string;
  lastInspectionDate: string;
  lastResult: string | null;
  totalInspections: number;
}

interface AuditorReportSummary {
  stats: MyInspectionStats;
  byType: InspectionByType[];
  byStatus: InspectionByStatus[];
  recentInspections: RecentInspection[];
  inspectedFarms: InspectedFarm[];
}

export default function AuditorReportPage() {
  const [dates, setDates] = useState<(Date | null)[] | null>(null);
  const [reportData, setReportData] = useState<AuditorReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Export PDF states
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportSections, setExportSections] = useState({
    stats: true,
    recentInspections: true,
    inspectedFarms: true,
  });
  const [exporting, setExporting] = useState(false);

  // Refs for export
  const statsRef = useRef<HTMLDivElement>(null);
  const recentInspectionsRef = useRef<HTMLDivElement>(null);
  const inspectedFarmsRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [farmsDisplayCount, setFarmsDisplayCount] = useState(5);

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

  // Fetch report data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = buildUrl("/api/v1/reports/auditor/my-report");
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dates]);

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

      let headerHTML = `<h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #1f2937;">รายงานสถิติการตรวจของฉัน</h1>`;

      if (dates && dates[0] && dates[1]) {
        headerHTML += `<p style="font-size: 14px; color: #4b5563; margin-bottom: 5px;">ช่วงวันที่: ${dates[0].toLocaleDateString("th-TH")} - ${dates[1].toLocaleDateString("th-TH")}</p>`;
      }

      headerHTML += `<p style="font-size: 12px; color: #6b7280;">วันที่ส่งออก: ${new Date().toLocaleDateString("th-TH")}</p>`;

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
      const headerImgHeight = (headerCanvas.height * headerImgWidth) / headerCanvas.width;

      pdf.addImage(headerImgData, "PNG", margin, currentY, headerImgWidth, headerImgHeight);
      currentY += headerImgHeight + 5;
      isFirstPage = false;

      // Add selected sections
      if (exportSections.stats && statsRef.current) {
        await addSectionToPDF(statsRef);
      }
      if (exportSections.recentInspections && recentInspectionsRef.current) {
        await addSectionToPDF(recentInspectionsRef);
      }
      if (exportSections.inspectedFarms && inspectedFarmsRef.current) {
        await addSectionToPDF(inspectedFarmsRef);
      }

      // Download PDF
      const dateStr = new Date().toISOString().split("T")[0];
      pdf.save(`รายงานการตรวจ_${dateStr}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("เกิดข้อผิดพลาดในการส่งออก PDF");
    } finally {
      setExporting(false);
    }
  };

  const getResultBadge = (result: string | null) => {
    if (!result || result === "") return <span className="text-gray-400">รอผล</span>;
    if (result === "ผ่าน" || result === "PASSED") {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          ผ่าน
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
        ไม่ผ่าน
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      รอการตรวจประเมิน: "bg-yellow-100 text-yellow-800",
      ตรวจประเมินแล้ว: "bg-green-100 text-green-800",
      รอผลการตรวจ: "bg-blue-100 text-blue-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <AuditorLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 flex flex-wrap items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">รายงานสถิติการตรวจ</h1>
            <p className="mt-1 text-sm text-gray-500">ดูสรุปผลการตรวจประเมินของคุณ</p>
          </div>
          <Button
            label="ส่งออก PDF"
            icon="pi pi-file-pdf"
            className="p-button-success p-2"
            onClick={() => setShowExportDialog(true)}
          />
        </div>

        {/* Export PDF Dialog */}
        <Dialog
          header="เลือกรายงานที่ต้องการส่งออก"
          visible={showExportDialog}
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
                disabled={exporting || !Object.values(exportSections).some(Boolean)}
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
                    stats: checked,
                    recentInspections: checked,
                    inspectedFarms: checked,
                  });
                }}
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-all" className="cursor-pointer font-medium">
                ✅ เลือกทั้งหมด
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-stats"
                checked={exportSections.stats}
                onChange={(e) => setExportSections({ ...exportSections, stats: e.checked ?? false })}
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-stats" className="cursor-pointer">
                รายงานประสิทธิภาพของฉัน
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-recent"
                checked={exportSections.recentInspections}
                onChange={(e) =>
                  setExportSections({ ...exportSections, recentInspections: e.checked ?? false })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-recent" className="cursor-pointer">
                รายงานการตรวจล่าสุด
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-farms"
                checked={exportSections.inspectedFarms}
                onChange={(e) =>
                  setExportSections({ ...exportSections, inspectedFarms: e.checked ?? false })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-farms" className="cursor-pointer">
                รายงานแปลงที่ตรวจแล้ว
              </label>
            </div>
          </div>
        </Dialog>

        {/* Global Date Filter Section */}
        <div className="flex flex-col bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-700 font-medium whitespace-nowrap">📅 ช่วงวันที่:</span>
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
            <p className="text-sm text-gray-500">* เลือกช่วงวันที่เพื่อกรองข้อมูล</p>
          </div>
        </div>

        {/* ==================== MY PERFORMANCE SUMMARY ==================== */}
        <div ref={statsRef} className="mt-6 flex flex-col bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">รายงานประสิทธิภาพของฉัน</h2>

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-blue-600">
              <p className="text-sm text-gray-600 mb-1 text-center">ตรวจทั้งหมด</p>
              {loading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-blue-600">
                  {reportData?.stats.totalInspections ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ครั้ง</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-green-500">
              <p className="text-sm text-gray-600 mb-1 text-center">ผ่าน</p>
              {loading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-green-500">
                  {reportData?.stats.passedInspections ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ครั้ง</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-red-500">
              <p className="text-sm text-gray-600 mb-1 text-center">ไม่ผ่าน</p>
              {loading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-red-500">
                  {reportData?.stats.failedInspections ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ครั้ง</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-yellow-500">
              <p className="text-sm text-gray-600 mb-1 text-center">รอดำเนินการ</p>
              {loading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-yellow-500">
                  {reportData?.stats.pendingInspections ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ครั้ง</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-teal-600">
              <p className="text-sm text-gray-600 mb-1 text-center">อัตราผ่าน</p>
              {loading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p
                  className={`text-3xl font-bold ${
                    (reportData?.stats.passRate ?? 0) >= 80
                      ? "text-green-600"
                      : (reportData?.stats.passRate ?? 0) >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {reportData?.stats.passRate ?? 0}%
                </p>
              )}
            </div>
          </div>

          {/* By Type */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">แยกตามประเภทการตรวจ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loading ? (
                <p className="text-gray-400">กำลังโหลด...</p>
              ) : reportData?.byType.length === 0 ? (
                <p className="text-gray-400">ไม่มีข้อมูล</p>
              ) : (
                reportData?.byType.map((type) => (
                  <div key={type.typeId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">{type.typeName}</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {type.count} <span className="text-sm font-normal">ครั้ง</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* By Status */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">แยกตามสถานะ</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? (
                <p className="text-gray-400">กำลังโหลด...</p>
              ) : reportData?.byStatus.length === 0 ? (
                <p className="text-gray-400">ไม่มีข้อมูล</p>
              ) : (
                reportData?.byStatus.map((status) => (
                  <div
                    key={status.status}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center"
                  >
                    <p className="text-xs text-gray-500">{status.status}</p>
                    <p className="text-xl font-bold text-gray-700">{status.count}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ==================== RECENT INSPECTIONS ==================== */}
        <div ref={recentInspectionsRef} className="mt-8 flex flex-col bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">รายงานการตรวจล่าสุด</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    วันที่ตรวจ
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    เกษตรกร
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    ที่ตั้งแปลง
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    จังหวัด
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    สถานะ
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    ผลการตรวจ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-gray-400">
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : reportData?.recentInspections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-gray-400">
                      ไม่มีข้อมูลการตรวจ
                    </td>
                  </tr>
                ) : (
                  reportData?.recentInspections.map((inspection, idx) => (
                    <tr key={inspection.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {new Date(inspection.inspectionDate).toLocaleDateString("th-TH")}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{inspection.farmerName}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{inspection.farmLocation}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{inspection.province}</td>
                      <td className="px-4 py-2 text-sm text-center">
                        {getStatusBadge(inspection.status)}
                      </td>
                      <td className="px-4 py-2 text-sm text-center">
                        {getResultBadge(inspection.result)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================== INSPECTED FARMS ==================== */}
        <div ref={inspectedFarmsRef} className="mt-8 flex flex-col bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">รายงานแปลงที่ตรวจแล้ว</h2>
            {reportData && reportData.inspectedFarms.length > 0 && (
              <span className="text-sm text-gray-500">
                แสดง {Math.min(farmsDisplayCount, reportData.inspectedFarms.length)} จาก{" "}
                {reportData.inspectedFarms.length} แปลง
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    เกษตรกร
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    ที่ตั้งแปลง
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    จังหวัด
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    จำนวนตรวจ
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    ตรวจล่าสุด
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    ผลล่าสุด
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-gray-400">
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : reportData?.inspectedFarms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-gray-400">
                      ไม่มีข้อมูลแปลง
                    </td>
                  </tr>
                ) : (
                  reportData?.inspectedFarms.slice(0, farmsDisplayCount).map((farm, idx) => (
                    <tr key={farm.rubberFarmId} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 text-sm text-gray-900">{farm.farmerName}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{farm.farmLocation}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{farm.province}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-center">
                        {farm.totalInspections}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-center">
                        {new Date(farm.lastInspectionDate).toLocaleDateString("th-TH")}
                      </td>
                      <td className="px-4 py-2 text-sm text-center">
                        {getResultBadge(farm.lastResult)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Show More / Show Less Buttons */}
          {reportData && reportData.inspectedFarms.length > 5 && (
            <div className="flex justify-center gap-2 mt-4">
              {farmsDisplayCount < reportData.inspectedFarms.length && (
                <Button
                  label={`ดูเพิ่มเติม (${reportData.inspectedFarms.length - farmsDisplayCount} แปลง)`}
                  className="p-button-outlined p-button-sm"
                  icon="pi pi-chevron-down"
                  onClick={() =>
                    setFarmsDisplayCount((prev) =>
                      Math.min(prev + 5, reportData.inspectedFarms.length)
                    )
                  }
                />
              )}
              {farmsDisplayCount > 5 && (
                <Button
                  label="แสดงน้อยลง"
                  className="p-button-text p-button-sm"
                  icon="pi pi-chevron-up"
                  onClick={() => setFarmsDisplayCount(5)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </AuditorLayout>
  );
}