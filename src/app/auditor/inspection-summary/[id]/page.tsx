"use client";

import { useParams, useRouter } from "next/navigation";
import { FaCheck, FaTimes } from "react-icons/fa";
import AuditorLayout from "@/components/layout/AuditorLayout";
import { useInspectionSummary } from "@/hooks/useInspectionSummary";
import {
  CONTAINER,
  HEADER,
  SPINNER,
  SPACING,
  INFO_CARD,
  GRID,
  TABLE,
  CARD,
  BADGE,
  TEXT,
  ACTION,
  FLEX,
} from "@/styles/auditorClasses";

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

export default function AuditorInspectionSummaryPage() {
  const params = useParams();
  const router = useRouter(); // For navigation in JSX

  // Use custom hook
  const { inspection, loading, savingResult, submitFinalResult } =
    useInspectionSummary(params.id);

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
        <div className={SPACING.mb8}>
          <h1 className={HEADER.title}>สรุปผลการตรวจประเมิน</h1>
          <p className={HEADER.subtitle}>
            กรุณาตรวจสอบข้อมูลและสรุปผลการประเมินสวนยางพารา
          </p>
        </div>

        {inspection && (
          <div className={`${CONTAINER.card} ${SPACING.p6} ${SPACING.mb8}`}>
            <div className={INFO_CARD.sectionBorder}>
              <h2 className={INFO_CARD.sectionTitle}>ข้อมูลทั่วไป</h2>
              <div className={`${GRID.cols2Md} ${GRID.gap4} ${SPACING.mt4}`}>
                <div className={INFO_CARD.wrapper}>
                  <p className={INFO_CARD.label}>เลขที่การตรวจประเมิน</p>
                  <p className={INFO_CARD.value}>{inspection.inspectionNo}</p>
                </div>
                <div className={INFO_CARD.wrapper}>
                  <p className={INFO_CARD.label}>วันที่ตรวจประเมิน</p>
                  <p className={INFO_CARD.value}>
                    {new Date(
                      inspection.inspectionDateAndTime
                    ).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className={INFO_CARD.wrapper}>
                  <p className={INFO_CARD.label}>ชื่อเกษตรกร</p>
                  <p className={INFO_CARD.value}>
                    {inspection.rubberFarm?.farmer
                      ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`
                      : "ไม่มีข้อมูล"}
                  </p>
                </div>
                <div className={INFO_CARD.wrapper}>
                  <p className={INFO_CARD.label}>สถานที่</p>
                  <p className={INFO_CARD.value}>
                    {[
                      inspection.rubberFarm?.villageName,
                      inspection.rubberFarm?.district,
                      inspection.rubberFarm?.province,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                </div>
                <div className={INFO_CARD.wrapper}>
                  <p className={INFO_CARD.label}>ประเภทการตรวจประเมิน</p>
                  <p className={INFO_CARD.value}>
                    {inspection.inspectionType?.typeName || "ไม่มีข้อมูล"}
                  </p>
                </div>
              </div>
            </div>

            <div className={INFO_CARD.sectionBorder}>
              <h2 className={`${INFO_CARD.sectionTitle}`}>
                ผลการตรวจประเมินรายหัวข้อ
              </h2>

              {/* Desktop table */}
              <div className={TABLE.wrapper}>
                <table className={TABLE.table}>
                  <thead className={TABLE.thead}>
                    <tr>
                      <th scope="col" className={TABLE.th}>
                        ลำดับ
                      </th>
                      <th scope="col" className={TABLE.th}>
                        รายการตรวจประเมิน
                      </th>
                      <th scope="col" className={TABLE.thCenter}>
                        ผลการประเมิน
                      </th>
                      <th scope="col" className={TABLE.thCenter}>
                        รายละเอียด
                      </th>
                    </tr>
                  </thead>
                  <tbody className={TABLE.tbody}>
                    {inspection.items
                      ?.slice()
                      .sort((a, b) => a.inspectionItemNo - b.inspectionItemNo)
                      .map((item) => (
                        <tr key={item.inspectionItemId} className={TABLE.row}>
                          <td className={`${TABLE.td} ${TEXT.secondary}`}>
                            {item.inspectionItemNo}
                          </td>
                          <td className={`${TABLE.td}`}>
                            {item.inspectionItemMaster?.itemName ||
                              `รายการที่ ${item.inspectionItemNo}`}
                          </td>
                          <td className={TABLE.tdCenter}>
                            <span
                              className={`${BADGE.base} ${
                                item.inspectionItemResult === "ผ่าน"
                                  ? BADGE.green
                                  : BADGE.red
                              }`}
                            >
                              {item.inspectionItemResult === "ผ่าน" ? (
                                <FaCheck className={SPACING.mr1} />
                              ) : (
                                <FaTimes className={SPACING.mr1} />
                              )}
                              {item.inspectionItemResult}
                            </span>
                          </td>
                          <td className={TABLE.tdCenter}>
                            <button
                              className={`${ACTION.button} ${TEXT.sm}`}
                              onClick={() =>
                                router.push(
                                  `/auditor/inspection-detail/${inspection.inspectionId}/${item.inspectionItemId}`
                                )
                              }
                            >
                              ดูรายละเอียด
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className={CARD.wrapper}>
                {inspection.items
                  ?.slice()
                  .sort((a, b) => a.inspectionItemNo - b.inspectionItemNo)
                  .map((item) => (
                    <div key={item.inspectionItemId} className={CARD.item}>
                      <div className={CARD.header}>
                        <div className={TEXT.medium}>
                          ลำดับที่ {item.inspectionItemNo}
                        </div>
                        <span
                          className={`${BADGE.base} ${
                            item.inspectionItemResult === "ผ่าน"
                              ? BADGE.green
                              : BADGE.red
                          }`}
                        >
                          {item.inspectionItemResult === "ผ่าน" ? (
                            <FaCheck className={SPACING.mr1} />
                          ) : (
                            <FaTimes className={SPACING.mr1} />
                          )}
                          {item.inspectionItemResult}
                        </span>
                      </div>

                      <div
                        className={`${TEXT.sm} ${TEXT.primary} ${SPACING.mb3}`}
                      >
                        {item.inspectionItemMaster?.itemName ||
                          `รายการที่ ${item.inspectionItemNo}`}
                      </div>

                      <button
                        className={`w-full ${SPACING.py2} ${SPACING.px4} border border-indigo-300 rounded-md ${TEXT.sm} ${TEXT.medium} text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        onClick={() =>
                          router.push(
                            `/auditor/inspection-detail/${inspection.inspectionId}/${item.inspectionItemId}`
                          )
                        }
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  ))}
              </div>
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

                  const secondaryRequirementsTotal =
                    secondaryRequirements.length;
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

                      <div className={`${FLEX.spaceX12} mt-6`}>
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
              <button
                type="button"
                onClick={() => router.back()}
                className={`${ACTION.buttonSecondary} ${SPACING.mb3} sm:mb-0 order-2 sm:order-1`}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={submitFinalResult}
                disabled={savingResult}
                className={`${ACTION.buttonPrimary} ${ACTION.buttonDisabled} order-1 sm:order-2`}
              >
                {savingResult ? "กำลังบันทึก..." : "บันทึกผลการประเมิน"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AuditorLayout>
  );
}
