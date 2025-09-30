"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import FarmerLayout from "@/components/layout/FarmerLayout";
import { ChevronRightIcon, DangerIcon, EditIcon, PlusIcon, TextClipboardIcon, TrashIcon } from "@/components/icons";

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

export default function FarmerDashboardPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  // Navigation menu items for action cards
  const navItems = [
    {
      title: "ยื่นขอใบรับรองแหล่งผลิต",
      href: "/farmer/applications/new",
      icon: <PlusIcon className="h-6 w-6" />,
    },
    {
      title: "ติดตามสถานะการรับรอง",
      href: "/farmer/applications",
      icon: <TextClipboardIcon className="h-6 w-6" />,
    },
    {
      title: "ขอแก้ไขข้อมูลใบรับรองแหล่งผลิต",
      href: "/farmer/applications/edit",
      icon: <EditIcon className="h-6 w-6" />,
    },
    {
      title: "ขอยกเลิกใบรับรองแหล่งผลิต",
      href: "/farmer/applications/cancel",
      icon: <TrashIcon className="h-6 w-6" />,
    },
  ];

  useEffect(() => {
    // Fetch applications data
    const fetchApplicationsData = async () => {
      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem("token");

        if (token) {
          // First get farmer data to get farmerId
          const farmerResponse = await fetch("/api/v1/farmers/current", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (farmerResponse.ok) {
            const farmerData = await farmerResponse.json();
            await fetchApplications(token, farmerData);
          } else {
            setApplicationsLoading(false);
          }
        } else {
          setApplicationsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching applications data:", error);
        setApplicationsLoading(false);
      }
    };

    const fetchApplications = async (token: string, farmerData: any) => {
      try {
        const allFarmsResponse = await fetch("/api/v1/rubber-farms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (allFarmsResponse.ok) {
          const allFarms = await allFarmsResponse.json();
          // Filter farms that belong to the current farmer
          const farms = allFarms.filter(
            (farm: any) => farm.farmerId === farmerData.farmerId
          );
          await processRubberFarms(farms, token);
        } else {
          setApplicationsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setApplicationsLoading(false);
      }
    };

    const processRubberFarms = async (farms: RubberFarm[], token: string) => {
      if (!farms || !token) {
        setApplicationsLoading(false);
        return;
      }

      const allApplicationItems: ApplicationItem[] = [];

      for (const farm of farms) {
        try {
          const inspectionsResponse = await fetch(
            `/api/v1/inspections?rubberFarmId=${farm.rubberFarmId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (inspectionsResponse.ok) {
            const inspections = await inspectionsResponse.json();

            if (inspections.length > 0) {
              // Sort inspections by date (newest first)
              const sortedInspections = inspections.sort(
                (a: Inspection, b: Inspection) =>
                  new Date(b.inspectionDateAndTime).getTime() -
                  new Date(a.inspectionDateAndTime).getTime()
              );

              // Add each inspection as a separate application item
              sortedInspections.forEach((inspection: Inspection) => {
                allApplicationItems.push({
                  rubberFarm: farm,
                  inspection: inspection,
                });
              });
            } else {
              // If no inspections, add just the farm
              allApplicationItems.push({ rubberFarm: farm });
            }
          } else {
            // If error fetching inspections, add just the farm
            allApplicationItems.push({ rubberFarm: farm });
          }
        } catch (error) {
          console.error(
            `Error fetching inspections for farm ${farm.rubberFarmId}:`,
            error
          );
          allApplicationItems.push({ rubberFarm: farm });
        }
      }

      // Sort all application items by createdAt date (newest first)
      const sortedApplications = allApplicationItems.sort(
        (a, b) =>
          new Date(b.rubberFarm.createdAt).getTime() -
          new Date(a.rubberFarm.createdAt).getTime()
      );

      // Take only the 5 most recent applications
      setApplications(sortedApplications.slice(0, 5));
      setApplicationsLoading(false);
    };

    fetchApplicationsData();
  }, []);

  const formatThaiDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
    const hasInspectionDate =
      inspection.inspectionDateAndTime &&
      new Date(inspection.inspectionDateAndTime) > new Date(0);
    const inspectionDateInFuture =
      hasInspectionDate &&
      new Date(inspection.inspectionDateAndTime) > new Date();

    const status = inspection.inspectionStatus;
    const result = inspection.inspectionResult;

    if (
      status === "รอการตรวจประเมิน" &&
      hasInspectionDate &&
      inspectionDateInFuture
    ) {
      return {
        text: "รอการตรวจประเมิน",
        color: "bg-blue-100 text-blue-800",
      };
    } else if (status === "ตรวจประเมินแล้ว") {
      if (result === "รอผลการตรวจประเมิน") {
        return {
          text: "ตรวจประเมินแล้ว รอสรุปผล",
          color: "bg-purple-100 text-purple-800",
        };
      } else if (result === "ผ่าน") {
        return {
          text: "ผ่านการรับรอง",
          color: "bg-green-100 text-green-800",
        };
      } else if (result === "ไม่ผ่าน") {
        return {
          text: "ไม่ผ่านการรับรอง",
          color: "bg-red-100 text-red-800",
        };
      }
    }

    return {
      text: status || "ไม่ทราบสถานะ",
      color: "bg-gray-100 text-gray-800",
    };
  };

  return (
    <FarmerLayout>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">หน้าหลัก</h1>
        <p className="mt-1 text-sm text-gray-500">
          ยินดีต้อนรับสู่ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
        </p>
      </div>

      {/* Action Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {navItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <Link href={item.href} className="block">
              <div className="flex flex-col h-full">
                <div
                  className={`p-3 rounded-full mb-4 w-12 h-12 flex items-center justify-center ${
                    index === 0
                      ? "bg-green-100 text-green-600"
                      : index === 1
                      ? "bg-orange-100 text-orange-600"
                      : index === 2
                      ? "bg-blue-100 text-blue-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 flex-grow">
                  {index === 0
                    ? "ยื่นคำขอรับรองแหล่งผลิตยางพาราตามมาตรฐาน GAP"
                    : index === 1
                    ? "ตรวจสอบสถานะคำขอและผลการรับรองแหล่งผลิต"
                    : index === 2
                    ? "ขอแก้ไขข้อมูลใบรับรองแหล่งผลิตที่ได้รับการอนุมัติแล้ว"
                    : "ขอยกเลิกใบรับรองแหล่งผลิตที่ไม่ต้องการใช้งาน"}
                </p>
                <div className="mt-4 flex items-center text-green-600 font-medium text-sm">
                  <span>เข้าสู่เมนู</span>
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Status Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            สถานะการรับรองล่าสุด
          </h2>
          <Link
            href="/farmer/applications"
            className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center"
          >
            ดูทั้งหมด
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {applicationsLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
            <DangerIcon className="h-6 w-6 text-yellow-500 mr-3 mt-0.5 flex-shrink-0"/>
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
        ) : (
          <>
            {/* Desktop view - Table layout */}
            <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        รหัสสวน
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ที่ตั้ง
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        กำหนดตรวจประเมิน
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
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
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            RF
                            {rubberFarm.rubberFarmId
                              .toString()
                              .padStart(5, "0")}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {rubberFarm.villageName}, หมู่ {rubberFarm.moo},{" "}
                            {rubberFarm.district}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {inspection && inspection.inspectionDateAndTime
                              ? formatThaiDate(
                                  inspection.inspectionDateAndTime
                                )
                              : "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
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
            </div>

            {/* Mobile view - Card layout */}
            <div className="md:hidden space-y-3">
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
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">
                        RF
                        {rubberFarm.rubberFarmId.toString().padStart(5, "0")}
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

                      {inspection && inspection.inspectionDateAndTime && (
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

                      {inspection && inspection.inspectionNo && (
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
              })}
            </div>
          </>
        )}
      </div>
    </FarmerLayout>
  );
}