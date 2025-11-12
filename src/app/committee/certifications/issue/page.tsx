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
  } = useReadyToIssueInspections(5);

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
      },
      {
        field: "inspectionDateAndTime",
        header: "วันที่ตรวจ",
        sortable: true,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: (row: any) =>
          new Date(row.inspectionDateAndTime).toLocaleString(),
      },
      {
        field: "rubberFarm.villageName",
        header: "สถานที่",
        body: (r: any) =>
          [
            r.rubberFarm?.villageName,
            r.rubberFarm?.subDistrict,
            r.rubberFarm?.district,
            r.rubberFarm?.province,
          ]
            .filter(Boolean)
            .join(" ") || "-",
      },
      { field: "inspectionStatus", header: "สถานะ" },
      { field: "inspectionResult", header: "ผลการตรวจ" },
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
                  rowsPerPageOptions={[5, 10, 25]}
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
