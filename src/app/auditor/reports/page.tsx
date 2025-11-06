"use client";

import AuditorLayout from "@/components/layout/AuditorLayout";
import {
  PrimaryButton,
  PrimaryDataTable,
  PrimaryInputText,
} from "@/components/ui";
import { useInspectionReports } from "@/hooks/useInspectionReports";
import {
  BADGE,
  CONTAINER,
  FLEX,
  FORM,
  HEADER,
  SPACING,
  SPINNER,
} from "@/styles/auditorClasses";
import { useMemo } from "react";

interface Inspection {
  inspectionId: number;
  inspectionNo: number;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  auditorChiefId: number;
  rubberFarmId: number;
  rubberFarm?: {
    villageName: string;
    district: string;
    province: string;
    farmer?: {
      namePrefix: string;
      firstName: string;
      lastName: string;
    };
  };
}

// Helper functions
const getStatusBadgeClass = (result: string): string => {
  if (result === "รอผลการตรวจประเมิน") return BADGE.yellow;
  if (result === "ผ่าน") return BADGE.green;
  return BADGE.red;
};

const getStatusText = (result: string): string => {
  if (result === "รอผลการตรวจประเมิน") return "รอสรุปผล";
  if (result === "ผ่าน") return "ผ่าน";
  return "ไม่ผ่าน";
};

// Status Badge Component
const StatusBadge: React.FC<{ result: string }> = ({ result }) => (
  <div className={BADGE.wrapper}>
    <span className={`${BADGE.base} ${getStatusBadgeClass(result)}`}>
      {getStatusText(result)}
    </span>
  </div>
);

export default function AuditorReportsPage() {
  // Use custom hook instead of managing state manually
  const {
    inspections,
    loading,
    searchTerm,
    currentTab,
    totalRecords,
    lazyParams,
    setSearchTerm,
    handlePageChange,
    handleSort,
    handleTabChange,
    handleViewDetails,
  } = useInspectionReports();

  // Memoized columns configuration
  const columns = useMemo(
    () => [
      {
        field: "inspectionNo",
        header: "รหัสการตรวจ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (rowData: Inspection) => <span>{rowData.inspectionNo}</span>,
      },
      {
        field: "farmer",
        header: "เกษตรกร",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (rowData: Inspection) => {
          const farmer = rowData.rubberFarm?.farmer;
          return (
            <span>
              {farmer
                ? `${farmer.namePrefix}${farmer.firstName} ${farmer.lastName}`
                : "ไม่มีข้อมูล"}
            </span>
          );
        },
      },
      {
        field: "location",
        header: "สถานที่",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (rowData: Inspection) => {
          const location = [
            rowData.rubberFarm?.villageName,
            rowData.rubberFarm?.district,
            rowData.rubberFarm?.province,
          ]
            .filter(Boolean)
            .join(" ");
          return <span>{location || "-"}</span>;
        },
      },
      {
        field: "inspectionDateAndTime",
        header: "วันที่ตรวจ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (rowData: Inspection) => (
          <span>
            {new Date(rowData.inspectionDateAndTime).toLocaleDateString(
              "th-TH",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            )}
          </span>
        ),
      },
      {
        field: "inspectionResult",
        header: "สถานะ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        mobileAlign: "right" as const,
        mobileHideLabel: false,
        body: (rowData: Inspection) => (
          <StatusBadge result={rowData.inspectionResult} />
        ),
      },
      {
        field: "actions",
        header: "จัดการ",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        mobileAlign: "right" as const,
        mobileHideLabel: true,
        body: (rowData: Inspection) => (
          <div className={`${FLEX.justifyCenterGap2}`}>
            <PrimaryButton
              icon={
                rowData.inspectionResult === "รอผลการตรวจประเมิน"
                  ? "pi pi-check-circle"
                  : "pi pi-eye"
              }
              color={
                rowData.inspectionResult === "รอผลการตรวจประเมิน"
                  ? "success"
                  : "info"
              }
              onClick={() => handleViewDetails(rowData.inspectionId)}
              rounded
              text
            />
          </div>
        ),
      },
    ],
    [handleViewDetails]
  );

  // Loading state
  if (loading) {
    return (
      <AuditorLayout>
        <div className={SPINNER.wrapper}>
          <div className={SPINNER.spinner}></div>
        </div>
      </AuditorLayout>
    );
  }

  return (
    <AuditorLayout>
      <div className={CONTAINER.page}>
        {/* Header */}
        <div className={SPACING.mb8}>
          <h1 className={HEADER.title}>สรุปผลการตรวจประเมิน</h1>
          <p className={HEADER.subtitle}>
            จัดการและสรุปผลการตรวจประเมินสวนยางพารา
          </p>
        </div>

        {/* Content Card */}
        <div className={CONTAINER.card}>
          <div className={CONTAINER.cardPadding}>
            {/* Search and Filters */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between ${SPACING.gap4} ${SPACING.mb6}`}
            >
              {/* Search Input */}
              <div className={FORM.searchWrapper}>
                <div className="relative">
                  <PrimaryInputText
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="ค้นหาการตรวจประเมิน..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tab Buttons */}
              <div className={FORM.buttonGroup}>
                <PrimaryButton
                  label="รอสรุปผล"
                  icon="pi pi-clock"
                  color={currentTab === "pending" ? "success" : "secondary"}
                  onClick={() => handleTabChange("pending")}
                />
                <PrimaryButton
                  label="เสร็จสิ้น"
                  icon="pi pi-check-circle"
                  color={currentTab === "completed" ? "success" : "secondary"}
                  onClick={() => handleTabChange("completed")}
                />
              </div>
            </div>

            {/* Data Table */}
            <PrimaryDataTable
              value={inspections}
              columns={columns}
              loading={loading}
              paginator
              rows={lazyParams.rows}
              totalRecords={totalRecords}
              lazy
              onPage={handlePageChange}
              first={lazyParams.first}
              sortMode="multiple"
              multiSortMeta={lazyParams.multiSortMeta}
              onSort={handleSort}
              emptyMessage={
                currentTab === "pending"
                  ? "ไม่พบรายการตรวจประเมินที่รอสรุปผล"
                  : "ไม่พบรายการตรวจประเมินที่เสร็จสิ้น"
              }
              dataKey="inspectionId"
            />
          </div>
        </div>
      </div>
    </AuditorLayout>
  );
}
