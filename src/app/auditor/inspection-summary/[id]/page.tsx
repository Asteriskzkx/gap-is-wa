"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FaCheck, FaTimes } from "react-icons/fa";
import AuditorLayout from "@/components/layout/AuditorLayout";

interface Requirement {
  requirementId: number;
  requirementNo: number;
  evaluationResult: string;
  evaluationMethod: string;
  note: string;
  requirementMaster?: {
    requirementName: string;
    requirementLevel: string;
    requirementLevelNo: string;
  };
}
interface InspectionSummary {
  inspectionId: number;
  inspectionNo: number;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  inspectionTypeId: number;
  auditorChiefId: number;
  rubberFarmId: number;
  version?: number; // เพิ่ม version field
  inspectionType?: {
    typeName: string;
  };
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
  items?: InspectionItemSummary[];
}

interface InspectionItemSummary {
  inspectionItemId: number;
  inspectionItemNo: number;
  inspectionItemResult: string;
  inspectionItemMaster?: {
    itemNo: number;
    itemName: string;
  };
  requirements?: Requirement[];
  requirementsSummary?: {
    total: number;
    passed: number;
    failed: number;
    mainRequirementsFailed: number;
  };
}

export default function AuditorInspectionSummaryPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [inspection, setInspection] = useState<InspectionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingResult, setSavingResult] = useState(false);
  const [selectedResult, setSelectedResult] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status !== "authenticated") return;

    const inspectionId = params.id;
    if (!inspectionId) return;

    const fetchInspectionSummary = async () => {
      try {
        setLoading(true);

        // Fetch inspection data - use the same approach as in AuditorInspectionPage
        const response = await fetch(`/api/v1/inspections/${inspectionId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch inspection data");
        }

        const inspectionData = await response.json();

        // Fetch inspection type if missing
        if (
          inspectionData.inspectionTypeId &&
          (!inspectionData.inspectionType ||
            !inspectionData.inspectionType.typeName)
        ) {
          const typesResponse = await fetch(`/api/v1/inspections/types`);

          if (typesResponse.ok) {
            const typesData = await typesResponse.json();
            const matchingType = typesData.find(
              (type: any) =>
                type.inspectionTypeId === inspectionData.inspectionTypeId
            );

            if (matchingType) {
              inspectionData.inspectionType = {
                typeName: matchingType.typeName,
              };
            }
          }
        }

        setInspection(inspectionData);

        // Fetch inspection items
        const itemsResponse = await fetch(
          `/api/v1/inspection-items?inspectionId=${inspectionId}`
        );

        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json();

          setInspection((prevData) => {
            if (!prevData) return prevData;
            return {
              ...prevData,
              items: itemsData,
            };
          });

          const shouldPass = !itemsData?.some(
            (item: InspectionItemSummary) =>
              item.inspectionItemResult === "ไม่ผ่าน"
          );
          setSelectedResult(shouldPass ? "PASS" : "FAIL");
        }

        // Fetch rubber farm details if available
        if (inspectionData.rubberFarmId) {
          const farmResponse = await fetch(
            `/api/v1/rubber-farms/${inspectionData.rubberFarmId}`
          );

          if (farmResponse.ok) {
            const farmData = await farmResponse.json();

            // Fetch farmer details if not included
            if (farmData && !farmData.farmer && farmData.farmerId) {
              const farmerResponse = await fetch(
                `/api/v1/farmers/${farmData.farmerId}`
              );

              if (farmerResponse.ok) {
                const farmerData = await farmerResponse.json();
                farmData.farmer = farmerData;
              }
            }

            setInspection((prevData) => {
              if (!prevData) return prevData;
              return {
                ...prevData,
                rubberFarm: farmData,
              };
            });
          }
        }
      } catch (error) {
        console.error("Error fetching inspection summary:", error);
        toast.error("ไม่สามารถดึงข้อมูลการตรวจประเมินได้");
      } finally {
        setLoading(false);
      }
    };

    fetchInspectionSummary();
  }, [params.id, status, router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!inspection?.items) return;

    const mainRequirements = inspection.items.flatMap(
      (item) =>
        item.requirements?.filter(
          (req) => req.requirementMaster?.requirementLevel === "ข้อกำหนดหลัก"
        ) || []
    );

    const mainRequirementsTotal = mainRequirements.length;
    const mainRequirementsPassed = mainRequirements.filter(
      (req) => req.evaluationResult === "ใช่"
    ).length;
    const mainRequirementsFailed =
      mainRequirementsTotal - mainRequirementsPassed;

    const secondaryRequirements = inspection.items.flatMap(
      (item) =>
        item.requirements?.filter(
          (req) => req.requirementMaster?.requirementLevel === "ข้อกำหนดรอง"
        ) || []
    );

    const secondaryRequirementsTotal = secondaryRequirements.length;
    const secondaryRequirementsPassed = secondaryRequirements.filter(
      (req) => req.evaluationResult === "ใช่"
    ).length;

    const secondaryCompliancePercentage =
      secondaryRequirementsTotal > 0
        ? Math.round(
            (secondaryRequirementsPassed / secondaryRequirementsTotal) * 100
          )
        : 0;

    const isMainRequirementsPassed = mainRequirementsFailed === 0;
    const isSecondaryRequirementsPassed = secondaryCompliancePercentage >= 60;
    const isPassed = isMainRequirementsPassed && isSecondaryRequirementsPassed;

    setSelectedResult(isPassed ? "ผ่าน" : "ไม่ผ่าน");
  }, [inspection?.items]);

  const submitFinalResult = async () => {
    if (!inspection) return;

    try {
      setSavingResult(true);

      const response = await fetch(
        `/api/v1/inspections/${inspection.inspectionId}/result`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            result: selectedResult, // เปลี่ยนจาก inspectionResult เป็น result
            version: inspection.version, // ส่ง version
          }),
        }
      );

      if (response.ok) {
        const updatedInspection = await response.json();
        // อัพเดต version ใหม่
        setInspection({ ...inspection, version: updatedInspection.version });
        toast.success("บันทึกผลการประเมินเรียบร้อยแล้ว");
        router.push("/auditor/reports");
      } else if (response.status === 409) {
        // Handle optimistic lock conflict
        const errorData = await response.json();
        toast.error(
          errorData.userMessage ||
            "ข้อมูลถูกแก้ไขโดยผู้ใช้อื่นแล้ว กรุณาโหลดข้อมูลใหม่และลองอีกครั้ง",
          { duration: 5000 }
        );
        // Refresh inspection data
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message ||
            "ไม่สามารถบันทึกผลการประเมินได้ กรุณาลองใหม่อีกครั้ง"
        );
      }
    } catch (error) {
      console.error("Error submitting final result:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกผลการประเมิน");
    } finally {
      setSavingResult(false);
    }
  };

  if (loading) {
    return (
      <AuditorLayout>
        <div className="flex justify-center items-center min-h-[60vh] bg-secondary">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
        </div>
      </AuditorLayout>
    );
  }

  return (
    <AuditorLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            สรุปผลการตรวจประเมิน
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            กรุณาตรวจสอบข้อมูลและสรุปผลการประเมินสวนยางพารา
          </p>
        </div>

        {inspection && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold">ข้อมูลทั่วไป</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">เลขที่การตรวจประเมิน</p>
                  <p className="font-medium">{inspection.inspectionNo}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">วันที่ตรวจประเมิน</p>
                  <p className="font-medium">
                    {new Date(
                      inspection.inspectionDateAndTime
                    ).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">ชื่อเกษตรกร</p>
                  <p className="font-medium">
                    {inspection.rubberFarm?.farmer
                      ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`
                      : "ไม่มีข้อมูล"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">สถานที่</p>
                  <p className="font-medium">
                    {[
                      inspection.rubberFarm?.villageName,
                      inspection.rubberFarm?.district,
                      inspection.rubberFarm?.province,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">ประเภทการตรวจประเมิน</p>
                  <p className="font-medium">
                    {inspection.inspectionType?.typeName || "ไม่มีข้อมูล"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold mb-4">
                ผลการตรวจประเมินรายหัวข้อ
              </h2>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ลำดับ
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        รายการตรวจประเมิน
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        ผลการประเมิน
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        รายละเอียด
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inspection.items
                      ?.slice()
                      .sort((a, b) => a.inspectionItemNo - b.inspectionItemNo)
                      .map((item) => (
                        <tr
                          key={item.inspectionItemId}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.inspectionItemNo}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.inspectionItemMaster?.itemName ||
                              `รายการที่ ${item.inspectionItemNo}`}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.inspectionItemResult === "ผ่าน"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.inspectionItemResult === "ผ่าน" ? (
                                <FaCheck className="mr-1" />
                              ) : (
                                <FaTimes className="mr-1" />
                              )}
                              {item.inspectionItemResult}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 text-sm"
                              onClick={() =>
                                router.push(
                                  `/auditor/inspection-detail/${inspection.inspectionId}/${item.inspectionItemId}`
                                )
                              }
                            >
                              ดูรายละเอียด
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-4">
                {inspection.items
                  ?.slice()
                  .sort((a, b) => a.inspectionItemNo - b.inspectionItemNo)
                  .map((item) => (
                    <div
                      key={item.inspectionItemId}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          ลำดับที่ {item.inspectionItemNo}
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.inspectionItemResult === "ผ่าน"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.inspectionItemResult === "ผ่าน" ? (
                            <FaCheck className="mr-1" />
                          ) : (
                            <FaTimes className="mr-1" />
                          )}
                          {item.inspectionItemResult}
                        </span>
                      </div>

                      <div className="text-sm text-gray-900 mb-3">
                        {item.inspectionItemMaster?.itemName ||
                          `รายการที่ ${item.inspectionItemNo}`}
                      </div>

                      <button
                        className="w-full py-2 px-4 border border-indigo-300 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() =>
                          router.push(
                            `/auditor/inspection-detail/${inspection.inspectionId}/${item.inspectionItemId}`
                          )
                        }
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold mb-4 text-center">
                สรุปผลการตรวจประเมิน
              </h2>

              <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
                <h3 className="text-base font-semibold mb-4 text-center">
                  ผลการ{inspection.inspectionType?.typeName || "ไม่มีข้อมูล"}
                </h3>

                {(() => {
                  const mainRequirements =
                    inspection.items?.flatMap(
                      (item) =>
                        item.requirements?.filter(
                          (req) =>
                            req.requirementMaster?.requirementLevel ===
                            "ข้อกำหนดหลัก"
                        ) || []
                    ) || [];

                  const mainRequirementsTotal = mainRequirements.length;
                  const mainRequirementsPassed = mainRequirements.filter(
                    (req) => req.evaluationResult === "ใช่"
                  ).length;
                  const mainRequirementsFailed =
                    mainRequirementsTotal - mainRequirementsPassed;

                  const secondaryRequirements =
                    inspection.items?.flatMap(
                      (item) =>
                        item.requirements?.filter(
                          (req) =>
                            req.requirementMaster?.requirementLevel ===
                            "ข้อกำหนดรอง"
                        ) || []
                    ) || [];

                  const secondaryRequirementsTotal =
                    secondaryRequirements.length;
                  const secondaryRequirementsPassed =
                    secondaryRequirements.filter(
                      (req) => req.evaluationResult === "ใช่"
                    ).length;
                  const secondaryRequirementsFailed =
                    secondaryRequirementsTotal - secondaryRequirementsPassed;

                  const secondaryCompliancePercentage =
                    secondaryRequirementsTotal > 0
                      ? Math.round(
                          (secondaryRequirementsPassed /
                            secondaryRequirementsTotal) *
                            100
                        )
                      : 0;

                  const isMainRequirementsPassed = mainRequirementsFailed === 0;
                  const isSecondaryRequirementsPassed =
                    secondaryCompliancePercentage >= 60;
                  const isPassed =
                    isMainRequirementsPassed && isSecondaryRequirementsPassed;

                  return (
                    <div className="space-y-4 text-sm">
                      <div className="mb-2">
                        <p className="mb-3">
                          ข้อกำหนดหลัก {mainRequirementsTotal} ข้อ (100%)
                        </p>
                        <p className="mb-3">
                          ข้อกำหนดรอง {secondaryRequirementsTotal} ข้อ ผ่าน{" "}
                          {secondaryRequirementsPassed} ข้อ ไม่ผ่าน{" "}
                          {secondaryRequirementsFailed} ข้อ (ต้องผ่านอย่างน้อย 7
                          ข้อ)
                        </p>
                        <p className="mb-3">
                          เกณฑ์ต้องผ่านข้อกำหนดรองไม่น้อยกว่า 60%
                        </p>
                      </div>

                      <div className="border-t border-b py-4">
                        <p className="font-semibold">
                          สูตร: สอดคล้องกับข้อกำหนดรอง =
                        </p>
                        <div className="flex flex-col items-center my-2">
                          <div className="border-b border-black text-center px-2">
                            จำนวนข้อกำหนดรองที่ผ่าน X 100
                          </div>
                          <div className="text-center px-2">
                            จำนวนข้อกำหนดรองทั้งหมด
                          </div>
                        </div>
                        <p className="font-semibold mt-2">
                          = {secondaryRequirementsPassed} x 100 /{" "}
                          {secondaryRequirementsTotal} ={" "}
                          {secondaryCompliancePercentage}%
                        </p>
                      </div>

                      <div className="flex justify-center space-x-12 mt-6">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5"
                            checked={isPassed}
                            disabled
                          />
                          <span>ผ่านการตรวจประเมิน</span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5"
                            checked={!isPassed}
                            disabled
                          />
                          <span>ไม่ผ่านการตรวจประเมิน</span>
                        </label>
                      </div>
                      <p className="mt-2 text-sm text-gray-500 text-center">
                        ผลการประเมินถูกกำหนดอัตโนมัติตามเกณฑ์การผ่านของข้อกำหนดหลักและข้อกำหนดรอง
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 mt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-3 sm:mb-0 order-2 sm:order-1"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={submitFinalResult}
                disabled={savingResult}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 order-1 sm:order-2"
              >
                {savingResult ? "กำลังบันทึก..." : "บันทึกผลการประเมิน"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AuditorLayout>
  );
}
