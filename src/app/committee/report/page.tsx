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
                เลือกทั้งหมด
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
                รายงานใบรับรอง
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
                แจ้งเตือนใบรับรองใกล้หมดอายุ
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
                รายงานการตรวจประเมิน
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
                รายงานประสิทธิภาพผู้ตรวจ
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">รายงานใบรับรอง</h2>

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

        
      </div>
    </CommitteeLayout>
  );
}