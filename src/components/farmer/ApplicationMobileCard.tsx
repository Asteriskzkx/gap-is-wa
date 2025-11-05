import React from "react";

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mt-0.5 mr-1.5 text-gray-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>
            {rubberFarm.villageName}, หมู่ {rubberFarm.moo},{" "}
            {rubberFarm.district}, {rubberFarm.province}
          </span>
        </div>

        {inspection?.inspectionDateAndTime && (
          <div className="flex items-start mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mt-0.5 mr-1.5 text-gray-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              กำหนดตรวจประเมิน:{" "}
              {formatThaiDate(inspection.inspectionDateAndTime)}
            </span>
          </div>
        )}

        {inspection?.inspectionNo && (
          <div className="flex items-start mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mt-0.5 mr-1.5 text-gray-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>เลขที่: {inspection.inspectionNo}</span>
          </div>
        )}
      </div>
    </div>
  );
};
