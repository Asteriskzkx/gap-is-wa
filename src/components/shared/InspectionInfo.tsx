"use client";

import { GRID, INFO_CARD, SPACING } from "@/styles/auditorClasses";

interface Props {
  readonly inspection: any;
}

export default function InspectionInfo({ inspection }: Props) {
  if (!inspection) return null;

  return (
    <div className={INFO_CARD.sectionBorder}>
      <h2 className={INFO_CARD.sectionTitle}>ข้อมูลทั่วไป</h2>
      <div
        className={`${GRID.cols2Md} ${GRID.gap4} ${SPACING.mt4} ${SPACING.mb4}`}
      >
        <div className={INFO_CARD.wrapper}>
          <p className={INFO_CARD.label}>เลขที่การตรวจประเมิน</p>
          <p className={INFO_CARD.value}>{inspection.inspectionNo}</p>
        </div>
        <div className={INFO_CARD.wrapper}>
          <p className={INFO_CARD.label}>วันที่ตรวจประเมิน</p>
          <p className={INFO_CARD.value}>
            {new Date(inspection.inspectionDateAndTime).toLocaleDateString(
              "th-TH",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
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
  );
}
