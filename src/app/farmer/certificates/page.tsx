"use client";

import FarmerLayout from "@/components/layout/FarmerLayout";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import { useFarmerCertificates } from "@/hooks/useFarmerCertificates";
import { CONTAINER, HEADER, SPACING } from "@/styles/auditorClasses";
import { useEffect, useMemo } from "react";

let _openFiles: ((id: number) => any) | null = null;

const ActionButtons = ({ row, onOpen }: { row: any; onOpen: () => void }) => {
  return (
    <div className="flex justify-center gap-2">
      <PrimaryButton
        icon="pi pi-eye"
        color="info"
        onClick={onOpen}
        rounded
        text
      />
    </div>
  );
};

function actionBody(row: any) {
  return (
    <ActionButtons row={row} onOpen={() => _openFiles?.(row.certificateId)} />
  );
}

function statusBody(row: any) {
  const active = !!row.activeFlag;
  const cancelReq = !!row.cancelRequestFlag;

  let text = "-";
  if (cancelReq && active) text = "ยื่นขอยกเลิกแล้ว";
  else if (cancelReq && !active) text = "ยกเลิกใบรับรองแล้ว";

  return <div>{text}</div>;
}

export default function Page() {
  const {
    items,
    loading,
    totalRecords,
    lazyParams,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    applyFilters,
    clearFilters,
    handlePageChange,
    handleSort,
    openFiles,
    currentTab,
    onTabChange,
    pdfUrl,
    pdfFileName,
    isShowPdf,
    closePdf,
  } = useFarmerCertificates(10);

  useEffect(() => {
    _openFiles = openFiles;
    return () => {
      _openFiles = null;
    };
  }, [openFiles]);

  const columns = useMemo(
    () => [
      {
        field: "certificateId",
        header: "รหัสใบรับรอง",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        style: { width: "12%" },
      },
      {
        field: "inspection?.inspectionNo",
        header: "รหัสการตรวจ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (r: any) => r.inspection?.inspectionNo || "-",
        style: { width: "12%" },
      },
      {
        field: "inspection?.inspectionDateAndTime",
        header: "วันที่ตรวจ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (r: any) =>
          r.inspection?.inspectionDateAndTime
            ? new Date(r.inspection.inspectionDateAndTime).toLocaleString(
              "th-TH",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            )
            : "-",
        style: { width: "12%" },
      },
      {
        field: "inspection?.rubberFarm?.villageName",
        header: "สถานที่",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (r: any) =>
          [
            r.inspection?.rubberFarm?.villageName,
            r.inspection?.rubberFarm?.subDistrict,
            r.inspection?.rubberFarm?.district,
            r.inspection?.rubberFarm?.province,
          ]
            .filter(Boolean)
            .join(" ") || "-",
        style: { width: "25%" },
      },
      {
        field: "effectiveDate",
        header: "วันที่มีผล",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (r: any) =>
          r.effectiveDate
            ? new Date(r.effectiveDate).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            : "-",
        style: { width: "12%" },
      },
      {
        field: "expiryDate",
        header: "วันที่หมดอายุ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (r: any) =>
          r.expiryDate
            ? new Date(r.expiryDate).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            : "-",
        style: { width: "12%" },
      },
      currentTab === "cancel-request"
        ? {
          field: "status",
          header: "สถานะ",
          sortable: false,
          headerAlign: "center" as const,
          bodyAlign: "center" as const,
          body: statusBody,
          style: { width: "15%" },
        }
        : {
          field: "actions",
          header: "",
          sortable: false,
          headerAlign: "center" as const,
          bodyAlign: "center" as const,
          mobileAlign: "right" as const,
          mobileHideLabel: true,
          body: actionBody,
          style: { width: "15%" },
        },
    ],
    [currentTab]
  );

  return (
    <FarmerLayout>
      <div className={CONTAINER.page}>
        {!isShowPdf ? (
          <>
            <div className={SPACING.mb8}>
              <h1 className={HEADER.title}>ใบรับรองแหล่งผลิตที่ได้รับ</h1>
              <p className={HEADER.subtitle}>
                รายละเอียดใบรับรองแหล่งผลิตที่ได้รับทั้งหมด
              </p>
            </div>

            <div className={CONTAINER.card}>
              <div className={CONTAINER.cardPadding}>
                <div className={SPACING.mb6}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <div className="w-full sm:w-full">
                      <div>
                        <label
                          htmlFor="fromDate"
                          className="block text-sm text-gray-600 mb-1"
                        >
                          วันที่มีผล (จาก)
                        </label>
                        <PrimaryCalendar
                          id="fromDate"
                          value={fromDate}
                          onChange={(d) => setFromDate(d)}
                          placeholder="เลือกวันที่มีผล"
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-full">
                      <div>
                        <label
                          htmlFor="toDate"
                          className="block text-sm text-gray-600 mb-1"
                        >
                          วันที่หมดอายุ (ถึง)
                        </label>
                        <PrimaryCalendar
                          id="toDate"
                          value={toDate}
                          onChange={(d) => setToDate(d)}
                          placeholder="เลือกวันที่หมดอายุ"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="justify-self-end">
                      <PrimaryButton
                        label="ค้นหา"
                        icon="pi pi-search"
                        onClick={() => applyFilters()}
                      />
                    </div>
                    <div>
                      <PrimaryButton
                        label="ล้างค่า"
                        color="secondary"
                        icon="pi pi-refresh"
                        onClick={() => clearFilters()}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between gap-3">
                    <PrimaryButton
                      label="ใบรับรองทั้งหมด"
                      fullWidth
                      color={currentTab === "in-use" ? "success" : "secondary"}
                      onClick={() => onTabChange("cancelRequestFlag", "false")}
                    />
                    <PrimaryButton
                      label="ใบรับรองที่ยกเลิกแล้ว"
                      fullWidth
                      color={
                        currentTab === "cancel-request" ? "success" : "secondary"
                      }
                      onClick={() => onTabChange("cancelRequestFlag", "true")}
                    />
                  </div>
                </div>

                <PrimaryDataTable
                  value={items}
                  columns={columns}
                  loading={loading}
                  paginator
                  rows={lazyParams.rows}
                  rowsPerPageOptions={[10, 25, 50]}
                  totalRecords={totalRecords}
                  lazy
                  onPage={handlePageChange}
                  first={lazyParams.first}
                  sortMode="multiple"
                  multiSortMeta={lazyParams.multiSortMeta}
                  onSort={handleSort}
                  dataKey="certificateId"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-center">
              <div>
                <PrimaryButton
                  label="ย้อนกลับ"
                  icon="pi pi-arrow-left"
                  color="secondary"
                  onClick={closePdf}
                />
              </div>
              <div className="text-xl font-bold text-gray-700 break-words">
                {pdfFileName}
              </div>
            </div>
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                className="w-full h-[80vh] border-0 rounded-lg shadow-sm bg-white"
                title="PDF Viewer"
              />
            )}
          </div>
        )}
      </div>
    </FarmerLayout>
  );
}
