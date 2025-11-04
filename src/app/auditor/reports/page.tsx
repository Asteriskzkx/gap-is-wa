"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FaSearch,
  FaHistory,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import AuditorLayout from "@/components/layout/AuditorLayout";

interface Inspection {
  inspectionId: number;
  inspectionNo: number;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  auditorChiefId: number;
  rubberFarmId: number;
  rubberFarm?: {
    villageName: string;
    district: string;
    province: string;
    farmer?: {
      namePrefix: string;
      firstName: string;
      lastName: string;
    };
  };
}

export default function AuditorReportsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("pending"); // pending, completed

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        // ตรวจสอบว่า session พร้อมใช้งาน
        if (status === "loading") {
          return;
        }

        if (status === "unauthenticated" || !session) {
          router.push("/");
          return;
        }

        setLoading(true);

        // ดึง auditorId จาก session
        const auditorId = session.user.roleData?.auditorId;
        if (!auditorId) {
          console.error("ไม่พบข้อมูล Auditor");
          setInspections([]);
          setLoading(false);
          return;
        }

        // ดึงรายการตรวจประเมินที่เกี่ยวข้องกับ Auditor คนนี้โดยตรง (filter ที่ server)
        // API จะ filter ทั้งกรณีเป็นหัวหน้าผู้ตรวจ (auditorChiefId) และเป็นผู้ตรวจในทีม (AuditorInspection)
        const inspectionsResponse = await fetch(
          `/api/v1/inspections?auditorId=${auditorId}&limit=1000&offset=0`
        );

        if (!inspectionsResponse.ok) {
          throw new Error("ไม่สามารถดึงรายการตรวจประเมินได้");
        }

        const data = await inspectionsResponse.json();
        const assignedInspections = data.results || [];

        setInspections(assignedInspections);
      } catch (error) {
        console.error("Error fetching assigned inspections:", error);
        setInspections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, [router, session, status]);

  const filteredInspections = inspections.filter((inspection) => {
    // กรองตาม tab ที่เลือก
    if (currentTab === "pending") {
      if (
        inspection.inspectionStatus !== "ตรวจประเมินแล้ว" ||
        inspection.inspectionResult !== "รอผลการตรวจประเมิน"
      ) {
        return false;
      }
    } else if (currentTab === "completed") {
      if (inspection.inspectionResult === "รอผลการตรวจประเมิน") {
        return false;
      }
    }

    // กรองตามคำค้นหา
    const searchLower = searchTerm.toLowerCase();
    const inspectionNo =
      inspection.inspectionNo?.toString().toLowerCase() || "";
    const farmerName = inspection.rubberFarm?.farmer
      ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`.toLowerCase()
      : "";
    const location = [
      inspection.rubberFarm?.villageName || "",
      inspection.rubberFarm?.district || "",
      inspection.rubberFarm?.province || "",
    ]
      .join(" ")
      .toLowerCase();
    const date = new Date(inspection.inspectionDateAndTime)
      .toLocaleDateString("th-TH")
      .toLowerCase();

    return (
      inspectionNo.includes(searchLower) ||
      farmerName.includes(searchLower) ||
      location.includes(searchLower) ||
      date.includes(searchLower)
    );
  });

  return (
    <AuditorLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            สรุปผลการตรวจประเมิน
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            จัดการและสรุปผลการตรวจประเมินสวนยางพารา
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="relative rounded-md mb-4 sm:mb-0 sm:max-w-xs w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder="ค้นหาการตรวจประเมิน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex space-x-2 sm:space-x-4">
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentTab === "pending"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setCurrentTab("pending")}
                >
                  <FaHistory className="inline mr-1" />
                  รอสรุปผล
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentTab === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setCurrentTab("completed")}
                >
                  <FaCheckCircle className="inline mr-1" />
                  เสร็จสิ้น
                </button>
              </div>
            </div>

            {/* Inspection List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <>
                {/* มุมมองแบบตาราง - แสดงบนจอขนาดใหญ่ */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            เลขที่
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            เกษตรกร
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            สถานที่
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            วันที่ตรวจ
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            สถานะ
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            จัดการ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInspections.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                              <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">
                                {currentTab === "pending"
                                  ? "ไม่พบรายการตรวจประเมินที่รอสรุปผล"
                                  : "ไม่พบรายการตรวจประเมินที่เสร็จสิ้น"}
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredInspections.map((inspection) => (
                            <tr
                              key={inspection.inspectionId}
                              className="hover:bg-gray-50 cursor-pointer"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {inspection.inspectionNo}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {inspection.rubberFarm?.farmer
                                  ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`
                                  : "ไม่มีข้อมูล"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {[
                                  inspection.rubberFarm?.villageName,
                                  inspection.rubberFarm?.district,
                                  inspection.rubberFarm?.province,
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(
                                  inspection.inspectionDateAndTime
                                ).toLocaleDateString("th-TH", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${
                      inspection.inspectionResult === "รอผลการตรวจประเมิน"
                        ? "bg-yellow-100 text-yellow-800"
                        : inspection.inspectionResult === "ผ่าน"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                                >
                                  {inspection.inspectionResult ===
                                  "รอผลการตรวจประเมิน"
                                    ? "รอสรุปผล"
                                    : inspection.inspectionResult === "ผ่าน"
                                    ? "ผ่าน"
                                    : "ไม่ผ่าน"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/auditor/inspection-summary/${inspection.inspectionId}`
                                    )
                                  }
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  {inspection.inspectionResult ===
                                  "รอผลการตรวจประเมิน"
                                    ? "สรุปผล"
                                    : "ดูรายละเอียด"}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* มุมมองแบบการ์ด - แสดงบนอุปกรณ์มือถือ */}
                <div className="md:hidden space-y-4">
                  {filteredInspections.length === 0 ? (
                    <div className="text-center py-12">
                      <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        {currentTab === "pending"
                          ? "ไม่พบรายการตรวจประเมินที่รอสรุปผล"
                          : "ไม่พบรายการตรวจประเมินที่เสร็จสิ้น"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {filteredInspections.map((inspection) => (
                        <div
                          key={inspection.inspectionId}
                          className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                          onClick={() =>
                            router.push(
                              `/auditor/inspection-summary/${inspection.inspectionId}`
                            )
                          }
                        >
                          <div className="flex justify-between items-start">
                            <div className="text-sm font-medium text-gray-900">
                              เลขที่: {inspection.inspectionNo}
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
              ${
                inspection.inspectionResult === "รอผลการตรวจประเมิน"
                  ? "bg-yellow-100 text-yellow-800"
                  : inspection.inspectionResult === "ผ่าน"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
                            >
                              {inspection.inspectionResult ===
                              "รอผลการตรวจประเมิน"
                                ? "รอสรุปผล"
                                : inspection.inspectionResult === "ผ่าน"
                                ? "ผ่าน"
                                : "ไม่ผ่าน"}
                            </span>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-medium">
                              เกษตรกร:{" "}
                              <span className="font-normal text-gray-900">
                                {inspection.rubberFarm?.farmer
                                  ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`
                                  : "ไม่มีข้อมูล"}
                              </span>
                            </p>

                            <p className="text-sm font-medium mt-1">
                              สถานที่:{" "}
                              <span className="font-normal text-gray-600">
                                {[
                                  inspection.rubberFarm?.villageName,
                                  inspection.rubberFarm?.district,
                                  inspection.rubberFarm?.province,
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              </span>
                            </p>

                            <p className="text-sm font-medium mt-1">
                              วันที่ตรวจ:{" "}
                              <span className="font-normal text-gray-600">
                                {new Date(
                                  inspection.inspectionDateAndTime
                                ).toLocaleDateString("th-TH", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </p>
                          </div>

                          <div className="mt-4 flex justify-end">
                            <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                              {inspection.inspectionResult ===
                              "รอผลการตรวจประเมิน"
                                ? "สรุปผล →"
                                : "ดูรายละเอียด →"}
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="text-center text-xs text-gray-500 italic mt-2">
                        กดที่รายการเพื่อดูรายละเอียด
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AuditorLayout>
  );
}
