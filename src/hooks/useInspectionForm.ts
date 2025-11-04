import { useState, useCallback } from "react";

export interface Requirement {
  requirementId: number;
  requirementNo: number;
  evaluationResult: string;
  evaluationMethod: string;
  note: string;
  version?: number;
  requirementMaster?: {
    requirementName: string;
    requirementLevel: string;
    requirementLevelNo: string;
  };
}

export interface InspectionItem {
  inspectionItemId: number;
  inspectionId: number;
  inspectionItemMasterId: number;
  inspectionItemNo: number;
  inspectionItemResult: string;
  otherConditions: any;
  version?: number;
  inspectionItemMaster?: {
    itemNo: number;
    itemName: string;
  };
  requirements?: Requirement[];
}

interface UseInspectionFormReturn {
  inspectionItems: InspectionItem[];
  setInspectionItems: React.Dispatch<React.SetStateAction<InspectionItem[]>>;
  currentItemIndex: number;
  setCurrentItemIndex: React.Dispatch<React.SetStateAction<number>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  updateRequirementEvaluation: (
    itemIndex: number,
    requirementIndex: number,
    field: string,
    value: string
  ) => void;
  updateOtherConditions: (
    itemIndex: number,
    field: string,
    value: string
  ) => void;
  validateCurrentItem: () => boolean;
  saveCurrentItem: (inspectionId: number) => Promise<boolean>;
  completeInspection: (inspectionId: number) => Promise<boolean>;
}

export function useInspectionForm(): UseInspectionFormReturn {
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const updateRequirementEvaluation = useCallback(
    (
      itemIndex: number,
      requirementIndex: number,
      field: string,
      value: string
    ) => {
      setInspectionItems((prev) => {
        const updated = [...prev];
        const item = updated[itemIndex];

        if (item?.requirements?.[requirementIndex]) {
          item.requirements[requirementIndex] = {
            ...item.requirements[requirementIndex],
            [field]: value,
          };
        }

        return updated;
      });
    },
    []
  );

  const updateOtherConditions = useCallback(
    (itemIndex: number, field: string, value: string) => {
      setInspectionItems((prev) => {
        const updated = [...prev];
        updated[itemIndex].otherConditions = {
          ...updated[itemIndex].otherConditions,
          [field]: value,
        };
        return updated;
      });
    },
    []
  );

  const validateCurrentItem = useCallback((): boolean => {
    const item = inspectionItems[currentItemIndex];
    if (!item?.requirements) return true;

    for (const req of item.requirements) {
      if (!req.evaluationResult || !req.evaluationMethod) {
        alert(
          `กรุณากรอกข้อมูลให้ครบถ้วน: ${
            req.requirementMaster?.requirementName || "ข้อกำหนด"
          }`
        );
        return false;
      }
    }

    return true;
  }, [inspectionItems, currentItemIndex]);

  const saveCurrentItem = useCallback(
    async (inspectionId: number): Promise<boolean> => {
      if (!validateCurrentItem()) return false;

      const item = inspectionItems[currentItemIndex];
      if (!item) return false;

      setSaving(true);
      try {
        // Save requirements using evaluation endpoint และ update version
        if (item.requirements) {
          for (let i = 0; i < item.requirements.length; i++) {
            const req = item.requirements[i];
            const response = await fetch(
              `/api/v1/requirements/${req.requirementId}/evaluation`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  evaluationResult: req.evaluationResult,
                  evaluationMethod: req.evaluationMethod,
                  note: req.note || "",
                  version: req.version || 0,
                }),
              }
            );

            if (!response.ok) {
              throw new Error("บันทึกข้อกำหนดไม่สำเร็จ");
            }

            // Update version จาก response
            const updatedReq = await response.json();
            setInspectionItems((prev) => {
              const updated = [...prev];
              if (updated[currentItemIndex]?.requirements?.[i]) {
                updated[currentItemIndex].requirements[i].version =
                  updatedReq.version;
              }
              return updated;
            });
          }
        }

        // Save inspection item
        const itemResponse = await fetch(
          `/api/v1/inspection-items/${item.inspectionItemId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              otherConditions: item.otherConditions,
              inspectionItemResult: determineItemResult(item),
              version: item.version,
            }),
          }
        );

        if (!itemResponse.ok) {
          throw new Error("บันทึกรายการตรวจไม่สำเร็จ");
        }

        // Update inspection item version
        const updatedItem = await itemResponse.json();
        setInspectionItems((prev) => {
          const updated = [...prev];
          if (updated[currentItemIndex]) {
            updated[currentItemIndex].version = updatedItem.version;
          }
          return updated;
        });

        return true;
      } catch (error) {
        console.error("Error saving item:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [inspectionItems, currentItemIndex, validateCurrentItem, setInspectionItems]
  );

  const completeInspection = useCallback(
    async (inspectionId: number): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/v1/inspections/${inspectionId}/status`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "ตรวจประเมินแล้ว",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("จบการตรวจประเมินไม่สำเร็จ");
        }

        return true;
      } catch (error) {
        console.error("Error completing inspection:", error);
        alert("เกิดข้อผิดพลาดในการจบการตรวจประเมิน");
        return false;
      }
    },
    []
  );

  return {
    inspectionItems,
    setInspectionItems,
    currentItemIndex,
    setCurrentItemIndex,
    saving,
    setSaving,
    updateRequirementEvaluation,
    updateOtherConditions,
    validateCurrentItem,
    saveCurrentItem,
    completeInspection,
  };
}

// Helper function - กำหนดผลการตรวจของรายการตรวจ
function determineItemResult(item: InspectionItem): string {
  if (!item.requirements || item.requirements.length === 0) {
    return "ผ่าน";
  }

  // กรองเฉพาะข้อกำหนดหลัก
  const mainRequirements = item.requirements.filter(
    (req) => req.requirementMaster?.requirementLevel === "ข้อกำหนดหลัก"
  );

  // ถ้ามีข้อกำหนดหลักที่ไม่ผ่าน = ไม่ผ่าน
  const hasFailedMain = mainRequirements.some(
    (req) => req.evaluationResult === "ไม่ผ่าน"
  );

  return hasFailedMain ? "ไม่ผ่าน" : "ผ่าน";
}
