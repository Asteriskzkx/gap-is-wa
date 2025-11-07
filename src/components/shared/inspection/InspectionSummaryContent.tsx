"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { PrimaryDataTable, PrimaryButton } from "@/components/ui";
import { useInspectionSummary } from "@/hooks/useInspectionSummary";
import {
  CONTAINER,
  HEADER,
  SPINNER,
  SPACING,
  INFO_CARD,
  TEXT,
  FLEX,
} from "@/styles/auditorClasses";
import StatusBadge from "@/components/shared/StatusBadge";
import InspectionInfo from "@/components/shared/InspectionInfo";
import { getInspectionDetailRoute } from "@/lib/routeHelpers";

interface Props {
  inspectionId: string | number;
  role?: string;
  onNavigateToDetail?: (
    inspectionId: number | string,
    itemId: number | string
  ) => void;
}

interface Requirement {
  requirementId: number;
  requirementNo: number;
  evaluationResult: string;
  evaluationMethod: string;
  note: string;
  requirementMaster?: {
    requirementName: string;
    requirementLevel: string;
    requirementLevelNo: string;
  };
}

interface InspectionItemSummary {
  inspectionItemId: number;
  inspectionItemNo: number;
  inspectionItemResult: string;
  inspectionItemMaster?: {
    itemNo: number;
    itemName: string;
  };
  requirements?: Requirement[];
  requirementsSummary?: {
    total: number;
    passed: number;
    failed: number;
    mainRequirementsFailed: number;
  };
}

// helper renderers moved out of component to satisfy lint rules
function renderInspectionItemNo(rowData: InspectionItemSummary) {
  return <span className={TEXT.secondary}>{rowData.inspectionItemNo}</span>;
}

function renderItemName(rowData: InspectionItemSummary) {
  return (
    <span className={TEXT.primary}>
      {rowData.inspectionItemMaster?.itemName ||
        `รายการที่ ${rowData.inspectionItemNo}`}
    </span>
  );
}

function renderInspectionItemResult(rowData: InspectionItemSummary) {
  return <StatusBadge result={rowData.inspectionItemResult} />;
}

function makeRenderActions(
  router: ReturnType<typeof useRouter>,
  onNavigateToDetail:
    | ((inspectionId: number | string, itemId: number | string) => void)
    | undefined,
  role: string,
  inspectionId: string | number
) {
  const actions = (rowData: InspectionItemSummary) => (
    <div className="flex justify-center">
      <PrimaryButton
        icon="pi pi-eye"
        color="info"
        size="small"
        rounded
        text
        onClick={() => {
          if (onNavigateToDetail) {
            // prefer the provided inspectionId (could be from fetched inspection)
            onNavigateToDetail(inspectionId, rowData.inspectionItemId);
          } else {
            router.push(
              getInspectionDetailRoute(
                role,
                inspectionId,
                rowData.inspectionItemId
              )
            );
          }
        }}
      />
    </div>
  );

  // give the renderer a displayName for linting / debugging
  (actions as any).displayName = "InspectionItemActionsRenderer";

  return actions;
}

export default function InspectionSummaryContent(props: Readonly<Props>) {
  const { inspectionId, role = "auditor", onNavigateToDetail } = props;
  const router = useRouter();

  const { inspection, loading, savingResult, submitFinalResult } =
    useInspectionSummary(String(inspectionId));

  const isCompleted = inspection?.inspectionResult !== "รอผลการตรวจประเมิน";

  const columns = useMemo(() => {
    const actionsRenderer = makeRenderActions(
      router,
      onNavigateToDetail,
      role,
      inspectionId
    );

    return [
      {
        field: "inspectionItemNo",
        header: "ลำดับ",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        body: renderInspectionItemNo,
      },
      {
        field: "itemName",
        header: "รายการตรวจประเมิน",
        sortable: false,
        headerAlign: "left" as const,
        bodyAlign: "left" as const,
        body: renderItemName,
      },
      {
        field: "inspectionItemResult",
        header: "ผลการประเมิน",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        mobileAlign: "right" as const,
        mobileHideLabel: false,
        body: renderInspectionItemResult,
      },
      {
        field: "actions",
        header: "รายละเอียด",
        sortable: false,
        headerAlign: "center" as const,
        bodyAlign: "center" as const,
        mobileAlign: "right" as const,
        mobileHideLabel: true,
        body: actionsRenderer,
      },
    ];
  }, [router, role, onNavigateToDetail, inspectionId]);

  if (loading) {
    return (
      <div className={CONTAINER.page}>
        <div className={SPINNER.wrapper}>
          <div className={SPINNER.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={CONTAINER.page}>
      <div className={SPACING.mb8}>
        <h1 className={HEADER.title}>สรุปผลการตรวจประเมิน</h1>
        <p className={HEADER.subtitle}>
          กรุณาตรวจสอบข้อมูลและสรุปผลการประเมินสวนยางพารา
        </p>
      </div>

      {inspection && (
        <div className={`${CONTAINER.card} ${SPACING.p6} ${SPACING.mb8}`}>
          <InspectionInfo inspection={inspection} />

          <div className={INFO_CARD.sectionBorder}>
            <h2 className={`${INFO_CARD.sectionTitle}`}>
              ผลการตรวจประเมินรายหัวข้อ
            </h2>

            <PrimaryDataTable
              value={
                inspection.items
                  ?.slice()
                  .sort((a, b) => a.inspectionItemNo - b.inspectionItemNo) || []
              }
              columns={columns}
              dataKey="inspectionItemId"
              emptyMessage="ไม่พบรายการตรวจประเมิน"
            />
          </div>

          <div className={INFO_CARD.sectionBorder}>
            <h2 className={`${INFO_CARD.sectionTitle} text-center`}>
              สรุปผลการตรวจประเมิน
            </h2>

            <div
              className={`max-w-3xl mx-auto ${CONTAINER.card} ${SPACING.p6} ${SPACING.mb6}`}
            >
              <h3
                className={`text-base ${TEXT.semibold} ${SPACING.mb4} text-center`}
              >
                ผลการ{inspection.inspectionType?.typeName || "ไม่มีข้อมูล"}
              </h3>

              {(() => {
                const mainRequirements =
                  inspection.items?.flatMap(
                    (item) =>
                      item.requirements?.filter(
                        (req) =>
                          req.requirementMaster?.requirementLevel ===
                          "ข้อกำหนดหลัก"
                      ) || []
                  ) || [];

                const mainRequirementsTotal = mainRequirements.length;
                const mainRequirementsPassed = mainRequirements.filter(
                  (req) => req.evaluationResult === "ใช่"
                ).length;
                const mainRequirementsFailed =
                  mainRequirementsTotal - mainRequirementsPassed;

                const secondaryRequirements =
                  inspection.items?.flatMap(
                    (item) =>
                      item.requirements?.filter(
                        (req) =>
                          req.requirementMaster?.requirementLevel ===
                          "ข้อกำหนดรอง"
                      ) || []
                  ) || [];

                const secondaryRequirementsTotal = secondaryRequirements.length;
                const secondaryRequirementsPassed =
                  secondaryRequirements.filter(
                    (req) => req.evaluationResult === "ใช่"
                  ).length;
                const secondaryRequirementsFailed =
                  secondaryRequirementsTotal - secondaryRequirementsPassed;

                const secondaryCompliancePercentage =
                  secondaryRequirementsTotal > 0
                    ? Math.round(
                        (secondaryRequirementsPassed /
                          secondaryRequirementsTotal) *
                          100
                      )
                    : 0;

                const isMainRequirementsPassed = mainRequirementsFailed === 0;
                const isSecondaryRequirementsPassed =
                  secondaryCompliancePercentage >= 60;
                const isPassed =
                  isMainRequirementsPassed && isSecondaryRequirementsPassed;

                return (
                  <div className={`${FLEX.spaceY4} ${TEXT.sm}`}>
                    <div className={SPACING.mb2}>
                      <p className={SPACING.mb3}>
                        ข้อกำหนดหลัก {mainRequirementsTotal} ข้อ (100%)
                      </p>
                      <p className={SPACING.mb3}>
                        ข้อกำหนดรอง {secondaryRequirementsTotal} ข้อ ผ่าน{" "}
                        {secondaryRequirementsPassed} ข้อ ไม่ผ่าน{" "}
                        {secondaryRequirementsFailed} ข้อ (ต้องผ่านอย่างน้อย 7
                        ข้อ)
                      </p>
                      <p className={SPACING.mb3}>
                        เกณฑ์ต้องผ่านข้อกำหนดรองไม่น้อยกว่า 60%
                      </p>
                    </div>

                    <div className="border-t border-b py-4">
                      <p className={TEXT.semibold}>
                        สูตร: สอดคล้องกับข้อกำหนดรอง =
                      </p>
                      <div className={`${FLEX.colCenter} my-2`}>
                        <div className="border-b border-black text-center px-2">
                          จำนวนข้อกำหนดรองที่ผ่าน X 100
                        </div>
                        <div className="text-center px-2">
                          จำนวนข้อกำหนดรองทั้งหมด
                        </div>
                      </div>
                      <p className={`${TEXT.semibold} ${SPACING.mt2}`}>
                        = {secondaryRequirementsPassed} x 100 /{" "}
                        {secondaryRequirementsTotal} ={" "}
                        {secondaryCompliancePercentage}%
                      </p>
                    </div>

                    <div className={`${FLEX.spaceX12} mt-6 gap-2`}>
                      <label className={`${FLEX.itemsCenter} space-x-2`}>
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5"
                          checked={isPassed}
                          disabled
                        />
                        <span>ผ่านการตรวจประเมิน</span>
                      </label>

                      <label className={`${FLEX.itemsCenter} space-x-2`}>
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5"
                          checked={!isPassed}
                          disabled
                        />
                        <span>ไม่ผ่านการตรวจประเมิน</span>
                      </label>
                    </div>
                    <p
                      className={`${SPACING.mt2} ${TEXT.smTertiary} text-center`}
                    >
                      ผลการประเมินถูกกำหนดอัตโนมัติตามเกณฑ์การผ่านของข้อกำหนดหลักและข้อกำหนดรอง
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          <div
            className={`flex flex-col sm:flex-row justify-end ${SPACING.gap2} sm:space-x-4 mt-6`}
          >
            <PrimaryButton
              label={isCompleted ? "กลับ" : "ยกเลิก"}
              icon="pi pi-arrow-left"
              color="secondary"
              onClick={() => router.back()}
            />
            {!isCompleted && (
              <PrimaryButton
                label={savingResult ? "กำลังบันทึก..." : "บันทึกผลการประเมิน"}
                icon="pi pi-check"
                color="success"
                onClick={submitFinalResult}
                disabled={savingResult}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
