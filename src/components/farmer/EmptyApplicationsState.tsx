import { DangerIcon } from "@/components/icons";
import { useRouter } from "next/navigation";
import React from "react";
import { PrimaryButton } from "../ui";

export const EmptyApplicationsState: React.FC = () => {
  const router = useRouter();

  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
      <DangerIcon className="h-6 w-6 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="text-base font-medium text-yellow-800">
          ยังไม่มีการยื่นขอรับรอง
        </h3>
        <p className="text-sm text-yellow-700 mt-1">
          คุณยังไม่ได้ยื่นขอรับรองมาตรฐานจีเอพี
          กรุณายื่นคำขอรับรองเพื่อเริ่มกระบวนการรับรองแหล่งผลิต
        </p>
        <PrimaryButton
          onClick={() => router.push("/farmer/applications/new")}
          label="ยื่นขอใบรับรองตอนนี้"
          color="warning"
          className="mt-3"
        ></PrimaryButton>
      </div>
    </div>
  );
};
