"use client";

import CertificationStepIndicator from "@/components/committee/certifications/CertificationStepIndicator";
import IssuancePanel from "@/components/committee/certifications/IssuancePanel";
import IssueFilter from "@/components/committee/certifications/IssueFilter";
import CommitteeLayout from "@/components/layout/CommitteeLayout";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";
import { useFormStepper } from "@/hooks/useFormStepper";
import { useReadyToIssueInspections } from "@/hooks/useReadyToIssueInspections";
import { CONTAINER, HEADER, SPACING } from "@/styles/auditorClasses";
import { useMemo, useState } from "react";

export default function Page() {
  const {
    inspections,
    loading,
    totalRecords,
    lazyParams,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    handlePageChange,
    handleSort,
  } = useReadyToIssueInspections(10);

  const [selectedInspection, setSelectedInspection] = useState<Record<
    string,
    any
  > | null>(null);

  const { step, nextStep, prevStep, goToStep } = useFormStepper(2);

  const columns = useMemo(
    () => [
      {
        field: "inspectionNo",
        header: "รหัสการตรวจ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        style: { width: "16%" },
      },
      {
        field: "inspectionDateAndTime",
        header: "วันที่ตรวจ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (row: any) =>
          new Date(row.inspectionDateAndTime).toLocaleString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        style: { width: "18%" },
      },
      {
        field: "rubberFarm.villageName",
        header: "สถานที่",
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (r: any) => {
          const f = r.rubberFarm;
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
        style: { width: "28%" },
      },
      {
        field: "rubberFarm.farmer.firstName",
        header: "เกษตรกร",
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (r: any) =>
          (() => {
            const prefix = r.rubberFarm?.farmer?.namePrefix || "";
            const first = r.rubberFarm?.farmer?.firstName || "";
            const last = r.rubberFarm?.farmer?.lastName || "";
            const firstWithPrefix = prefix ? `${prefix}${first}` : first;
            return [firstWithPrefix, last].filter(Boolean).join(" ") || "-";
          })(),
        style: { width: "19%" },
      },
      {
        field: "auditorChief.firstName",
        header: "หัวหน้าผู้ตรวจประเมิน",
        headerAlign: "center" as const,
        bodyAlign: "left" as const,
        body: (r: any) => {
          const prefix = r.auditorChief?.namePrefix || "";
          const first = r.auditorChief?.firstName || "";
          const last = r.auditorChief?.lastName || "";
          const firstWithPrefix = prefix ? `${prefix}${first}` : first;
          return [firstWithPrefix, last].filter(Boolean).join(" ") || "-";
        },
        style: { width: "19%" },
      },
    ],
    []
  );

  return (
    <CommitteeLayout>
      <div className={CONTAINER.page}>
        <div className={SPACING.mb8}>
          <h1 className={HEADER.title}>ออกใบรับรองแหล่งผลิตจีเอพี</h1>
          <p className={HEADER.subtitle}>
            ออกใบรับรองแหล่งผลิตยางพาราที่ผ่านการตรวจประเมิน
          </p>
        </div>

        <div className={SPACING.mb6}>
          <CertificationStepIndicator currentStep={step} />
        </div>

        <div className={CONTAINER.card}>
          <div className={CONTAINER.cardPadding}>
            {step === 1 && (
              <div className={SPACING.mb6}>
                <IssueFilter
                  from={fromDate}
                  to={toDate}
                  onSearch={({ from, to }) => {
                    setFromDate(from ?? null);
                    setToDate(to ?? null);
                  }}
                />
              </div>
            )}

            {step === 1 && (
              <div>
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
                  dataKey="inspectionId"
                  rowClassName={(data: any) =>
                    // compare by inspectionId which is the canonical identifier in the inspections list
                    selectedInspection?.inspectionId === data.inspectionId
                      ? "bg-green-50 cursor-pointer"
                      : "cursor-pointer"
                  }
                  onRowClick={(e) => setSelectedInspection(e.data)}
                />

                <div className="mt-4 flex justify-end gap-2">
                  <PrimaryButton
                    label="ถัดไป"
                    onClick={() => {
                      if (selectedInspection) nextStep();
                    }}
                    disabled={!selectedInspection}
                  />
                </div>
              </div>
            )}

            {step === 2 && selectedInspection && (
              <div>
                <IssuancePanel
                  inspection={selectedInspection}
                  showStepIndicator={false}
                  onBack={() => prevStep()}
                  onIssued={() => {
                    // refresh and reset to step 1
                    handlePageChange({
                      first: 0,
                      rows: lazyParams.rows,
                    } as any);
                    setSelectedInspection(null);
                    goToStep(1);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </CommitteeLayout>
  );
}
