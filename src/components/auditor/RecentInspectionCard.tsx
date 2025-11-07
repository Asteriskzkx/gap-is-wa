import Link from "next/link";
import { getInspectionSummaryRoute } from "@/lib/routeHelpers";
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

interface RecentInspectionCardProps {
  inspection: Inspection;
  role?: string;
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

export const RecentInspectionCard: React.FC<RecentInspectionCardProps> = ({
  inspection,
  role = "auditor",
}) => {
  const farmerName = inspection.rubberFarm?.farmer
    ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`
    : "ไม่มีข้อมูล";

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">
            {inspection.inspectionNo}
          </h3>
          <p className="text-sm text-gray-700 mt-1">{farmerName}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getResultBadgeColor(
            inspection.inspectionResult
          )}`}
        >
          {getResultText(inspection.inspectionResult)}
        </span>
      </div>

      <div className="text-sm text-gray-500 mt-2">
        วันที่:{" "}
        {new Date(inspection.inspectionDateAndTime).toLocaleDateString(
          "th-TH",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        )}
      </div>

      <div className="mt-3 flex justify-end">
        <Link
          href={getInspectionSummaryRoute(role, inspection.inspectionId)}
          className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
        >
          {getLinkText(inspection.inspectionResult)}
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </Link>
      </div>
    </div>
  );
};
