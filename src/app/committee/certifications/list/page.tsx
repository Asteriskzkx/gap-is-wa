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
  } = useAlreadyIssuedCertificates(10);

  const columns = useMemo(
    () => [
      {
        field: "certificateId",
        header: "รหัสใบรับรอง",
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        style: { width: "12%" },
      },
      {
        field: "inspection?.inspectionNo",
        header: "รหัสการตรวจ",
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (r: any) => r.inspection?.inspectionNo || "-",
        style: { width: "14%" },
      },
      {
        field: "inspection?.rubberFarm?.villageName",
        header: "สถานที่",
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
        style: { width: "34%" },
      },
      {
        field: "effectiveDate",
        header: "วันที่มีผล",
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
        style: { width: "16%" },
      },
      {
        field: "expiryDate",
        header: "วันที่หมดอายุ",
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
        style: { width: "16%" },
      },
    ],
    []
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
