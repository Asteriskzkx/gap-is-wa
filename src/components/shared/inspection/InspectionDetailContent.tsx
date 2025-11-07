"use client";

import RequirementCard from "@/components/shared/RequirementCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { PrimaryButton } from "@/components/ui";
import { useInspectionDetail } from "@/hooks/useInspectionDetail";
import {
  CONTAINER,
  FIELD,
  FLEX,
  GRID,
  HEADER,
  INFO_CARD,
  REQ,
  SPACING,
  SPINNER,
  TEXT,
} from "@/styles/auditorClasses";
import { useRouter } from "next/navigation";

interface Props {
  inspectionId: string | number;
  itemId: string | number;
}

function renderAdditionalFields(inspectionItem: any) {
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
              <p className={FIELD.label}>แหล่งน้ำที่ใช้ในแปลงปลูก</p>
              <div className={FIELD.input}>
                {otherConditions.waterSourceInPlantation || "-"}
              </div>
            </div>
            <div>
              <p className={FIELD.label}>น้ำที่ใช้ในการหลังการเก็บเกี่ยว</p>
              <div className={FIELD.input}>
                {otherConditions.waterSourcePostHarvest || "-"}
              </div>
            </div>
          </div>
        </div>
      );

    case "พื้นที่ปลูก": {
      let landConditionsArr: string[] = [];
      if (Array.isArray(otherConditions.landConditions)) {
        landConditionsArr = otherConditions.landConditions;
      } else if (otherConditions.landConditions) {
        landConditionsArr = [otherConditions.landConditions];
      }

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
            <p className={FIELD.labelMb2}>สภาพพื้นที่ปลูก</p>
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
}

export default function InspectionDetailContent(props: Readonly<Props>) {
  const { inspectionId, itemId } = props;
  const router = useRouter();

  const { inspection, inspectionItem, loading } = useInspectionDetail(
    String(inspectionId),
    String(itemId)
  );

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
              <StatusBadge result={inspectionItem.inspectionItemResult} />
            </div>
          </div>

          {inspectionItem.requirements &&
          inspectionItem.requirements.length > 0 ? (
            <div className={REQ.spaceY}>
              <h3 className={`${TEXT.lgMedium} ${SPACING.mb4}`}>ข้อกำหนด</h3>
              {(() => {
                const sortedRequirements = [
                  ...inspectionItem.requirements,
                ].sort((a, b) => a.requirementNo - b.requirementNo);
                return sortedRequirements.map((requirement) => (
                  <div key={requirement.requirementId} className={REQ.card}>
                    <RequirementCard requirement={requirement} />
                  </div>
                ));
              })()}
            </div>
          ) : (
            <p className={TEXT.secondary}>ไม่พบข้อกำหนดสำหรับรายการนี้</p>
          )}

          {renderAdditionalFields(inspectionItem)}

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
  );
}
