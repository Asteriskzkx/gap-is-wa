"use client";

import React from "react";
import { FIELD, FLEX, SPACING, TEXT } from "@/styles/auditorClasses";

interface Props {
  readonly requirement: any;
}

export default function RequirementCard({ requirement }: Props) {
  let bgClass = "bg-gray-100 border-gray-300 text-gray-700";
  if (requirement.evaluationResult === "ใช่")
    bgClass = "bg-green-50 border-green-200 text-green-700";
  else if (requirement.evaluationResult === "ไม่ใช่")
    bgClass = "bg-red-50 border-red-200 text-red-700";
  else if (requirement.evaluationResult === "ไม่เกี่ยวข้อง")
    bgClass = "bg-gray-100 border-gray-200 text-gray-700";

  return (
    <div className="mb-4">
      <div className={FLEX.itemsStart}>
        <div>
          <span
            className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs whitespace-nowrap overflow-hidden truncate max-w-[6rem] sm:max-w-none ${
              TEXT.medium
            } ${
              requirement.requirementMaster?.requirementLevel === "ข้อกำหนดหลัก"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {requirement.requirementMaster?.requirementLevel || ""}
            {requirement.requirementMaster?.requirementLevelNo
              ? ` ${requirement.requirementMaster.requirementLevelNo}`
              : ""}
          </span>
        </div>
        <h4 className="ml-3 text-md font-medium">
          {requirement.requirementNo}.{" "}
          {requirement.requirementMaster?.requirementName || ""}
        </h4>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-3">
        <div>
          <p className={FIELD.label}>ผลการตรวจประเมิน</p>
          <div
            className={`w-full ${SPACING.px3} ${SPACING.py2} border rounded-md ${bgClass}`}
          >
            {(() => {
              const val = requirement.evaluationResult;
              if (val === "ใช่") return "ใช่ (ผ่าน)";
              if (val === "ไม่ใช่") return "ไม่ใช่ (ไม่ผ่าน)";
              if (val === "ไม่เกี่ยวข้อง") return "ไม่เกี่ยวข้อง (NA)";
              return val || "ไม่มีข้อมูล";
            })()}
          </div>
        </div>

        <div>
          <p className={FIELD.label}>วิธีการตรวจประเมิน</p>
          <div className={FIELD.input}>
            {requirement.evaluationMethod || "ไม่มีข้อมูล"}
          </div>
        </div>

        {requirement.note && (
          <div className="md:col-span-2">
            <p className={FIELD.label}>บันทึกเพิ่มเติม</p>
            <div className={FIELD.input}>{requirement.note}</div>
          </div>
        )}
      </div>
    </div>
  );
}
