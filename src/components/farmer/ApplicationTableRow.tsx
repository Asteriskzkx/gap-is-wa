import React from "react";
import { StatusBadge } from "./StatusBadge";

interface Inspection {
  inspectionId: number;
  inspectionNo: string;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  rubberFarmId: number;
}

interface RubberFarm {
  rubberFarmId: number;
  villageName: string;
  moo: number;
  district: string;
  province: string;
  createdAt: string;
}

interface ApplicationTableRowProps {
  rubberFarm: RubberFarm;
  inspection?: Inspection;
  statusInfo: { text: string; color: string };
  formatThaiDate: (dateString?: string) => string;
}

export const ApplicationTableRow: React.FC<ApplicationTableRowProps> = ({
  rubberFarm,
  inspection,
  statusInfo,
  formatThaiDate,
}) => {
  return (
    <tr
      key={
        inspection
          ? `${rubberFarm.rubberFarmId}-${inspection.inspectionId}`
          : rubberFarm.rubberFarmId
      }
      className="hover:bg-gray-50"
    >
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        RF{rubberFarm.rubberFarmId.toString().padStart(5, "0")}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {rubberFarm.villageName}, หมู่ {rubberFarm.moo}, {rubberFarm.district}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {inspection?.inspectionDateAndTime
          ? formatThaiDate(inspection.inspectionDateAndTime)
          : "-"}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge text={statusInfo.text} color={statusInfo.color} />
      </td>
    </tr>
  );
};
