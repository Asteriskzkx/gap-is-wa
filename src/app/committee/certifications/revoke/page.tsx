"use client";

import CertificationStepIndicator from "@/components/committee/certifications/CertificationStepIndicator";
import CommitteeLayout from "@/components/layout/CommitteeLayout";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import PrimaryInputTextarea from "@/components/ui/PrimaryInputTextarea";
import { useFormStepper } from "@/hooks/useFormStepper";
import { useRevokeCertificate } from "@/hooks/useRevokeCertificate";
import { CONTAINER, HEADER, SPACING } from "@/styles/auditorClasses";
import { useMemo, useState } from "react";

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
    revokeCertificate,
    currentTab,
    onTabChange,
    pdfUrl,
    isShowPdf,
    closePdf,
  } = useRevokeCertificate(10);

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
        style: { width: "30%" },
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
      {
        field: "actions",
        header: "",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        mobileAlign: "right" as const,
        mobileHideLabel: true,
        body: (r: any) => (
          <div className="flex justify-center gap-2">
            <PrimaryButton
              icon="pi pi-eye"
              color="info"
              onClick={() => openFiles?.(r.certificateId)}
              rounded
              text
            />
          </div>
        ),
        style: { width: "10%" },
      },
    ],
    [openFiles]
  );

  return (
    <CommitteeLayout>
      <div className={CONTAINER.page}>
        {!isShowPdf ? (
          <>
            <div className={SPACING.mb8}>
              <h1 className={HEADER.title}>ยกเลิกใบรับรองแหล่งผลิตจีเอพี</h1>
              <p className={HEADER.subtitle}>
                ยกเลิกใบรับรองแหล่งผลิตยางพาราที่มีคำขอยกเลิก
              </p>
            </div>

            <div className={SPACING.mb6}>
              <CertificationStepIndicator
                currentStep={step}
                labels={["เลือกใบรับรอง", "ยกเลิกใบรับรอง"]}
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
                            ตั้งแต่
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
                            ถึง
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
                        label="ใบรับรองที่มีคำขอยกเลิก"
                        fullWidth
                        color={
                          currentTab === "revocation-requests"
                            ? "success"
                            : "secondary"
                        }
                        onClick={() => handleTabChange("true")}
                      />
                      <PrimaryButton
                        label="ใบรับรองที่ไม่มีคำขอยกเลิก"
                        fullWidth
                        color={currentTab === "other" ? "success" : "secondary"}
                        onClick={() => handleTabChange("false")}
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
                      onRowClick={(e) => setSelectedCertificate(e.data)}
                    />

                    <div className="mt-4 flex justify-end gap-2">
                      <PrimaryButton
                        label="ถัดไป"
                        onClick={() => {
                          if (selectedCertificate) nextStep();
                        }}
                        disabled={!selectedCertificate}
                      />
                    </div>
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
                        value={selectedCertificate?.cancelRequestDetail ?? ""}
                        onChange={(v: string) => { }}
                        disabled={true}
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
                        label="ยืนยันยกเลิกใบรับรอง"
                        color="success"
                        onClick={async () => {
                          if (!selectedCertificate) return;
                          const ok = await revokeCertificate(
                            selectedCertificate.certificateId,
                            selectedCertificate?.cancelRequestDetail ??
                            cancelRequestDetail,
                            selectedCertificate.version
                          );
                          if (ok) {
                            setSelectedCertificate(null);
                            setCancelRequestDetail("");
                            prevStep();
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col gap-4">
            <div>
              <PrimaryButton
                label="ย้อนกลับ"
                icon="pi pi-arrow-left"
                color="secondary"
                onClick={closePdf}
              />
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
    </CommitteeLayout >
  );
}
