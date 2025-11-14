import { useCallback, useState } from "react";

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
  completeInspection: (inspectionId: number) => Promise<boolean>;
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
            alert(
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
        // Save requirements using evaluation endpoint และ update version
        if (currentItem.requirements) {
          for (let i = 0; i < currentItem.requirements.length; i++) {
            const req = currentItem.requirements[i];
            console.log(`Saving requirement ${i + 1}:`, req.requirementId);

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
        console.log(`Saving inspection item:`, currentItem.inspectionItemId);
        const itemResponse = await fetch(
          `/api/v1/inspection-items/${currentItem.inspectionItemId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              otherConditions: currentItem.otherConditions,
              inspectionItemResult: determineItemResult(currentItem),
              version: currentItem.version,
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

        console.log("Save completed successfully");
        return true;
      } catch (error) {
        console.error("Error saving item:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
        let savedCount = 0;
        let errorCount = 0;

        // วนลูปบันทึกทุกรายการตรวจ
        for (
          let itemIndex = 0;
          itemIndex < inspectionItems.length;
          itemIndex++
        ) {
          const item = inspectionItems[itemIndex];

          console.log(
            `Processing item ${itemIndex + 1}/${inspectionItems.length}:`,
            {
              inspectionItemId: item.inspectionItemId,
              itemNo: item.inspectionItemMaster?.itemNo,
            }
          );

          // Validate requirements
          if (item.requirements) {
            let hasIncompleteReq = false;
            for (const req of item.requirements) {
              if (!req.evaluationResult || !req.evaluationMethod) {
                console.warn(
                  `Item ${
                    itemIndex + 1
                  } has incomplete requirements, skipping...`
                );
                hasIncompleteReq = true;
                break;
              }
            }
            if (hasIncompleteReq) {
              continue;
            }
          }

          try {
            // Save requirements
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
                  throw new Error(
                    `บันทึกข้อกำหนดไม่สำเร็จ (item ${itemIndex + 1})`
                  );
                }

                const updatedReq = await response.json();
                setInspectionItems((prev) => {
                  const updated = [...prev];
                  if (updated[itemIndex]?.requirements?.[i]) {
                    updated[itemIndex].requirements![i].version =
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
              throw new Error(
                `บันทึกรายการตรวจไม่สำเร็จ (item ${itemIndex + 1})`
              );
            }

            const updatedItem = await itemResponse.json();
            setInspectionItems((prev) => {
              const updated = [...prev];
              if (updated[itemIndex]) {
                updated[itemIndex].version = updatedItem.version;
              }
              return updated;
            });

            savedCount++;
            console.log(`✓ Item ${itemIndex + 1} saved successfully`);
          } catch (error) {
            console.error(`✗ Error saving item ${itemIndex + 1}:`, error);
            errorCount++;
          }
        }

        console.log(`Save summary: ${savedCount} saved, ${errorCount} errors`);

        if (savedCount === 0) {
          alert("ไม่มีรายการที่สามารถบันทึกได้ กรุณากรอกข้อมูลให้ครบถ้วน");
          return false;
        }

        if (errorCount > 0) {
          alert(
            `บันทึกสำเร็จ ${savedCount} รายการ, มีข้อผิดพลาด ${errorCount} รายการ`
          );
        } else if (savedCount > 0) {
          alert(`บันทึกสำเร็จทั้งหมด ${savedCount} รายการ`);
        }

        return true;
      } catch (error) {
        console.error("Error in saveAllItems:", error);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [inspectionItems, setInspectionItems]
  );

  const completeInspection = useCallback(
    async (inspectionId: number): Promise<boolean> => {
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
