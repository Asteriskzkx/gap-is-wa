import { DangerIcon } from "@/components/icons";
import Link from "next/link";
import React from "react";

export const EmptyApplicationsState: React.FC = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
      <DangerIcon className="h-6 w-6 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="text-base font-medium text-yellow-800">
          ยังไม่มีการยื่นขอรับรอง
        </h3>
        <p className="text-sm text-yellow-700 mt-1">
          คุณยังไม่ได้ยื่นขอรับรองมาตรฐาน GAP
          กรุณายื่นคำขอรับรองเพื่อเริ่มกระบวนการรับรองแหล่งผลิต
        </p>
        <Link
          href="/farmer/applications/new"
          className="inline-flex items-center mt-3 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
          ยื่นขอใบรับรองตอนนี้
        </Link>
      </div>
    </div>
  );
};
