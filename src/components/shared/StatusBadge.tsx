"use client";

import React from "react";
import { BADGE } from "@/styles/auditorClasses";

interface Props {
  readonly result: string;
  readonly className?: string;
}

export default function StatusBadge({ result, className = "" }: Props) {
  const getStatusBadgeClass = (res: string) => {
    if (res === "รอผลการตรวจประเมิน") return BADGE.yellow;
    if (res === "ผ่าน") return BADGE.green;
    return BADGE.red;
  };

  const getStatusText = (res: string) => {
    if (res === "รอผลการตรวจประเมิน") return "รอสรุปผล";
    if (res === "ผ่าน") return "ผ่าน";
    return "ไม่ผ่าน";
  };

  return (
    <div className={`${BADGE.wrapper} ${className}`}>
      <span className={`${BADGE.base} ${getStatusBadgeClass(result)}`}>
        {getStatusText(result)}
      </span>
    </div>
  );
}
