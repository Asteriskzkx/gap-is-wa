"use client";

import { StepIndicator } from "@/components/farmer/StepIndicator";
import FarmerLayout from "@/components/layout/FarmerLayout";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import PrimaryInputTextarea from "@/components/ui/PrimaryInputTextarea";
import { useFarmerCancelCertificates } from "@/hooks/useFarmerCancelCertificates";
import { useFormStepper } from "@/hooks/useFormStepper";
import { CONTAINER, HEADER, SPACING } from "@/styles/auditorClasses";
import { useEffect, useMemo, useState } from "react";

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
    editCancelRequestDetail,
    currentTab,
    onTabChange,
  } = useFarmerCancelCertificates(10);

  const [selectedCertificate, setSelectedCertificate] = useState<Record<
    string,
    any
  > | null>(null);
  const [cancelRequestDetail, setCancelRequestDetail] = useState<string>("");

  const { step, nextStep, prevStep } = useFormStepper(2);

  const handleTabChange = (value: string) => {
    onTabChange("cancelRequestFlag", value);
    // clear any selected certificate when switching tabs
    setSelectedCertificate(null);
    setCancelRequestDetail("");
  };

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
        <div className={SPACING.mb8}>
          <h1 className={HEADER.title}>ขอยกเลิกใบรับรองแหล่งผลิต</h1>
          <p className={HEADER.subtitle}>
            ขอยกเลิกใบรับรองแหล่งผลิตที่ไม่ประสงค์จะรับรองต่อ
          </p>
        </div>

        <div className={SPACING.mb6}>
          <StepIndicator
            currentStep={step}
            maxSteps={2}
            stepLabels={["เลือกใบรับรอง", "ขอยกเลิกใบรับรอง"]}
          />
        </div>

        <div className={CONTAINER.card}>
          <div className={CONTAINER.cardPadding}>
            {step === 1 && (
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
                    onClick={() => handleTabChange("false")}
                  />
                  <PrimaryButton
                    label="ใบรับรองที่ขอยกเลิก"
                    fullWidth
                    color={
                      currentTab === "cancel-request" ? "success" : "secondary"
                    }
                    onClick={() => handleTabChange("true")}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
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
                  rowClassName={(data: any) =>
                    selectedCertificate?.certificateId === data.certificateId
                      ? "bg-green-50 cursor-pointer"
                      : "cursor-pointer"
                  }
                  onRowClick={(e) => {
                    setSelectedCertificate(e.data);
                  }}
                />

                {currentTab !== "cancel-request" && (
                  <div className="mt-4 flex justify-end gap-2">
                    <PrimaryButton
                      label="ถัดไป"
                      onClick={() => {
                        if (selectedCertificate) {
                          setCancelRequestDetail(
                            selectedCertificate?.cancelRequestDetail ?? ""
                          );
                          nextStep();
                        }
                      }}
                      disabled={!selectedCertificate}
                    />
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="mb-4">
                  <label
                    htmlFor="cancelRequestDetail"
                    className="block text-sm text-gray-600 mb-1"
                  >
                    รายละเอียดคำขอยกเลิกใบรับรอง
                  </label>
                  <PrimaryInputTextarea
                    id="cancelRequestDetail"
                    value={cancelRequestDetail}
                    onChange={(v: string) => setCancelRequestDetail(v)}
                    rows={5}
                    maxLength={255}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="flex justify-between gap-2">
                  <PrimaryButton
                    label="ย้อนกลับ"
                    color="secondary"
                    onClick={() => prevStep()}
                  />
                  <PrimaryButton
                    label="บันทึกคำขอยกเลิก"
                    color="success"
                    onClick={async () => {
                      if (!selectedCertificate) return;
                      const ok = await editCancelRequestDetail(
                        selectedCertificate.certificateId,
                        cancelRequestDetail,
                        selectedCertificate.version
                      );
                      if (ok) {
                        setSelectedCertificate(null);
                        setCancelRequestDetail("");
                        prevStep();
                      }
                    }}
                    disabled={cancelRequestDetail.trim() === ""}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}
