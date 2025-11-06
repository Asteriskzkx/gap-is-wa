import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

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
  version?: number;
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

export function useInspectionSummary(
  inspectionId: string | string[] | undefined
) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [inspection, setInspection] = useState<InspectionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingResult, setSavingResult] = useState(false);
  const [selectedResult, setSelectedResult] = useState<string>("");

  // Fetch inspection summary data
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (!inspectionId) return;

    const fetchInspectionSummary = async () => {
      try {
        setLoading(true);

        // Fetch inspection data
        const response = await fetch(`/api/v1/inspections/${inspectionId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch inspection data");
        }

        const inspectionData = await response.json();

        // Fetch inspection type if missing
        if (
          inspectionData.inspectionTypeId &&
          !inspectionData.inspectionType?.typeName
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
  }, [inspectionId, status, router]);

  // Calculate requirements summary and determine result
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

  // Submit final result handler
  const submitFinalResult = useCallback(async () => {
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
            result: selectedResult,
            version: inspection.version,
          }),
        }
      );

      if (response.ok) {
        const updatedInspection = await response.json();
        setInspection({ ...inspection, version: updatedInspection.version });
        toast.success("บันทึกผลการประเมินเรียบร้อยแล้ว");
        router.push("/auditor/reports");
      } else if (response.status === 409) {
        const errorData = await response.json();
        toast.error(
          errorData.userMessage ||
            "ข้อมูลถูกแก้ไขโดยผู้ใช้อื่นแล้ว กรุณาโหลดข้อมูลใหม่และลองอีกครั้ง",
          { duration: 5000 }
        );
        globalThis.location.reload();
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
  }, [inspection, selectedResult, router]);

  return {
    inspection,
    loading,
    savingResult,
    selectedResult,
    setSelectedResult,
    submitFinalResult,
    session,
    status,
  };
}
