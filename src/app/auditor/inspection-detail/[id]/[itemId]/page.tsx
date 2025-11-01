"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaCheck, FaTimes, FaArrowLeft } from "react-icons/fa";
import AuditorLayout from "@/components/layout/AuditorLayout";

interface Inspection {
  inspectionId: number;
  inspectionNo: number;
  inspectionDateAndTime: string;
  inspectionTypeId: number;
  inspectionStatus: string;
  inspectionResult: string;
  auditorChiefId: number;
  rubberFarmId: number;
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
}

interface InspectionItem {
  inspectionItemId: number;
  inspectionId: number;
  inspectionItemMasterId: number;
  inspectionItemNo: number;
  inspectionItemResult: string;
  otherConditions: any;
  inspectionItemMaster?: {
    itemNo: number;
    itemName: string;
  };
  requirements?: Requirement[];
}

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

export default function AuditorInspectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [inspectionItem, setInspectionItem] = useState<InspectionItem | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params && params.id && params.itemId) {
      setInspectionId(params.id as string);
      setItemId(params.itemId as string);

      fetchInspectionData(params.id as string, params.itemId as string);
    }
  }, [params]);

  const fetchInspectionData = async (inspectionId: string, itemId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch inspection data
      const inspectionResponse = await fetch(
        `/api/v1/inspections/${inspectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!inspectionResponse.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลการตรวจประเมินได้");
      }

      const inspectionData = await inspectionResponse.json();

      // Ensure inspectionType exists
      if (
        inspectionData.inspectionTypeId &&
        (!inspectionData.inspectionType || !inspectionData.inspectionType.typeName)
      ) {
        const typesResponse = await fetch(`/api/v1/inspections/types`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (typesResponse.ok) {
          const typesData = await typesResponse.json();
          const matchingType = typesData.find(
            (type: any) => type.inspectionTypeId === inspectionData.inspectionTypeId
          );
          if (matchingType) {
            inspectionData.inspectionType = { typeName: matchingType.typeName };
          }
        }
      }

      setInspection(inspectionData);

      // Fetch farm details
      if (inspectionData.rubberFarmId) {
        const farmResponse = await fetch(
          `/api/v1/rubber-farms/${inspectionData.rubberFarmId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (farmResponse.ok) {
          const farmData = await farmResponse.json();
          if (farmData && !farmData.farmer && farmData.farmerId) {
            const farmerResponse = await fetch(
              `/api/v1/farmers/${farmData.farmerId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (farmerResponse.ok) {
              const farmerData = await farmerResponse.json();
              farmData.farmer = farmerData;
            }
          }
          setInspection((prev) => (prev ? { ...prev, rubberFarm: farmData } : prev));
        }
      }

      // Fetch items and select current item
      const itemsResponse = await fetch(
        `/api/v1/inspection-items?inspectionId=${inspectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!itemsResponse.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลรายการตรวจประเมินได้");
      }
      const itemsData = await itemsResponse.json();
      const selectedItem = itemsData.find((item: any) => item.inspectionItemId.toString() === itemId);
      if (!selectedItem) {
        throw new Error("ไม่พบรายการตรวจที่ต้องการ");
      }
      setInspectionItem(selectedItem);
    } catch (error) {
      console.error("Error fetching inspection data:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const renderAdditionalFields = () => {
    if (!inspectionItem) return null;
    const itemName = inspectionItem?.inspectionItemMaster?.itemName || "";
    const otherConditions = inspectionItem?.otherConditions || {};

    switch (itemName) {
      case "น้ำ":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">ข้อมูลเพิ่มเติม</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แหล่งน้ำที่ใช้ในแปลงปลูก
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                  {otherConditions.waterSource || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  น้ำที่ใช้ในการหลังการเก็บเกี่ยว
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                  {otherConditions.postHarvestWaterSource || "-"}
                </div>
              </div>
            </div>
          </div>
        );
      case "พื้นที่ปลูก":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">ข้อมูลเพิ่มเติม</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สภาพพื้นที่ปลูก</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                {otherConditions.topography === "อื่นๆ"
                  ? `อื่นๆ: ${otherConditions.topographyOther || ""}`
                  : otherConditions.topography || "-"}
              </div>
            </div>
          </div>
        );
      case "วัตถุอันตรายทางการเกษตร":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">ข้อมูลเพิ่มเติม</h3>
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  id="no-hazardous-materials"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  checked={otherConditions.noHazardousMaterials === "true"}
                  disabled
                />
                <label htmlFor="no-hazardous-materials" className="ml-2 block text-sm text-gray-900">
                  ไม่ได้ใช้วัตถุอันตรายทางการเกษตรในการผลิต
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AuditorLayout>
        <div className="flex justify-center items-center min-h-[60vh] bg-secondary">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AuditorLayout>
    );
  }

  return (
    <AuditorLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">รายละเอียดการตรวจประเมิน</h1>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <FaArrowLeft className="mr-2" />
            กลับไปหน้าสรุปผล
          </button>
        </div>

        {inspection && (
          <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500">รหัสการตรวจประเมิน</h2>
                <p className="mt-1 text-lg font-medium text-gray-900">{inspection.inspectionNo}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">วันที่นัดหมาย</h2>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {new Date(inspection.inspectionDateAndTime).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">ประเภทการตรวจ</h2>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {inspection.inspectionType?.typeName || "-"}
                </p>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <h2 className="text-sm font-medium text-gray-500">พื้นที่สวนยาง</h2>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {inspection.rubberFarm?.villageName || "-"}, {inspection.rubberFarm?.district || "-"}, {inspection.rubberFarm?.province || "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {inspectionItem && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              รายการที่ {inspectionItem.inspectionItemNo} : {inspectionItem.inspectionItemMaster?.itemName || ""}
            </h2>

            <div className="mt-4">
              <div
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                  inspectionItem.inspectionItemResult === "ผ่าน"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <span className="mr-1.5">
                  {inspectionItem.inspectionItemResult === "ผ่าน" ? (
                    <FaCheck className="inline-block" />
                  ) : (
                    <FaTimes className="inline-block" />
                  )}
                </span>
                ผลการประเมิน: {inspectionItem.inspectionItemResult}
              </div>
            </div>
          </div>

          {inspectionItem.requirements && inspectionItem.requirements.length > 0 ? (
            <div className="mb-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">ข้อกำหนด</h3>

              {inspectionItem.requirements
                .sort((a, b) => a.requirementNo - b.requirementNo)
                .map((requirement) => (
                  <div key={requirement.requirementId} className="p-4 border rounded-md bg-gray-50">
                    <div className="mb-2">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              requirement.requirementMaster?.requirementLevel === "ข้อกำหนดหลัก"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {requirement.requirementMaster?.requirementLevel || ""}
                            {requirement.requirementMaster?.requirementLevelNo
                              ? ` ${requirement.requirementMaster.requirementLevelNo}`
                              : ""}
                          </span>
                        </div>
                        <h4 className="ml-2 text-md font-medium text-gray-900">
                          {requirement.requirementNo}. {requirement.requirementMaster?.requirementName || ""}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ผลการตรวจประเมิน</label>
                        <div
                          className={`w-full px-3 py-2 border rounded-md ${
                            requirement.evaluationResult === "ใช่"
                              ? "bg-green-50 border-green-200 text-green-700"
                              : requirement.evaluationResult === "ไม่ใช่"
                              ? "bg-red-50 border-red-200 text-red-700"
                              : requirement.evaluationResult === "NA"
                              ? "bg-gray-100 border-gray-200 text-gray-700"
                              : "bg-gray-100 border-gray-300 text-gray-700"
                          }`}
                        >
                          {requirement.evaluationResult || "ไม่มีข้อมูล"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">วิธีการตรวจประเมิน</label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                          {requirement.evaluationMethod || "ไม่มีข้อมูล"}
                        </div>
                      </div>

                      {requirement.note && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">บันทึกเพิ่มเติม</label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 min-h-[80px]">
                            {requirement.note || "-"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">ไม่พบข้อกำหนดสำหรับรายการนี้</p>
          )}

          {renderAdditionalFields()}

          <div className="flex justify-center mt-8">
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700"
            >
              <FaArrowLeft className="inline-block mr-2" />
              กลับไปหน้าสรุปผล
            </button>
          </div>
        </div>
      )}
    </AuditorLayout>
  );
}
