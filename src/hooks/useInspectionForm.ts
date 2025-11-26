import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

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
  updateOtherConditions: (itemIndex: number, field: string, value: any) => void;
  validateCurrentItem: () => boolean;
  saveCurrentItem: (inspectionId: number) => Promise<boolean>;
  saveAllItems: (inspectionId: number) => Promise<boolean>;
  completeInspection: (
    inspectionId: number,
    version?: number
  ) => Promise<boolean>;
}

export function useInspectionForm(): UseInspectionFormReturn {
  const [inspectionItems, setInspectionItemsRaw] = useState<InspectionItem[]>(
    []
  );
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // Helper function to sort requirements
  const sortRequirements = useCallback(
    (items: InspectionItem[]): InspectionItem[] => {
      return items.map((item) => ({
        ...item,
        requirements: item.requirements
          ? [...item.requirements].sort(
              (a, b) => (a.requirementNo || 0) - (b.requirementNo || 0)
            )
          : item.requirements,
      }));
    },
    []
  );

  // Wrapper function to ensure requirements are always sorted
  const setInspectionItems = useCallback(
    (value: React.SetStateAction<InspectionItem[]>) => {
      setInspectionItemsRaw((prev) => {
        const newItems = typeof value === "function" ? value(prev) : value;
        return sortRequirements(newItems);
      });
    },
    [sortRequirements]
  );

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
    [setInspectionItems]
  );

  const updateOtherConditions = useCallback(
    (itemIndex: number, field: string, value: any) => {
      setInspectionItems((prev) => {
        const updated = [...prev];
        updated[itemIndex].otherConditions = {
          ...updated[itemIndex].otherConditions,
          [field]: value,
        };
        return updated;
      });
    },
    [setInspectionItems]
  );

  const validateCurrentItem = useCallback((): boolean => {
    const item = inspectionItems[currentItemIndex];
    if (!item?.requirements) return true;

    for (const req of item.requirements) {
      if (!req.evaluationResult || !req.evaluationMethod) {
        toast.error(
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
      console.log("saveCurrentItem called:", {
        inspectionId,
        currentItemIndex,
      });

      // ใช้ state ล่าสุดแทนการใช้ closure
      const currentItem = inspectionItems[currentItemIndex];
      if (!currentItem) {
        console.error("Current item not found at index:", currentItemIndex);
        return false;
      }

      console.log("Current item to save:", {
        inspectionItemId: currentItem.inspectionItemId,
        itemNo: currentItem.inspectionItemMaster?.itemNo,
        otherConditions: currentItem.otherConditions,
      });

      // Validate
      if (currentItem.requirements) {
        for (const req of currentItem.requirements) {
          if (!req.evaluationResult || !req.evaluationMethod) {
            toast.error(
              `กรุณากรอกข้อมูลให้ครบถ้วน: ${
                req.requirementMaster?.requirementName || "ข้อกำหนด"
              }`
            );
            return false;
          }
        }
      }

      setSaving(true);
      try {
        // Batch save requirements for current item
        if (currentItem.requirements && currentItem.requirements.length > 0) {
          const reqPayload = currentItem.requirements.map((r) => ({
            requirementId: r.requirementId,
            evaluationResult: r.evaluationResult,
            evaluationMethod: r.evaluationMethod,
            note: r.note || "",
            version: r.version,
          }));

          console.log(
            "Sending batch requirements payload for current item:",
            reqPayload
          );

          const response = await fetch(`/api/v1/requirements/evaluation`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqPayload),
          });

          if (!response.ok) {
            throw new Error("บันทึกข้อกำหนดไม่สำเร็จ");
          }

          const json = await response.json();
          // Update versions from returned updated array
          for (const u of json.updated || []) {
            setInspectionItems((prev) => {
              const updated = [...prev];
              const idx = updated.findIndex(
                (it) => it.inspectionItemId === currentItem.inspectionItemId
              );
              if (idx !== -1 && updated[idx].requirements) {
                const rIdx = updated[idx].requirements.findIndex(
                  (rr) => rr.requirementId === u.requirementId
                );
                if (rIdx !== -1) {
                  updated[idx].requirements[rIdx].version = u.version;
                }
              }
              return updated;
            });
          }

          if (json.errors && json.errors.length > 0) {
            console.warn("Some requirement updates had errors:", json.errors);
            toast.error("มีข้อผิดพลาดในการบันทึกข้อกำหนดบางรายการ");
            // proceed but notify
          }
        }

        // Save inspection item via batch endpoint (single-element array)
        const itemPayload = [
          {
            inspectionItemId: currentItem.inspectionItemId,
            result: determineItemResult(currentItem),
            version: currentItem.version,
            otherConditions: currentItem.otherConditions,
          },
        ];

        const itemResponse = await fetch(
          `/api/v1/inspection-items/evaluation`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemPayload),
          }
        );

        if (!itemResponse.ok) {
          throw new Error("บันทึกรายการตรวจไม่สำเร็จ");
        }

        const itemJson = await itemResponse.json();
        for (const u of itemJson.updated || []) {
          setInspectionItems((prev) => {
            const updated = [...prev];
            const idx = updated.findIndex(
              (it) => it.inspectionItemId === u.inspectionItemId
            );
            if (idx !== -1) {
              updated[idx].version = u.version;
            }
            return updated;
          });
        }

        console.log("Save completed successfully");
        return true;
      } catch (error) {
        console.error("Error saving item:", error);
        toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [inspectionItems, currentItemIndex, setInspectionItems]
  );

  // ฟังก์ชันบันทึกทุกรายการที่มีการแก้ไข
  const saveAllItems = useCallback(
    async (inspectionId: number): Promise<boolean> => {
      console.log("saveAllItems called for all items");
      setSaving(true);

      try {
        const reqPayload: any[] = [];
        const itemPayload: any[] = [];

        // Build payloads by validating each item
        for (const item of inspectionItems) {
          // Validate requirements
          if (item.requirements && item.requirements.length > 0) {
            const hasIncomplete = item.requirements.some(
              (r) => !r.evaluationResult || !r.evaluationMethod
            );
            if (hasIncomplete) {
              // skip this item
              continue;
            }

            for (const r of item.requirements) {
              reqPayload.push({
                requirementId: r.requirementId,
                evaluationResult: r.evaluationResult,
                evaluationMethod: r.evaluationMethod,
                note: r.note || "",
                version: r.version,
              });
            }
          }

          // Add inspection item update
          itemPayload.push({
            inspectionItemId: item.inspectionItemId,
            result: determineItemResult(item),
            version: item.version,
            otherConditions: item.otherConditions,
          });
        }

        if (reqPayload.length === 0 && itemPayload.length === 0) {
          toast.error(
            "ไม่มีรายการที่สามารถบันทึกได้ กรุณากรอกข้อมูลให้ครบถ้วน"
          );
          return false;
        }

        // Send requirements batch first
        if (reqPayload.length > 0) {
          const resp = await fetch(`/api/v1/requirements/evaluation`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqPayload),
          });

          if (!resp.ok) {
            throw new Error("บันทึกข้อกำหนดไม่สำเร็จ");
          }

          const json = await resp.json();
          // Update versions for requirements
          for (const u of json.updated || []) {
            setInspectionItems((prev) => {
              const updated = prev.map((it) => ({ ...it }));
              for (const it of updated) {
                if (!it.requirements) continue;
                const rIdx = it.requirements.findIndex(
                  (rr) => rr.requirementId === u.requirementId
                );
                if (rIdx !== -1) {
                  it.requirements[rIdx].version = u.version;
                }
              }
              return updated;
            });
          }

          if (json.errors && json.errors.length > 0) {
            console.warn("Some requirement updates failed:", json.errors);
            toast.error("มีข้อผิดพลาดในการบันทึกข้อกำหนดบางรายการ");
          }
        }

        // Send inspection items batch
        if (itemPayload.length > 0) {
          const resp2 = await fetch(`/api/v1/inspection-items/evaluation`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemPayload),
          });

          if (!resp2.ok) {
            throw new Error("บันทึกรายการตรวจไม่สำเร็จ");
          }

          const json2 = await resp2.json();
          for (const u of json2.updated || []) {
            setInspectionItems((prev) => {
              const updated = prev.map((it) => ({ ...it }));
              const idx = updated.findIndex(
                (it) => it.inspectionItemId === u.inspectionItemId
              );
              if (idx !== -1) {
                updated[idx].version = u.version;
              }
              return updated;
            });
          }

          if (json2.errors && json2.errors.length > 0) {
            console.warn("Some inspection item updates failed:", json2.errors);
            toast.error("มีข้อผิดพลาดในการบันทึกรายการตรวจบางรายการ");
          }
        }

        toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
        return true;
      } catch (error) {
        console.error("Error in saveAllItems:", error);
        toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [inspectionItems, setInspectionItems]
  );

  const completeInspection = useCallback(
    async (inspectionId: number, version?: number): Promise<boolean> => {
      try {
        const saved = await saveAllItems(inspectionId);

        if (!saved) {
          return false;
        }

        const response = await fetch(
          `/api/v1/inspections/${inspectionId}/status`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "ตรวจประเมินแล้ว",
              version: version,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("จบการตรวจประเมินไม่สำเร็จ");
        }

        return true;
      } catch (error) {
        console.error("Error completing inspection:", error);
        toast.error("เกิดข้อผิดพลาดในการจบการตรวจประเมิน");
        return false;
      }
    },
    [saveAllItems]
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
    saveAllItems,
    completeInspection,
  };
}

// Helper function - กำหนดผลการตรวจของรายการตรวจ
function determineItemResult(item: InspectionItem): string {
  if (
    item.inspectionItemMaster?.itemNo === 3 &&
    item.otherConditions?.notUsingHazardous
  ) {
    return "ผ่าน";
  }

  if (!item.requirements || item.requirements.length === 0) {
    return "ผ่าน";
  }

  // If any requirement is still pending / not evaluated, treat the whole item as NOT_EVALUATED
  const hasNotEvaluated = item.requirements.some(
    (req) =>
      req.evaluationMethod === "PENDING" &&
      req.evaluationResult === "NOT_EVALUATED"
  );
  if (hasNotEvaluated) return "NOT_EVALUATED";

  // กรองเฉพาะข้อกำหนดหลัก
  const mainRequirements = item.requirements.filter(
    (req) => req.requirementMaster?.requirementLevel === "ข้อกำหนดหลัก"
  );

  // ถ้ามีข้อกำหนดหลักที่ไม่ผ่าน = ไม่ผ่าน
  const hasFailedMain = mainRequirements.some(
    (req) => req.evaluationResult === "ไม่ใช่"
  );

  return hasFailedMain ? "ไม่ผ่าน" : "ผ่าน";
}
