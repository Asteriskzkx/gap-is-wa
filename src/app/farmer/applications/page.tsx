"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FarmerLayout from "@/components/layout/FarmerLayout";

interface RubberFarm {
  rubberFarmId: number;
  villageName: string;
  moo: number;
  district: string;
  province: string;
  createdAt: string;
}

interface Inspection {
  inspectionId: number;
  inspectionNo: string;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  rubberFarmId: number;
}

interface ApplicationItem {
  rubberFarm: RubberFarm;
  inspection?: Inspection;
}

export default function FarmerApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplicationsData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }

        const farmerResponse = await fetch("/api/v1/farmers/current", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!farmerResponse.ok) {
          setLoading(false);
          return;
        }

        const farmerData = await farmerResponse.json();
        const farmsResponse = await fetch("/api/v1/rubber-farms", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!farmsResponse.ok) {
          setError("ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
          setLoading(false);
          return;
        }

        const allFarms = await farmsResponse.json();
        const farms = allFarms.filter(
          (farm: any) => farm.farmerId === farmerData.farmerId
        );

        const allApplicationItems: ApplicationItem[] = [];

        for (const farm of farms) {
          try {
            const inspectionsResponse = await fetch(
              `/api/v1/inspections?rubberFarmId=${farm.rubberFarmId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (inspectionsResponse.ok) {
              const inspections = await inspectionsResponse.json();
              if (inspections.length > 0) {
                const sortedInspections = inspections.sort(
                  (a: Inspection, b: Inspection) =>
                    new Date(b.inspectionDateAndTime).getTime() -
                    new Date(a.inspectionDateAndTime).getTime()
                );
                sortedInspections.forEach((inspection: Inspection) => {
                  allApplicationItems.push({ rubberFarm: farm, inspection });
                });
              } else {
                allApplicationItems.push({ rubberFarm: farm });
              }
            } else {
              allApplicationItems.push({ rubberFarm: farm });
            }
          } catch (error) {
            allApplicationItems.push({ rubberFarm: farm });
          }
        }

        setApplications(allApplicationItems);
      } catch (error) {
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationsData();
  }, [router]);

  const formatThaiDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (application: ApplicationItem) => {
    if (!application.inspection) {
      return {
        text: "รอกำหนดวันตรวจประเมิน",
        color: "bg-yellow-100 text-yellow-800",
      };
    }

    const inspection = application.inspection;
    const status = inspection.inspectionStatus;
    const result = inspection.inspectionResult;

    if (status === "รอการตรวจประเมิน") {
      return { text: "รอการตรวจประเมิน", color: "bg-blue-100 text-blue-800" };
    } else if (status === "ตรวจประเมินแล้ว") {
      if (result === "รอผลการตรวจประเมิน") {
        return {
          text: "ตรวจประเมินแล้ว รอสรุปผล",
          color: "bg-purple-100 text-purple-800",
        };
      } else if (result === "ผ่าน") {
        return { text: "ผ่านการรับรอง", color: "bg-green-100 text-green-800" };
      } else if (result === "ไม่ผ่าน") {
        return {
          text: "ไม่ผ่านการรับรอง",
          color: "bg-red-100 text-red-800",
        };
      }
    }

    return { text: status || "ไม่ทราบสถานะ", color: "bg-gray-100 text-gray-800" };
  };

  return (
    <FarmerLayout selectedPath="/farmer/applications">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          ติดตามสถานะการรับรอง
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          ตรวจสอบสถานะคำขอและผลการรับรองแหล่งผลิต
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 inline-flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-500 mr-3 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
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
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รหัสสวน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ที่ตั้ง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่ยื่นคำขอ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      กำหนดวันตรวจประเมิน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => {
                    const statusInfo = getStatusInfo(application);
                    const { rubberFarm, inspection } = application;

                    return (
                      <tr
                        key={
                          inspection
                            ? `${rubberFarm.rubberFarmId}-${inspection.inspectionId}`
                            : rubberFarm.rubberFarmId
                        }
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          RF{rubberFarm.rubberFarmId.toString().padStart(5, "0")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rubberFarm.villageName}, หมู่ {rubberFarm.moo},{" "}
                          {rubberFarm.district}, {rubberFarm.province}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatThaiDate(rubberFarm.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {inspection && inspection.inspectionDateAndTime
                            ? formatThaiDate(inspection.inspectionDateAndTime)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}
                          >
                            {statusInfo.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-200">
              {applications.map((application) => {
                const statusInfo = getStatusInfo(application);
                const { rubberFarm, inspection } = application;

                return (
                  <div
                    key={
                      inspection
                        ? `${rubberFarm.rubberFarmId}-${inspection.inspectionId}`
                        : rubberFarm.rubberFarmId
                    }
                    className="p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-900">
                        RF{rubberFarm.rubberFarmId.toString().padStart(5, "0")}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}
                      >
                        {statusInfo.text}
                      </span>
                    </div>

                    <div className="mt-2 space-y-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">ที่ตั้ง</span>
                        <span className="text-sm text-gray-700">
                          {rubberFarm.villageName}, หมู่ {rubberFarm.moo},{" "}
                          {rubberFarm.district}, {rubberFarm.province}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">วันที่ยื่นคำขอ</span>
                        <span className="text-sm text-gray-700">
                          {formatThaiDate(rubberFarm.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">
                          กำหนดวันตรวจประเมิน
                        </span>
                        <span className="text-sm text-gray-700">
                          {inspection && inspection.inspectionDateAndTime
                            ? formatThaiDate(inspection.inspectionDateAndTime)
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </FarmerLayout>
  );
}