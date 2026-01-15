"use client";

import LocationFilters from "@/components/shared/LocationFilters";
import { PrimaryButton, PrimaryDataTable } from "@/components/ui";
import thaiProvinceData from "@/data/thai-provinces.json";
import { useInspectionReports } from "@/hooks/useInspectionReports";
import { CONTAINER, FLEX, HEADER, SPACING } from "@/styles/auditorClasses";
import React, { useMemo } from "react";
import StatusBadge from "./StatusBadge";

interface Props {
  title?: string;
  subtitle?: string;
  defaultTab?: "pending" | "completed";
}

export default function InspectionReports({
  title = "สรุปผลการตรวจประเมิน",
  subtitle = "จัดการและสรุปผลการตรวจประเมินสวนยางพารา",
  defaultTab = "pending",
}: Props) {
  const {
    inspections,
    loading,
    currentTab,
    totalRecords,
    lazyParams,
    setFilters,
    handlePageChange,
    handleSort,
    handleTabChange,
    handleViewDetails,
  } = useInspectionReports(defaultTab);

  // Local ids for LocationFilters
  const [selectedProvinceId, setSelectedProvinceId] = React.useState<
    number | null
  >(null);
  const [selectedDistrictId, setSelectedDistrictId] = React.useState<
    number | null
  >(null);
  const [selectedSubDistrictId, setSelectedSubDistrictId] = React.useState<
    number | null
  >(null);

  const columns = useMemo(
    () => [
      {
        field: "inspectionNo",
        header: "รหัสการตรวจ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (row: any) => <span>{row.inspectionNo}</span>,
        style: { width: "15%" },
      },
      {
        field: "farmer",
        header: "เกษตรกร",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (row: any) => (
          <span>
            {row.rubberFarm?.farmer
              ? `${row.rubberFarm.farmer.namePrefix}${row.rubberFarm.farmer.firstName} ${row.rubberFarm.farmer.lastName}`
              : "ไม่มีข้อมูล"}
          </span>
        ),
        style: { width: "15%" },
      },
      {
        field: "location",
        header: "สถานที่",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (row: any) => {
          const f = row.rubberFarm;
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
        field: "inspectionDateAndTime",
        header: "วันที่ตรวจ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (row: any) => (
          <span>
            {new Date(row.inspectionDateAndTime).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
        style: { width: "15%" },
      },
      {
        field: "inspectionResult",
        header: "สถานะ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        mobileAlign: "right" as const,
        mobileHideLabel: false,
        body: (row: any) => <StatusBadge result={row.inspectionResult} />,
        style: { width: "15%" },
      },
      {
        field: "actions",
        header: "จัดการ",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        mobileAlign: "right" as const,
        mobileHideLabel: true,
        body: (row: any) => (
          <div className={`${FLEX.justifyCenterGap2}`}>
            <PrimaryButton
              icon={
                row.inspectionResult === "รอผลการตรวจประเมิน"
                  ? "pi pi-check-circle"
                  : "pi pi-eye"
              }
              color={
                row.inspectionResult === "รอผลการตรวจประเมิน"
                  ? "success"
                  : "info"
              }
              onClick={() => handleViewDetails(row.inspectionId)}
              rounded
              text
            />
          </div>
        ),
        style: { width: "10%" },
      },
    ],
    [handleViewDetails]
  );

  return (
    <div className={CONTAINER.page}>
      <div className={SPACING.mb8}>
        <h1 className={HEADER.title}>{title}</h1>
        <p className={HEADER.subtitle}>{subtitle}</p>
      </div>

      <div className={CONTAINER.card}>
        <div className={CONTAINER.cardPadding}>
          <div className={SPACING.mb6}>
            <LocationFilters
              provinceId={selectedProvinceId}
              districtId={selectedDistrictId}
              subDistrictId={selectedSubDistrictId}
              onProvinceChange={(v) => setSelectedProvinceId(v)}
              onDistrictChange={(v) => setSelectedDistrictId(v)}
              onSubDistrictChange={(v) => setSelectedSubDistrictId(v)}
              onSearch={({ provinceId, districtId, subDistrictId }) => {
                const prov = thaiProvinceData.find(
                  (p: any) => p.id === provinceId
                );
                const provinceName = prov ? prov.name_th : "";

                let districtName = "";
                if (provinceId && districtId) {
                  const amp = prov?.amphure?.find(
                    (a: any) => a.id === districtId
                  );
                  districtName = amp ? amp.name_th : "";
                }

                let subDistrictName = "";
                if (provinceId && districtId && subDistrictId) {
                  const amp = prov?.amphure?.find(
                    (a: any) => a.id === districtId
                  );
                  const tam = amp?.tambon?.find(
                    (t: any) => t.id === subDistrictId
                  );
                  subDistrictName = tam ? tam.name_th : "";
                }

                setFilters({
                  province: provinceName || undefined,
                  district: districtName || undefined,
                  subDistrict: subDistrictName || undefined,
                });
              }}
              onReset={() => {
                setSelectedProvinceId(null);
                setSelectedDistrictId(null);
                setSelectedSubDistrictId(null);
                setFilters({});
              }}
              currentTab={currentTab}
              onTabChange={handleTabChange}
            />
          </div>

          <PrimaryDataTable
            value={inspections}
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
  );
}
