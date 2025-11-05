import Link from "next/link";
import React from "react";

interface Inspection {
  inspectionId: number;
  inspectionNo: string;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  rubberFarm?: {
    farmer?: {
      namePrefix: string;
      firstName: string;
      lastName: string;
    };
  };
}

interface RecentInspectionTableRowProps {
  inspection: Inspection;
}

const getResultBadgeColor = (result: string): string => {
  if (result === "รอผลการตรวจประเมิน") {
    return "bg-yellow-100 text-yellow-800";
  }
  if (result === "ผ่าน") {
    return "bg-green-100 text-green-800";
  }
  return "bg-red-100 text-red-800";
};

const getResultText = (result: string): string => {
  return result === "รอผลการตรวจประเมิน" ? "รอสรุปผล" : result;
};

const getLinkText = (result: string): string => {
  return result === "รอผลการตรวจประเมิน" ? "สรุปผล" : "ดูรายละเอียด";
};

export const RecentInspectionTableRow: React.FC<
  RecentInspectionTableRowProps
> = ({ inspection }) => {
  const farmerName = inspection.rubberFarm?.farmer
    ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`
    : "ไม่มีข้อมูล";

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        {inspection.inspectionNo}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
        {farmerName}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
        {new Date(inspection.inspectionDateAndTime).toLocaleDateString("th-TH")}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getResultBadgeColor(
            inspection.inspectionResult
          )}`}
        >
          {getResultText(inspection.inspectionResult)}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
        <Link
          href={`/auditor/inspection-summary/${inspection.inspectionId}`}
          className="text-indigo-600 hover:text-indigo-900"
        >
          {getLinkText(inspection.inspectionResult)}
        </Link>
      </td>
    </tr>
  );
};
