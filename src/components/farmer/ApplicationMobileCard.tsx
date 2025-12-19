import React from "react";
import { CalendarIcon, DocsIcon, LocationOnIcon } from "../icons";

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

interface ApplicationCardProps {
  rubberFarm: RubberFarm;
  inspection?: Inspection;
  statusInfo: { text: string; color: string };
  formatThaiDate: (dateString?: string) => string;
}

export const ApplicationMobileCard: React.FC<ApplicationCardProps> = ({
  rubberFarm,
  inspection,
  statusInfo,
  formatThaiDate,
}) => {
  return (
    <div
      key={
        inspection
          ? `${rubberFarm.rubberFarmId}-${inspection.inspectionId}`
          : rubberFarm.rubberFarmId
      }
      className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-900">
          RF{rubberFarm.rubberFarmId.toString().padStart(5, "0")}
        </h3>
        <span
          className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}
        >
          {statusInfo.text}
        </span>
      </div>

      <div className="mt-2 text-sm text-gray-600">
        <div className="flex items-start">
          <LocationOnIcon className="h-4 w-4 mt-0.5 mr-1.5 text-gray-500 flex-shrink-0" />
          <span>
            {rubberFarm.villageName}, หมู่ {rubberFarm.moo},{" "}
            {rubberFarm.district}, {rubberFarm.province}
          </span>
        </div>

        {inspection?.inspectionDateAndTime && (
          <div className="flex items-start mt-1">
            <CalendarIcon className="h-4 w-4 mt-0.5 mr-1.5 text-gray-500 flex-shrink-0" />
            <span>
              กำหนดตรวจประเมิน:{" "}
              {formatThaiDate(inspection.inspectionDateAndTime)}
            </span>
          </div>
        )}

        {inspection?.inspectionNo && (
          <div className="flex items-start mt-1">
            <DocsIcon className="h-4 w-4 mt-0.5 mr-1.5 text-gray-500 flex-shrink-0" />
            <span>เลขที่: {inspection.inspectionNo}</span>
          </div>
        )}
      </div>
    </div>
  );
};
