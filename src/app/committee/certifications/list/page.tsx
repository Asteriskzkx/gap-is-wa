"use client";

import CommitteeLayout from "@/components/layout/CommitteeLayout";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import { useAlreadyIssuedCertificates } from "@/hooks/useAlreadyIssuedCertificates";
import { CONTAINER, HEADER, SPACING } from "@/styles/auditorClasses";
import { useMemo } from "react";

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
  } = useAlreadyIssuedCertificates(10);

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
          new Date(r.inspection?.inspectionDateAndTime).toLocaleString(
            "th-TH",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          ),
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
        <div className={SPACING.mb8}>
          <h1 className={HEADER.title}>ใบรับรองแหล่งผลิตจีเอพีในระบบ</h1>
          <p className={HEADER.subtitle}>
            ใบรับรองแหล่งผลิตยางพาราที่อยู่ในระบบทั้งหมด
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
                    onClick={() => {
                      applyFilters();
                    }}
                  />
                </div>
                <div>
                  <PrimaryButton
                    label="ล้างค่า"
                    color="secondary"
                    icon="pi pi-refresh"
                    onClick={() => {
                      clearFilters();
                    }}
                  />
                </div>
              </div>
            </div>

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
              />
            </div>
          </div>
        </div>
      </div>
    </CommitteeLayout>
  );
}
