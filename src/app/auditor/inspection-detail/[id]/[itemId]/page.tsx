"use client";

import { useRouter, useParams } from "next/navigation";
import { FaCheck, FaTimes } from "react-icons/fa";
import AuditorLayout from "@/components/layout/AuditorLayout";
import { PrimaryButton } from "@/components/ui";
import { useInspectionDetail } from "@/hooks/useInspectionDetail";
import {
  CONTAINER,
  HEADER,
  SPINNER,
  GRID,
  SPACING,
  INFO_CARD,
  FIELD,
  TEXT,
  FLEX,
  REQ,
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

export default function AuditorInspectionDetailPage() {
  const router = useRouter();
  const params = useParams();

  // Use custom hook
  const { inspection, inspectionItem, loading } = useInspectionDetail(
    params.id,
    params.itemId
  );

  const renderAdditionalFields = () => {
    if (!inspectionItem) return null;
    const itemName = inspectionItem?.inspectionItemMaster?.itemName || "";
    const otherConditions = inspectionItem?.otherConditions || {};

    switch (itemName) {
      case "น้ำ":
        return (
          <div className={FIELD.wrapper}>
            <h3 className={FIELD.title}>ข้อมูลเพิ่มเติม</h3>
            <div className={FIELD.spaceY}>
              <div>
                <label className={FIELD.label}>แหล่งน้ำที่ใช้ในแปลงปลูก</label>
                <div className={FIELD.input}>
                  {otherConditions.waterSourceInPlantation || "-"}
                </div>
              </div>
              <div>
                <label className={FIELD.label}>
                  น้ำที่ใช้ในการหลังการเก็บเกี่ยว
                </label>
                <div className={FIELD.input}>
                  {otherConditions.waterSourcePostHarvest || "-"}
                </div>
              </div>
            </div>
          </div>
        );
      case "พื้นที่ปลูก": {
        const landConditionsArr = Array.isArray(otherConditions.landConditions)
          ? otherConditions.landConditions
          : otherConditions.landConditions
          ? [otherConditions.landConditions]
          : [];

        const landLabelMap: Record<string, string> = {
          "raised-bed-waterlogged": "ยกร่องน้ำขัง",
          "raised-bed": "ยกร่อง",
          flat: "ที่ราบ",
          lowland: "ที่ราบลุ่ม",
          upland: "ที่ดอน",
          other: "อื่นๆ",
        };

        const labels = landConditionsArr
          .map((k: string) => landLabelMap[k] || k)
          .filter(Boolean);

        if (
          landConditionsArr.includes("other") &&
          otherConditions.landConditionsOther
        ) {
          labels.push(`อื่นๆ: ${otherConditions.landConditionsOther}`);
        }

        return (
          <div className={FIELD.wrapper}>
            <h3 className={FIELD.title}>ข้อมูลเพิ่มเติม</h3>
            <div>
              <label className={FIELD.labelMb2}>สภาพพื้นที่ปลูก</label>
              <div className={FIELD.input}>
                {labels.length ? labels.join(", ") : "-"}
              </div>
            </div>
          </div>
        );
      }
      case "วัตถุอันตรายทางการเกษตร":
        return (
          <div className={FIELD.wrapper}>
            <h3 className={FIELD.title}>ข้อมูลเพิ่มเติม</h3>
            <div className={SPACING.mb4}>
              <div className={FLEX.itemsCenter}>
                <input
                  id="no-hazardous-materials"
                  type="checkbox"
                  className={FIELD.checkbox}
                  checked={otherConditions.noHazardousMaterials === "true"}
                  disabled
                />
                <label
                  htmlFor="no-hazardous-materials"
                  className={FIELD.checkboxLabel}
                >
                  ไม่ได้ใช้วัตถุอันตรายทางการเกษตรในการผลิต
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
        <div className={SPACING.mb6}>
          <div className={FLEX.betweenCenter}>
            <h1 className={HEADER.title}>รายละเอียดการตรวจประเมิน</h1>
          </div>

          {inspection && (
            <div className={`${SPACING.mt4} ${CONTAINER.card}`}>
              <div className={`${GRID.cols3} ${GRID.gap4} ${SPACING.p4}`}>
                <div>
                  <h2 className={INFO_CARD.label}>รหัสการตรวจประเมิน</h2>
                  <p className={`${SPACING.mt1} ${TEXT.lgMedium}`}>
                    {inspection.inspectionNo}
                  </p>
                </div>
                <div>
                  <h2 className={TEXT.smMedium}>วันที่นัดหมาย</h2>
                  <p className={`${SPACING.mt1} ${TEXT.lgMedium}`}>
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
                <div>
                  <h2 className={TEXT.smMedium}>ประเภทการตรวจ</h2>
                  <p className={`${SPACING.mt1} ${TEXT.lgMedium}`}>
                    {inspection.inspectionType?.typeName || "-"}
                  </p>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <h2 className={TEXT.smMedium}>พื้นที่สวนยาง</h2>
                  <p className={`${SPACING.mt1} ${TEXT.lgMedium}`}>
                    {inspection.rubberFarm?.villageName || "-"},{" "}
                    {inspection.rubberFarm?.district || "-"},{" "}
                    {inspection.rubberFarm?.province || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {inspectionItem && (
          <div className={`${CONTAINER.card} ${SPACING.p6}`}>
            <div className={SPACING.mb6}>
              <h2 className={INFO_CARD.sectionTitle}>
                รายการที่ {inspectionItem.inspectionItemNo} :{" "}
                {inspectionItem.inspectionItemMaster?.itemName || ""}
              </h2>

              <div className={SPACING.mt4}>
                <div
                  className={`inline-flex items-center px-3 py-1.5 rounded-full ${
                    TEXT.sm
                  } ${TEXT.medium} ${
                    inspectionItem.inspectionItemResult === "ผ่าน"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  <span className="mr-1.5">
                    {inspectionItem.inspectionItemResult === "ผ่าน" ? (
                      <FaCheck className="inline-block" />
                    ) : (
                      <FaTimes className="inline-block" />
                    )}
                  </span>
                  ผลการประเมิน: {inspectionItem.inspectionItemResult}
                </div>
              </div>
            </div>

            {inspectionItem.requirements &&
            inspectionItem.requirements.length > 0 ? (
              <div className={REQ.spaceY}>
                <h3 className={`${TEXT.lgMedium} ${SPACING.mb4}`}>ข้อกำหนด</h3>

                {inspectionItem.requirements
                  .sort((a, b) => a.requirementNo - b.requirementNo)
                  .map((requirement) => (
                    <div key={requirement.requirementId} className={REQ.card}>
                      <div className={REQ.cardMb2}>
                        <div className={FLEX.itemsStart}>
                          <div className={FLEX.shrink0}>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                                TEXT.medium
                              } ${
                                requirement.requirementMaster
                                  ?.requirementLevel === "ข้อกำหนดหลัก"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {requirement.requirementMaster
                                ?.requirementLevel || ""}
                              {requirement.requirementMaster?.requirementLevelNo
                                ? ` ${requirement.requirementMaster.requirementLevelNo}`
                                : ""}
                            </span>
                          </div>
                          <h4 className={REQ.title}>
                            {requirement.requirementNo}.{" "}
                            {requirement.requirementMaster?.requirementName ||
                              ""}
                          </h4>
                        </div>
                      </div>

                      <div className={REQ.grid}>
                        <div>
                          <label className={FIELD.label}>
                            ผลการตรวจประเมิน
                          </label>
                          <div
                            className={`w-full ${SPACING.px3} ${
                              SPACING.py2
                            } border rounded-md ${
                              requirement.evaluationResult === "ใช่"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : requirement.evaluationResult === "ไม่ใช่"
                                ? "bg-red-50 border-red-200 text-red-700"
                                : requirement.evaluationResult === "NA"
                                ? "bg-gray-100 border-gray-200 text-gray-700"
                                : "bg-gray-100 border-gray-300 text-gray-700"
                            }`}
                          >
                            {requirement.evaluationResult || "ไม่มีข้อมูล"}
                          </div>
                        </div>

                        <div>
                          <label className={FIELD.label}>
                            วิธีการตรวจประเมิน
                          </label>
                          <div className={FIELD.input}>
                            {requirement.evaluationMethod || "ไม่มีข้อมูล"}
                          </div>
                        </div>

                        {requirement.note && (
                          <div className="md:col-span-2">
                            <label className={FIELD.label}>
                              บันทึกเพิ่มเติม
                            </label>
                            <div className={FIELD.inputTextArea}>
                              {requirement.note || "-"}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className={TEXT.secondary}>ไม่พบข้อกำหนดสำหรับรายการนี้</p>
            )}

            {renderAdditionalFields()}

            <div className={`${FLEX.justifyCenter} ${SPACING.mt8}`}>
              <PrimaryButton
                label="กลับไปหน้าสรุปผล"
                icon="pi pi-arrow-left"
                color="secondary"
                onClick={() => router.back()}
              />
            </div>
          </div>
        )}
      </div>
    </AuditorLayout>
  );
}
