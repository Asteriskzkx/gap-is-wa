"use client";

import CommitteeLayout from "@/components/layout/CommitteeLayout";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
}

interface InspectionByStatus {
  status: string;
  count: number;
}

interface AuditorPerformance {
  auditorId: number;
  auditorName: string;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  pendingInspections: number;
  passRate: number;
}

interface CommitteeReportSummary {
  certificateStats: CertificateStats;
  certificateExpiryAlerts: CertificateExpiryAlerts;
  inspectionStats: InspectionStats;
  inspectionsByType: InspectionByType[];
  inspectionsByStatus: InspectionByStatus[];
  auditorPerformances: AuditorPerformance[];
}

export default function CommitteeReportPage() {
  const [dates, setDates] = useState<(Date | null)[] | null>(null);
  const [reportData, setReportData] = useState<CommitteeReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Export PDF states
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportSections, setExportSections] = useState({
    certificateStats: true,
    expiryAlerts: true,
    inspectionStats: true,
    auditorPerformance: true,
  });
  const [exporting, setExporting] = useState(false);

  // Refs for export
  const certificateStatsRef = useRef<HTMLDivElement>(null);
  const expiryAlertsRef = useRef<HTMLDivElement>(null);
  const inspectionStatsRef = useRef<HTMLDivElement>(null);
  const auditorPerformanceRef = useRef<HTMLDivElement>(null);

  // Expiry alerts display counts
  const [expiry30DisplayCount, setExpiry30DisplayCount] = useState(5);
  const [expiry60DisplayCount, setExpiry60DisplayCount] = useState(5);
  const [expiry90DisplayCount, setExpiry90DisplayCount] = useState(5);

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
        const url = buildUrl("/api/v1/reports/committee");
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

      let headerHTML = `<h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #1f2937;">รายงานสำหรับคณะกรรมการ</h1>`;

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
      if (exportSections.certificateStats && certificateStatsRef.current) {
        await addSectionToPDF(certificateStatsRef);
      }
      if (exportSections.expiryAlerts && expiryAlertsRef.current) {
        await addSectionToPDF(expiryAlertsRef);
      }
      if (exportSections.inspectionStats && inspectionStatsRef.current) {
        await addSectionToPDF(inspectionStatsRef);
      }
      if (exportSections.auditorPerformance && auditorPerformanceRef.current) {
        await addSectionToPDF(auditorPerformanceRef);
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

  const getPassRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <CommitteeLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 flex flex-wrap items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">รายงานสำหรับคณะกรรมการ</h1>
            <p className="mt-1 text-sm text-gray-500">
              ดูสรุปรายงานใบรับรอง การตรวจประเมิน และประสิทธิภาพผู้ตรวจ
            </p>
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
                    certificateStats: checked,
                    expiryAlerts: checked,
                    inspectionStats: checked,
                    auditorPerformance: checked,
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
                inputId="export-cert"
                checked={exportSections.certificateStats}
                onChange={(e) =>
                  setExportSections({ ...exportSections, certificateStats: e.checked ?? false })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-cert" className="cursor-pointer">
                📜 รายงานใบรับรอง
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-expiry"
                checked={exportSections.expiryAlerts}
                onChange={(e) =>
                  setExportSections({ ...exportSections, expiryAlerts: e.checked ?? false })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-expiry" className="cursor-pointer">
                ⏰ แจ้งเตือนใบรับรองใกล้หมดอายุ
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-inspection"
                checked={exportSections.inspectionStats}
                onChange={(e) =>
                  setExportSections({ ...exportSections, inspectionStats: e.checked ?? false })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-inspection" className="cursor-pointer">
                📋 รายงานการตรวจประเมิน
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="export-auditor"
                checked={exportSections.auditorPerformance}
                onChange={(e) =>
                  setExportSections({ ...exportSections, auditorPerformance: e.checked ?? false })
                }
                className="border border-gray-300 rounded"
              />
              <label htmlFor="export-auditor" className="cursor-pointer">
                👤 รายงานประสิทธิภาพผู้ตรวจ
              </label>
            </div>
          </div>
        </Dialog>

        {/* Global Date Filter Section */}
        <div className="flex flex-col bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-nowrap">
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
            <p className="text-sm text-gray-500">
              * ช่วงวันที่จะกรองเฉพาะข้อมูลการตรวจประเมินและประสิทธิภาพผู้ตรวจ
            </p>
          </div>
        </div>

        {/* ==================== CERTIFICATE STATS ==================== */}
        <div ref={certificateStatsRef} className="mt-6 flex flex-col bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">📜 รายงานใบรับรอง</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-blue-600">
              <p className="text-sm text-gray-600 mb-1 text-center">ใบรับรองทั้งหมด</p>
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
              <p className="text-sm text-gray-600 mb-1 text-center">ใช้งานอยู่</p>
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
              <p className="text-sm text-gray-600 mb-1 text-center">หมดอายุแล้ว</p>
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
        <div ref={expiryAlertsRef} className="mt-8 flex flex-col bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            ⏰ แจ้งเตือนใบรับรองใกล้หมดอายุ
          </h2>

          <div className="space-y-8">
            {/* ===== ภายใน 30 วัน ===== */}
            <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                  🔴 ภายใน 30 วัน
                  <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">
                    {reportData?.certificateExpiryAlerts.expiring30Days.length ?? 0}
                  </span>
                </h3>
                {reportData && reportData.certificateExpiryAlerts.expiring30Days.length > 0 && (
                  <span className="text-sm text-gray-500">
                    แสดง {Math.min(expiry30DisplayCount, reportData.certificateExpiryAlerts.expiring30Days.length)} จาก{" "}
                    {reportData.certificateExpiryAlerts.expiring30Days.length} รายการ
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-red-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">รหัส</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">เกษตรกร</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">ที่ตั้งแปลง</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">จังหวัด</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">วันหมดอายุ</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">เหลืออีก</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-400">กำลังโหลด...</td></tr>
                    ) : (reportData?.certificateExpiryAlerts.expiring30Days.length ?? 0) === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-400">ไม่มีใบรับรองใกล้หมดอายุ</td></tr>
                    ) : (
                      reportData?.certificateExpiryAlerts.expiring30Days.slice(0, expiry30DisplayCount).map((cert, idx) => (
                        <tr key={cert.certificateId} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2 text-sm text-gray-900">#{cert.certificateId}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{cert.farmerName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{cert.farmLocation}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{cert.province}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-center">{new Date(cert.expiryDate).toLocaleDateString("th-TH")}</td>
                          <td className="px-4 py-2 text-sm text-center">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">{cert.daysUntilExpiry} วัน</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {reportData && reportData.certificateExpiryAlerts.expiring30Days.length > 5 && (
                <div className="flex justify-center gap-2 mt-3">
                  {expiry30DisplayCount < reportData.certificateExpiryAlerts.expiring30Days.length && (
                    <Button
                      label={`ดูเพิ่มเติม (${reportData.certificateExpiryAlerts.expiring30Days.length - expiry30DisplayCount} รายการ)`}
                      className="p-button-outlined p-button-sm p-button-danger"
                      icon="pi pi-chevron-down"
                      onClick={() => setExpiry30DisplayCount((prev) => Math.min(prev + 5, reportData.certificateExpiryAlerts.expiring30Days.length))}
                    />
                  )}
                  {expiry30DisplayCount > 5 && (
                    <Button label="แสดงน้อยลง" className="p-button-text p-button-sm" icon="pi pi-chevron-up" onClick={() => setExpiry30DisplayCount(5)} />
                  )}
                </div>
              )}
            </div>

            {/* ===== 31-60 วัน ===== */}
            <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-yellow-700 flex items-center gap-2">
                  🟡 31-60 วัน
                  <span className="bg-yellow-500 text-white text-sm px-2 py-0.5 rounded-full">
                    {reportData?.certificateExpiryAlerts.expiring60Days.length ?? 0}
                  </span>
                </h3>
                {reportData && reportData.certificateExpiryAlerts.expiring60Days.length > 0 && (
                  <span className="text-sm text-gray-500">
                    แสดง {Math.min(expiry60DisplayCount, reportData.certificateExpiryAlerts.expiring60Days.length)} จาก{" "}
                    {reportData.certificateExpiryAlerts.expiring60Days.length} รายการ
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-yellow-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">รหัส</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">เกษตรกร</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">ที่ตั้งแปลง</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">จังหวัด</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">วันหมดอายุ</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">เหลืออีก</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-400">กำลังโหลด...</td></tr>
                    ) : (reportData?.certificateExpiryAlerts.expiring60Days.length ?? 0) === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-400">ไม่มีใบรับรองใกล้หมดอายุ</td></tr>
                    ) : (
                      reportData?.certificateExpiryAlerts.expiring60Days.slice(0, expiry60DisplayCount).map((cert, idx) => (
                        <tr key={cert.certificateId} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2 text-sm text-gray-900">#{cert.certificateId}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{cert.farmerName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{cert.farmLocation}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{cert.province}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-center">{new Date(cert.expiryDate).toLocaleDateString("th-TH")}</td>
                          <td className="px-4 py-2 text-sm text-center">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">{cert.daysUntilExpiry} วัน</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {reportData && reportData.certificateExpiryAlerts.expiring60Days.length > 5 && (
                <div className="flex justify-center gap-2 mt-3">
                  {expiry60DisplayCount < reportData.certificateExpiryAlerts.expiring60Days.length && (
                    <Button
                      label={`ดูเพิ่มเติม (${reportData.certificateExpiryAlerts.expiring60Days.length - expiry60DisplayCount} รายการ)`}
                      className="p-button-outlined p-button-sm p-button-warning"
                      icon="pi pi-chevron-down"
                      onClick={() => setExpiry60DisplayCount((prev) => Math.min(prev + 5, reportData.certificateExpiryAlerts.expiring60Days.length))}
                    />
                  )}
                  {expiry60DisplayCount > 5 && (
                    <Button label="แสดงน้อยลง" className="p-button-text p-button-sm" icon="pi pi-chevron-up" onClick={() => setExpiry60DisplayCount(5)} />
                  )}
                </div>
              )}
            </div>

            {/* ===== 61-90 วัน ===== */}
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                  🔵 61-90 วัน
                  <span className="bg-blue-500 text-white text-sm px-2 py-0.5 rounded-full">
                    {reportData?.certificateExpiryAlerts.expiring90Days.length ?? 0}
                  </span>
                </h3>
                {reportData && reportData.certificateExpiryAlerts.expiring90Days.length > 0 && (
                  <span className="text-sm text-gray-500">
                    แสดง {Math.min(expiry90DisplayCount, reportData.certificateExpiryAlerts.expiring90Days.length)} จาก{" "}
                    {reportData.certificateExpiryAlerts.expiring90Days.length} รายการ
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">รหัส</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">เกษตรกร</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">ที่ตั้งแปลง</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">จังหวัด</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">วันหมดอายุ</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">เหลืออีก</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-400">กำลังโหลด...</td></tr>
                    ) : (reportData?.certificateExpiryAlerts.expiring90Days.length ?? 0) === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-400">ไม่มีใบรับรองใกล้หมดอายุ</td></tr>
                    ) : (
                      reportData?.certificateExpiryAlerts.expiring90Days.slice(0, expiry90DisplayCount).map((cert, idx) => (
                        <tr key={cert.certificateId} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-2 text-sm text-gray-900">#{cert.certificateId}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{cert.farmerName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{cert.farmLocation}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{cert.province}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-center">{new Date(cert.expiryDate).toLocaleDateString("th-TH")}</td>
                          <td className="px-4 py-2 text-sm text-center">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{cert.daysUntilExpiry} วัน</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {reportData && reportData.certificateExpiryAlerts.expiring90Days.length > 5 && (
                <div className="flex justify-center gap-2 mt-3">
                  {expiry90DisplayCount < reportData.certificateExpiryAlerts.expiring90Days.length && (
                    <Button
                      label={`ดูเพิ่มเติม (${reportData.certificateExpiryAlerts.expiring90Days.length - expiry90DisplayCount} รายการ)`}
                      className="p-button-outlined p-button-sm"
                      icon="pi pi-chevron-down"
                      onClick={() => setExpiry90DisplayCount((prev) => Math.min(prev + 5, reportData.certificateExpiryAlerts.expiring90Days.length))}
                    />
                  )}
                  {expiry90DisplayCount > 5 && (
                    <Button label="แสดงน้อยลง" className="p-button-text p-button-sm" icon="pi pi-chevron-up" onClick={() => setExpiry90DisplayCount(5)} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================== INSPECTION STATS ==================== */}
        <div ref={inspectionStatsRef} className="mt-8 flex flex-col bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 รายงานการตรวจประเมิน</h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-blue-600">
              <p className="text-sm text-gray-600 mb-1 text-center">ตรวจทั้งหมด</p>
              {loading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className="text-3xl font-bold text-blue-600">
                  {reportData?.inspectionStats.totalInspections ?? 0}
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
                  {reportData?.inspectionStats.passedInspections ?? 0}
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
                  {reportData?.inspectionStats.failedInspections ?? 0}
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
                  {reportData?.inspectionStats.pendingInspections ?? 0}
                </p>
              )}
              <p className="text-xs text-gray-500">ครั้ง</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center border-2 border-teal-600">
              <p className="text-sm text-gray-600 mb-1 text-center">อัตราผ่าน</p>
              {loading ? (
                <p className="text-3xl font-bold text-gray-300">...</p>
              ) : (
                <p className={`text-3xl font-bold ${getPassRateColor(reportData?.inspectionStats.passRate ?? 0)}`}>
                  {reportData?.inspectionStats.passRate ?? 0}%
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
              ) : reportData?.inspectionsByType.length === 0 ? (
                <p className="text-gray-400">ไม่มีข้อมูล</p>
              ) : (
                reportData?.inspectionsByType.map((type) => (
                  <div key={type.typeId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">{type.typeName}</p>
                    <p className="text-2xl font-bold text-gray-800 mb-2">
                      {type.count} <span className="text-sm font-normal">ครั้ง</span>
                    </p>
                    <div className="flex gap-3 text-sm">
                      <span className="text-green-600">✓ ผ่าน {type.passed}</span>
                      <span className="text-red-600">✗ ไม่ผ่าน {type.failed}</span>
                    </div>
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
              ) : reportData?.inspectionsByStatus.length === 0 ? (
                <p className="text-gray-400">ไม่มีข้อมูล</p>
              ) : (
                reportData?.inspectionsByStatus.map((status) => (
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

        {/* ==================== AUDITOR PERFORMANCE ==================== */}
        <div ref={auditorPerformanceRef} className="mt-8 flex flex-col bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">👤 รายงานประสิทธิภาพผู้ตรวจ</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    ผู้ตรวจ
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    ตรวจทั้งหมด
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    ผ่าน
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    ไม่ผ่าน
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    รอดำเนินการ
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    อัตราผ่าน
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
                ) : reportData?.auditorPerformances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 text-center text-gray-400">
                      ไม่มีข้อมูลผู้ตรวจ
                    </td>
                  </tr>
                ) : (
                  reportData?.auditorPerformances.map((auditor, idx) => (
                    <tr key={auditor.auditorId} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                        {auditor.auditorName}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-center">
                        {auditor.totalInspections}
                      </td>
                      <td className="px-4 py-2 text-sm text-green-600 text-center font-medium">
                        {auditor.passedInspections}
                      </td>
                      <td className="px-4 py-2 text-sm text-red-600 text-center font-medium">
                        {auditor.failedInspections}
                      </td>
                      <td className="px-4 py-2 text-sm text-yellow-600 text-center font-medium">
                        {auditor.pendingInspections}
                      </td>
                      <td className="px-4 py-2 text-sm text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            auditor.passRate >= 80
                              ? "bg-green-100 text-green-800"
                              : auditor.passRate >= 50
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {auditor.passRate}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Average Pass Rate */}
          {reportData && reportData.auditorPerformances.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  อัตราการผ่านเฉลี่ยของผู้ตรวจทั้งหมด
                </span>
                <span
                  className={`text-2xl font-bold ${getPassRateColor(
                    Math.round(
                      reportData.auditorPerformances.reduce((sum, a) => sum + a.passRate, 0) /
                        reportData.auditorPerformances.length
                    )
                  )}`}
                >
                  {Math.round(
                    reportData.auditorPerformances.reduce((sum, a) => sum + a.passRate, 0) /
                      reportData.auditorPerformances.length
                  )}
                  %
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </CommitteeLayout>
  );
}