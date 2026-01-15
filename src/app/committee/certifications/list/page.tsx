"use client";

import CommitteeLayout from "@/components/layout/CommitteeLayout";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import { useAlreadyIssuedCertificates } from "@/hooks/useAlreadyIssuedCertificates";
import { CONTAINER, HEADER, SPACING } from "@/styles/auditorClasses";
import { useCallback, useMemo } from "react";

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
  } = useAlreadyIssuedCertificates(10);

  const renderActions = useCallback(
    (r: any) => (
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
    [openFiles]
  );

  const columns = useMemo(() => {
    const cols: any[] = [
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
        body: (r: any) => {
          const f = r.inspection?.rubberFarm;
          const v = (val: any) =>
            (val || val === 0) && val !== "-" && val !== "" ? val : null;
          return (
            <span>
              {[
                v(f?.villageName),
                v(f?.moo) ? `หมู่ ${f.moo}` : null,
                v(f?.road),
                v(f?.alley),
                v(f?.subDistrict) ? `ต.${f.subDistrict}` : null,
                v(f?.district) ? `อ.${f.district}` : null,
                v(f?.province) ? `จ.${f.province}` : null,
              ]
                .filter(Boolean)
                .join(" ") || "-"}
            </span>
          );
        },
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
    ];

    if (currentTab === "in-use") {
      cols.push({
        field: "actions",
        header: "",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        mobileAlign: "right" as const,
        mobileHideLabel: true,
        body: renderActions,
        style: { width: "10%" },
      });
    }

    return cols;
  }, [renderActions, currentTab]);

  return (
    <CommitteeLayout>
      <div className={CONTAINER.page}>
        {!isShowPdf ? (
          <>
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

                  <div className="mt-3 flex justify-between gap-3">
                    <PrimaryButton
                      label="ใบรับรองที่ใช้งานอยู่"
                      fullWidth
                      color={currentTab === "in-use" ? "success" : "secondary"}
                      onClick={() => onTabChange("activeFlag", "true")}
                    />
                    <PrimaryButton
                      label="ใบรับรองที่ยกเลิกแล้ว"
                      fullWidth
                      color={currentTab === "not-in-use" ? "success" : "secondary"}
                      onClick={() => onTabChange("activeFlag", "false")}
                    />
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
    </CommitteeLayout >
  );
}
