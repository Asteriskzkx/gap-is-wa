import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

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

export function useInspectionDetail(
  inspectionIdParam: string | string[] | undefined,
  itemIdParam: string | string[] | undefined
) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [inspectionItem, setInspectionItem] = useState<InspectionItem | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Fetch all inspection data
  const fetchInspectionData = useCallback(
    async (inspectionId: string, itemId: string) => {
      try {
        setLoading(true);

        // Fetch inspection data
        const inspectionResponse = await fetch(
          `/api/v1/inspections/${inspectionId}`
        );

        if (!inspectionResponse.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลการตรวจประเมินได้");
        }

        const inspectionData = await inspectionResponse.json();

        // Ensure inspectionType exists
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

        // Fetch farm details
        if (inspectionData.rubberFarmId) {
          const farmResponse = await fetch(
            `/api/v1/rubber-farms/${inspectionData.rubberFarmId}`
          );
          if (farmResponse.ok) {
            const farmData = await farmResponse.json();
            if (farmData && !farmData.farmer && farmData.farmerId) {
              const farmerResponse = await fetch(
                `/api/v1/farmers/${farmData.farmerId}`
              );
              if (farmerResponse.ok) {
                const farmerData = await farmerResponse.json();
                farmData.farmer = farmerData;
              }
            }
            setInspection((prev) =>
              prev ? { ...prev, rubberFarm: farmData } : prev
            );
          }
        }

        // Fetch items and select current item
        const itemsResponse = await fetch(
          `/api/v1/inspection-items?inspectionId=${inspectionId}`
        );
        if (!itemsResponse.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลรายการตรวจประเมินได้");
        }
        const itemsData = await itemsResponse.json();
        const selectedItem = itemsData.find(
          (item: any) => item.inspectionItemId.toString() === itemId
        );
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
    },
    []
  );

  // Initialize from params
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (inspectionIdParam && itemIdParam) {
      const insId = inspectionIdParam as string;
      const itmId = itemIdParam as string;
      setInspectionId(insId);
      setItemId(itmId);
      fetchInspectionData(insId, itmId);
    }
  }, [inspectionIdParam, itemIdParam, status, router, fetchInspectionData]);

  return {
    inspectionId,
    itemId,
    inspection,
    inspectionItem,
    loading,
    session,
    status,
  };
}
