"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function AuditorInspectionsPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ดึงรายการตรวจประเมินที่รอดำเนินการ
  useEffect(() => {
    fetchPendingInspections();
  }, []);

  const fetchPendingInspections = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/inspections", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // กรองเฉพาะที่มีสถานะ "รอการตรวจประเมิน"
        const pendingInspections = data.filter(
          (inspection: Inspection) =>
            inspection.inspectionStatus === "รอการตรวจประเมิน"
        );
        setInspections(pendingInspections);
      }
    } catch (error) {
      console.error("Error fetching inspections:", error);
    } finally {
      setLoading(false);
    }
  };

  // ดึงรายการตรวจของ inspection ที่เลือก
  const fetchInspectionItems = async (inspectionId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/v1/inspection-items?inspectionId=${inspectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched inspection items:", data);

        // ตรวจสอบว่าแต่ละ item มี requirements หรือไม่
        data.forEach((item: any, index: number) => {
          console.log(
            `Item ${index + 1} requirements:`,
            item.requirements?.length || 0
          );
        });

        setInspectionItems(data);
      }
    } catch (error) {
      console.error("Error fetching inspection items:", error);
    }
  };

  // เลือก inspection เพื่อเริ่มตรวจ
  const selectInspection = async (inspection: Inspection) => {
    setSelectedInspection(inspection);
    await fetchInspectionItems(inspection.inspectionId);
    setCurrentItemIndex(0);
  };

  // ตรวจสอบความสมบูรณ์ของข้อมูล
  const validateCurrentItem = (): boolean => {
    const item = inspectionItems[currentItemIndex];
    if (!item || !item.requirements) return false;

    // ตรวจสอบว่าทุก requirement มีผลการประเมิน
    for (const req of item.requirements) {
      if (!req.evaluationResult || req.evaluationResult === "NOT_EVALUATED") {
        alert("กรุณาเลือกผลการตรวจประเมินให้ครบทุกข้อกำหนด");
        return false;
      }

      if (!req.evaluationMethod || req.evaluationMethod === "PENDING") {
        alert("กรุณาเลือกวิธีการตรวจประเมินให้ครบทุกข้อกำหนด");
        return false;
      }
    }

    return true;
  };

  // อัปเดตผลการประเมินข้อกำหนด
  const updateRequirementEvaluation = (
    itemIndex: number,
    requirementIndex: number,
    field: string,
    value: string
  ) => {
    const updatedItems = [...inspectionItems];
    const item = updatedItems[itemIndex];

    if (item.requirements && item.requirements[requirementIndex]) {
      // Debug: แสดงการอัพเดท
      console.log(
        `Updating requirement ${requirementIndex} - ${field}: ${value}`
      );

      // สร้าง object ใหม่เพื่อให้ React detect การเปลี่ยนแปลง
      item.requirements[requirementIndex] = {
        ...item.requirements[requirementIndex],
        [field]: value,
      };

      // อัพเดท state
      setInspectionItems(updatedItems);

      // Debug: ตรวจสอบหลังอัพเดท
      console.log("Updated requirements:", item.requirements);
    } else {
      console.error(`Cannot find requirement at index ${requirementIndex}`);
    }
  };

  // อัปเดตข้อมูลเพิ่มเติม
  const updateOtherConditions = (
    itemIndex: number,
    field: string,
    value: string
  ) => {
    const updatedItems = [...inspectionItems];
    updatedItems[itemIndex].otherConditions = {
      ...updatedItems[itemIndex].otherConditions,
      [field]: value,
    };
    setInspectionItems(updatedItems);
  };

  // ฟังก์ชันสำหรับแสดงข้อมูลเพิ่มเติมตามประเภทรายการตรวจ
  const renderAdditionalFields = (itemIndex: number) => {
    const item = inspectionItems[itemIndex];
    const itemName = item?.inspectionItemMaster?.itemName || "";

    switch (itemName) {
      case "น้ำ":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แหล่งน้ำที่ใช้ในแปลงปลูก
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="เช่น น้ำฝน, น้ำบาดาล, คลองชลประทาน"
                  value={item?.otherConditions?.waterSource || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "waterSource",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        );

      case "พื้นที่ปลูก":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ลักษณะภูมิประเทศ
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={item?.otherConditions?.topography || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "topography",
                      e.target.value
                    )
                  }
                >
                  <option value="">เลือกลักษณะภูมิประเทศ</option>
                  <option value="พื้นที่ราบ">พื้นที่ราบ</option>
                  <option value="พื้นที่ลาดชัน">พื้นที่ลาดชัน</option>
                  <option value="พื้นที่ที่ราบสูง">พื้นที่ที่ราบสูง</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ประวัติการใช้ที่ดิน
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  rows={2}
                  placeholder="ระบุประวัติการใช้ที่ดินย้อนหลัง 2 ปี"
                  value={item?.otherConditions?.landHistory || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "landHistory",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        );

      case "วัตถุอันตรายทางการเกษตร":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  สถานที่เก็บวัตถุอันตราย
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="ระบุสถานที่เก็บวัตถุอันตราย"
                  value={item?.otherConditions?.storageLocation || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "storageLocation",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รายการวัตถุอันตรายที่ใช้
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="ระบุชื่อและปริมาณวัตถุอันตรายที่ใช้"
                  value={item?.otherConditions?.chemicalsList || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "chemicalsList",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        );

      case "การจัดการคุณภาพในกระบวนการผลิตก่อนการเปิดกรีด":
      case "การจัดการคุณภาพในกระบวนการผลิตหลังการเปิดกรีด":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  พันธุ์ยางที่ปลูก
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="ระบุพันธุ์ยาง"
                  value={item?.otherConditions?.rubberVariety || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "rubberVariety",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  การจัดการปุ๋ย
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  rows={2}
                  placeholder="ระบุชนิดและปริมาณปุ๋ยที่ใช้"
                  value={item?.otherConditions?.fertilizerManagement || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "fertilizerManagement",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        );

      case "การเก็บเกี่ยวและการปฏิบัติหลังการเก็บเกี่ยว สำหรับผลิตน้ำยางสด":
      case "การผลิตวัตถุดิบคุณภาพดีและการขนส่งสำหรับผลิตน้ำยางสด":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม - การผลิตน้ำยางสด
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เวลาเริ่มกรีด
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={item?.otherConditions?.tappingStartTime || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "tappingStartTime",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เวลาเก็บน้ำยาง
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={item?.otherConditions?.collectionTime || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "collectionTime",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        );

      case "การเก็บเกี่ยวและการปฏิบัติหลังการเก็บเกี่ยว สำหรับผลิตยางก้อนถ้วย":
      case "การผลิตวัตถุดิบคุณภาพดีและการขนส่งสำหรับผลิตยางก้อนถ้วย":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม - การผลิตยางก้อนถ้วย
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ความเข้มข้นกรดฟอร์มิค (%)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={item?.otherConditions?.acidConcentration || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "acidConcentration",
                      e.target.value
                    )
                  }
                >
                  <option value="">เลือกความเข้มข้น</option>
                  <option value="3">3%</option>
                  <option value="4">4%</option>
                  <option value="5">5%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนมีดกรีด
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="ไม่เกิน 6 มีด"
                  value={item?.otherConditions?.numberOfTaps || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "numberOfTaps",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        );

      case "สุขลักษณะส่วนบุคคล":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อุปกรณ์ป้องกันส่วนบุคคลที่มี
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  rows={2}
                  placeholder="ระบุอุปกรณ์ป้องกันที่มี เช่น หน้ากาก ถุงมือ รองเท้า"
                  value={item?.otherConditions?.ppe || ""}
                  onChange={(e) =>
                    updateOtherConditions(itemIndex, "ppe", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );

      case "การบันทึกและการจัดเก็บข้อมูล":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ระบบการบันทึกข้อมูลที่ใช้
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={item?.otherConditions?.recordSystem || ""}
                  onChange={(e) =>
                    updateOtherConditions(
                      itemIndex,
                      "recordSystem",
                      e.target.value
                    )
                  }
                >
                  <option value="">เลือกระบบการบันทึก</option>
                  <option value="สมุดบันทึก">สมุดบันทึก</option>
                  <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
                  <option value="ระบบออนไลน์">ระบบออนไลน์</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // บันทึกผลการตรวจรายการปัจจุบัน
  const saveCurrentItem = async () => {
    if (!validateCurrentItem()) return;
    if (!selectedInspection || !inspectionItems[currentItemIndex]) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const currentItem = inspectionItems[currentItemIndex];

      // Debug: ตรวจสอบข้อมูล requirements ก่อนส่ง
      console.log("Current item requirements:", currentItem.requirements);
      console.log(
        "Total requirements to save:",
        currentItem.requirements?.length || 0
      );

      // อัปเดต inspection item
      const itemResponse = await fetch(
        `/api/v1/inspection-items/${currentItem.inspectionItemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            inspectionItemResult: determineItemResult(currentItem),
            otherConditions: currentItem.otherConditions || {},
          }),
        }
      );

      if (!itemResponse.ok) {
        const errorData = await itemResponse.json();
        throw new Error(errorData.message || "Failed to save inspection item");
      }

      // อัปเดต requirements แบบ Promise.all เพื่อให้แน่ใจว่าทุกตัวถูกบันทึก
      if (currentItem.requirements && currentItem.requirements.length > 0) {
        const requirementPromises = currentItem.requirements.map(
          async (requirement, index) => {
            // Debug: แสดงข้อมูลแต่ละ requirement
            console.log(`Saving requirement ${index + 1}:`, {
              requirementId: requirement.requirementId,
              evaluationResult: requirement.evaluationResult,
              evaluationMethod: requirement.evaluationMethod,
              note: requirement.note,
            });

            // ข้ามถ้ายังไม่ได้ประเมิน
            if (
              !requirement.evaluationResult ||
              requirement.evaluationResult === "NOT_EVALUATED"
            ) {
              console.log(
                `Skipping requirement ${requirement.requirementId} - not evaluated`
              );
              return null;
            }

            try {
              const reqResponse = await fetch(
                `/api/v1/requirements/${requirement.requirementId}/evaluation`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    evaluationResult: requirement.evaluationResult,
                    evaluationMethod: requirement.evaluationMethod || "PENDING",
                    note: requirement.note || "",
                  }),
                }
              );

              if (!reqResponse.ok) {
                const errorData = await reqResponse.json();
                console.error(
                  `Failed to save requirement ${requirement.requirementId}:`,
                  errorData
                );
                throw new Error(
                  `Failed to save requirement ${requirement.requirementId}: ${errorData.message}`
                );
              }

              const savedData = await reqResponse.json();
              console.log(
                `Successfully saved requirement ${requirement.requirementId}:`,
                savedData
              );
              return savedData;
            } catch (error) {
              console.error(
                `Error saving requirement ${requirement.requirementId}:`,
                error
              );
              throw error;
            }
          }
        );

        // รอให้ทุก requirement ถูกบันทึก
        const results = await Promise.all(requirementPromises);
        const successCount = results.filter((r) => r !== null).length;
        console.log(`Successfully saved ${successCount} requirements`);

        if (successCount === 0) {
          throw new Error("ไม่สามารถบันทึกข้อกำหนดได้เลย");
        }
      }

      alert("บันทึกผลการตรวจรายการนี้เรียบร้อยแล้ว");

      // ไปรายการถัดไป
      if (currentItemIndex < inspectionItems.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
      }
    } catch (error) {
      console.error("Error saving inspection item:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก: " + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // กำหนดผลการตรวจของรายการตรวจ
  const determineItemResult = (item: InspectionItem): string => {
    if (!item.requirements || item.requirements.length === 0) {
      return "ผ่าน";
    }

    const mainRequirements = item.requirements.filter(
      (req) => req.requirementMaster?.requirementLevel === "ข้อกำหนดหลัก"
    );

    const hasFailedMain = mainRequirements.some(
      (req) => req.evaluationResult === "ไม่ใช่"
    );

    return hasFailedMain ? "ไม่ผ่าน" : "ผ่าน";
  };

  // จบการตรวจประเมิน
  const completeInspection = async () => {
    if (!selectedInspection) return;

    try {
      const token = localStorage.getItem("token");

      // กำหนดผลการตรวจโดยรวม
      const overallResult = inspectionItems.every(
        (item) => determineItemResult(item) === "ผ่าน"
      )
        ? "ผ่าน"
        : "ไม่ผ่าน";

      // อัปเดตสถานะและผลการตรวจ
      const response = await fetch(
        `/api/v1/inspections/${selectedInspection.inspectionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            inspectionStatus: "ตรวจประเมินแล้ว",
            inspectionResult: overallResult,
          }),
        }
      );

      if (response.ok) {
        alert(`การตรวจประเมินเสร็จสิ้น ผลการตรวจ: ${overallResult}`);
        router.push("/auditor/dashboard");
      }
    } catch (error) {
      console.error("Error completing inspection:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกผลการตรวจ");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#EBFFF3]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/auditor/dashboard">
              <Image
                src="/logo_header.png"
                alt="Rubber Authority of Thailand Logo"
                width={180}
                height={180}
                className="mr-2 w-[120px] sm:w-[140px] md:w-[180px]"
              />
            </Link>
          </div>
          <Link
            href="/auditor/dashboard"
            className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="sm:block -ml-1 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="hidden sm:inline">กลับสู่หน้าหลัก</span>
            <span className="sm:hidden">กลับ</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedInspection ? (
          // แสดงรายการตรวจประเมินที่รอดำเนินการ
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              รายการตรวจประเมินที่รอดำเนินการ
            </h1>

            {inspections.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">
                  ไม่มีรายการตรวจประเมินที่รอดำเนินการ
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          เลขที่ตรวจประเมิน
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ประเภทการตรวจ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          เกษตรกร
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานที่
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          วันที่นัดหมาย
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          การดำเนินการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inspections.map((inspection) => (
                        <tr key={inspection.inspectionId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {inspection.inspectionNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {inspection.inspectionType?.typeName || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {inspection.rubberFarm?.farmer ? (
                              <>
                                {inspection.rubberFarm.farmer.namePrefix}
                                {inspection.rubberFarm.farmer.firstName}{" "}
                                {inspection.rubberFarm.farmer.lastName}
                              </>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {inspection.rubberFarm
                              ? `${inspection.rubberFarm.villageName}, ${inspection.rubberFarm.district}, ${inspection.rubberFarm.province}`
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(
                              inspection.inspectionDateAndTime
                            ).toLocaleString("th-TH")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => selectInspection(inspection)}
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                            >
                              เริ่มตรวจประเมิน
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-4">
                  {inspections.map((inspection) => (
                    <div
                      key={inspection.inspectionId}
                      className="bg-white rounded-lg shadow p-4"
                    >
                      <div className="mb-3">
                        <h3 className="font-semibold text-gray-900">
                          เลขที่: {inspection.inspectionNo}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {inspection.inspectionType?.typeName || "N/A"}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            เกษตรกร:{" "}
                          </span>
                          {inspection.rubberFarm?.farmer ? (
                            <span>
                              {inspection.rubberFarm.farmer.namePrefix}
                              {inspection.rubberFarm.farmer.firstName}{" "}
                              {inspection.rubberFarm.farmer.lastName}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">
                            สถานที่:{" "}
                          </span>
                          {inspection.rubberFarm
                            ? `${inspection.rubberFarm.villageName}, ${inspection.rubberFarm.district}`
                            : "N/A"}
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">
                            วันที่:{" "}
                          </span>
                          {new Date(
                            inspection.inspectionDateAndTime
                          ).toLocaleDateString("th-TH")}
                        </div>
                      </div>

                      <button
                        onClick={() => selectInspection(inspection)}
                        className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        เริ่มตรวจประเมิน
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          // แสดงฟอร์มการตรวจประเมิน
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                ตรวจประเมิน: {selectedInspection.inspectionType?.typeName}
              </h1>
              <p className="text-gray-600 mt-1">
                เลขที่ตรวจประเมิน: {selectedInspection.inspectionNo}
              </p>
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">เกษตรกร:</span>{" "}
                  {selectedInspection.rubberFarm?.farmer
                    ? `${selectedInspection.rubberFarm.farmer.namePrefix}${selectedInspection.rubberFarm.farmer.firstName} ${selectedInspection.rubberFarm.farmer.lastName}`
                    : "N/A"}{" "}
                  | <span className="font-medium">สถานที่:</span>{" "}
                  {selectedInspection.rubberFarm
                    ? `${selectedInspection.rubberFarm.villageName}, ${selectedInspection.rubberFarm.district}, ${selectedInspection.rubberFarm.province}`
                    : "N/A"}
                </p>
              </div>
            </div>

            {inspectionItems.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      รายการตรวจที่{" "}
                      {inspectionItems[currentItemIndex]?.inspectionItemNo}:{" "}
                      {
                        inspectionItems[currentItemIndex]?.inspectionItemMaster
                          ?.itemName
                      }
                    </h2>
                    <span className="text-sm text-gray-500">
                      รายการที่ {currentItemIndex + 1} จาก{" "}
                      {inspectionItems.length}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((currentItemIndex + 1) / inspectionItems.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>

                  {/* ข้อมูลเพิ่มเติมตามประเภทรายการตรวจ */}
                  {renderAdditionalFields(currentItemIndex)}

                  {/* ตารางข้อกำหนด for Desktop*/}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th
                            className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700"
                            rowSpan={2}
                          >
                            ข้อกำหนด
                          </th>
                          <th
                            className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700"
                            rowSpan={2}
                          >
                            ระดับข้อกำหนด
                          </th>
                          <th
                            className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700"
                            colSpan={3}
                          >
                            ผลการตรวจประเมิน
                          </th>
                          <th
                            className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700"
                            rowSpan={2}
                          >
                            วิธีการตรวจประเมิน
                          </th>
                          <th
                            className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700"
                            rowSpan={2}
                          >
                            หมายเหตุ
                          </th>
                        </tr>
                        <tr>
                          <th className="border border-gray-300 px-2 py-2 text-center text-sm font-medium text-gray-700">
                            ใช่
                          </th>
                          <th className="border border-gray-300 px-2 py-2 text-center text-sm font-medium text-gray-700">
                            ไม่ใช่
                          </th>
                          <th className="border border-gray-300 px-2 py-2 text-center text-sm font-medium text-gray-700">
                            NA
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {inspectionItems[currentItemIndex]?.requirements?.map(
                          (requirement, reqIndex) => (
                            <tr key={requirement.requirementId}>
                              <td className="border border-gray-300 px-4 py-2 text-sm">
                                <div>
                                  <span className="font-medium">
                                    {
                                      requirement.requirementMaster
                                        ?.requirementLevelNo
                                    }
                                  </span>
                                  <span className="ml-2">
                                    {
                                      requirement.requirementMaster
                                        ?.requirementName
                                    }
                                  </span>
                                </div>
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    requirement.requirementMaster
                                      ?.requirementLevel === "ข้อกำหนดหลัก"
                                      ? "bg-red-100 text-red-800"
                                      : requirement.requirementMaster
                                          ?.requirementLevel === "ข้อกำหนดรอง"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {
                                    requirement.requirementMaster
                                      ?.requirementLevel
                                  }
                                </span>
                              </td>
                              <td className="border border-gray-300 px-2 py-2 text-center">
                                <input
                                  type="radio"
                                  name={`result-${requirement.requirementId}`}
                                  value="ใช่"
                                  checked={
                                    requirement.evaluationResult === "ใช่"
                                  }
                                  onChange={() =>
                                    updateRequirementEvaluation(
                                      currentItemIndex,
                                      reqIndex,
                                      "evaluationResult",
                                      "ใช่"
                                    )
                                  }
                                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                              </td>
                              <td className="border border-gray-300 px-2 py-2 text-center">
                                <input
                                  type="radio"
                                  name={`result-${requirement.requirementId}`}
                                  value="ไม่ใช่"
                                  checked={
                                    requirement.evaluationResult === "ไม่ใช่"
                                  }
                                  onChange={() =>
                                    updateRequirementEvaluation(
                                      currentItemIndex,
                                      reqIndex,
                                      "evaluationResult",
                                      "ไม่ใช่"
                                    )
                                  }
                                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                              </td>
                              <td className="border border-gray-300 px-2 py-2 text-center">
                                <input
                                  type="radio"
                                  name={`result-${requirement.requirementId}`}
                                  value="NA"
                                  checked={
                                    requirement.evaluationResult === "NA"
                                  }
                                  onChange={() =>
                                    updateRequirementEvaluation(
                                      currentItemIndex,
                                      reqIndex,
                                      "evaluationResult",
                                      "NA"
                                    )
                                  }
                                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                <select
                                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                                  value={requirement.evaluationMethod || ""}
                                  onChange={(e) =>
                                    updateRequirementEvaluation(
                                      currentItemIndex,
                                      reqIndex,
                                      "evaluationMethod",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">เลือก</option>
                                  <option value="พินิจ">พินิจ</option>
                                  <option value="สัมภาษณ์">สัมภาษณ์</option>
                                  <option value="วัด">วัด</option>
                                  <option value="ทดสอบ">ทดสอบ</option>
                                </select>
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                                  placeholder="หมายเหตุ"
                                  value={requirement.note || ""}
                                  onChange={(e) =>
                                    updateRequirementEvaluation(
                                      currentItemIndex,
                                      reqIndex,
                                      "note",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards for Requirements */}
                  <div className="md:hidden space-y-4">
                    {inspectionItems[currentItemIndex]?.requirements?.map(
                      (requirement, reqIndex) => (
                        <div
                          key={requirement.requirementId}
                          className="bg-white border rounded-lg p-4"
                        >
                          <div className="mb-3">
                            <span className="text-sm font-semibold text-gray-700">
                              {
                                requirement.requirementMaster
                                  ?.requirementLevelNo
                              }
                            </span>
                            <p className="text-sm text-gray-800 mt-1">
                              {requirement.requirementMaster?.requirementName}
                            </p>
                            <span
                              className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                                requirement.requirementMaster
                                  ?.requirementLevel === "ข้อกำหนดหลัก"
                                  ? "bg-red-100 text-red-800"
                                  : requirement.requirementMaster
                                      ?.requirementLevel === "ข้อกำหนดรอง"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {requirement.requirementMaster?.requirementLevel}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                ผลการตรวจประเมิน
                              </label>
                              <div className="flex space-x-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`mobile-result-${requirement.requirementId}`}
                                    value="ใช่"
                                    checked={
                                      requirement.evaluationResult === "ใช่"
                                    }
                                    onChange={() =>
                                      updateRequirementEvaluation(
                                        currentItemIndex,
                                        reqIndex,
                                        "evaluationResult",
                                        "ใช่"
                                      )
                                    }
                                    className="mr-2 h-4 w-4 text-green-600"
                                  />
                                  <span className="text-sm">ใช่</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`mobile-result-${requirement.requirementId}`}
                                    value="ไม่ใช่"
                                    checked={
                                      requirement.evaluationResult === "ไม่ใช่"
                                    }
                                    onChange={() =>
                                      updateRequirementEvaluation(
                                        currentItemIndex,
                                        reqIndex,
                                        "evaluationResult",
                                        "ไม่ใช่"
                                      )
                                    }
                                    className="mr-2 h-4 w-4 text-green-600"
                                  />
                                  <span className="text-sm">ไม่ใช่</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`mobile-result-${requirement.requirementId}`}
                                    value="NA"
                                    checked={
                                      requirement.evaluationResult === "NA"
                                    }
                                    onChange={() =>
                                      updateRequirementEvaluation(
                                        currentItemIndex,
                                        reqIndex,
                                        "evaluationResult",
                                        "NA"
                                      )
                                    }
                                    className="mr-2 h-4 w-4 text-green-600"
                                  />
                                  <span className="text-sm">NA</span>
                                </label>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                วิธีการตรวจประเมิน
                              </label>
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                                value={requirement.evaluationMethod || ""}
                                onChange={(e) =>
                                  updateRequirementEvaluation(
                                    currentItemIndex,
                                    reqIndex,
                                    "evaluationMethod",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">เลือก</option>
                                <option value="พินิจ">พินิจ</option>
                                <option value="สัมภาษณ์">สัมภาษณ์</option>
                                <option value="วัด">วัด</option>
                                <option value="ทดสอบ">ทดสอบ</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                หมายเหตุ
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
                                placeholder="หมายเหตุ"
                                value={requirement.note || ""}
                                onChange={(e) =>
                                  updateRequirementEvaluation(
                                    currentItemIndex,
                                    reqIndex,
                                    "note",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* ผลการตรวจรายการ */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      ผลการตรวจรายการนี้:
                      <span
                        className={`ml-2 font-semibold ${
                          determineItemResult(
                            inspectionItems[currentItemIndex]
                          ) === "ผ่าน"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {determineItemResult(inspectionItems[currentItemIndex])}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      หมายเหตุ: หากข้อกำหนดหลักใดไม่ผ่าน
                      รายการนี้จะไม่ผ่านการตรวจประเมิน
                    </p>
                  </div>

                  {/* ปุ่มดำเนินการ for desktop and mobile*/}
                  <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
                    <div>
                      {currentItemIndex > 0 && (
                        <button
                          onClick={() =>
                            setCurrentItemIndex(currentItemIndex - 1)
                          }
                          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          รายการก่อนหน้า
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={saveCurrentItem}
                        disabled={saving}
                        className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {saving ? "กำลังบันทึก..." : "บันทึกผลการตรวจ"}
                      </button>
                      {currentItemIndex < inspectionItems.length - 1 ? (
                        <button
                          onClick={() =>
                            setCurrentItemIndex(currentItemIndex + 1)
                          }
                          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          รายการถัดไป
                        </button>
                      ) : (
                        <button
                          onClick={completeInspection}
                          className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          จบการตรวจประเมิน
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Rubber Authority of Thailand Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} การยางแห่งประเทศไทย. สงวนลิขสิทธิ์.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  นโยบายความเป็นส่วนตัว
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  เงื่อนไขการใช้งาน
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  ติดต่อเรา
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
