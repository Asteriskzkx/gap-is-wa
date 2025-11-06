import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

// Interfaces
export interface PlantingDetail {
  plantingDetailId: number;
  specie: string;
  areaOfPlot: number;
  numberOfRubber: number;
  numberOfTapping: number;
  ageOfRubber: number;
  yearOfTapping: string;
  monthOfTapping: string;
  totalProduction: number;
  version?: number;
}

export interface RubberFarm {
  rubberFarmId: number;
  farmerId: number;
  villageName: string;
  moo: number;
  road: string;
  alley: string;
  subDistrict: string;
  district: string;
  province: string;
  provinceId: number;
  amphureId: number;
  tambonId: number;
  version?: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
  plantingDetails: PlantingDetail[];
}

const initialRubberFarm: RubberFarm = {
  rubberFarmId: 0,
  farmerId: 0,
  villageName: "",
  moo: 0,
  road: "",
  alley: "",
  subDistrict: "",
  district: "",
  province: "",
  provinceId: 0,
  amphureId: 0,
  tambonId: 0,
  version: undefined,
  location: {
    type: "Point",
    coordinates: [0, 0],
  },
  plantingDetails: [],
};

export const useRubberFarmEditForm = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [farms, setFarms] = useState<RubberFarm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [isLoadingFarmData, setIsLoadingFarmData] = useState(false);
  const [deletedPlantingDetailIds, setDeletedPlantingDetailIds] = useState<
    number[]
  >([]);

  // Pagination state
  const [farmsPagination, setFarmsPagination] = useState({
    first: 0,
    rows: 10,
    totalRecords: 0,
  });

  // Sort state
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<1 | -1 | 0 | null>(null);
  const [multiSortMeta, setMultiSortMeta] = useState<
    Array<{
      field: string;
      order: 1 | -1 | 0 | null;
    }>
  >([]);

  const [rubberFarm, setRubberFarm] = useState<RubberFarm>(initialRubberFarm);
  const [plantingDetails, setPlantingDetails] = useState<PlantingDetail[]>([]);

  // Check authentication and fetch farmer data
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.user?.roleData?.farmerId) {
      setFarmerId(session.user.roleData.farmerId);
      fetchFarmerFarms(session.user.roleData.farmerId);
    }
  }, [status, session, router]);

  // Fetch farms belonging to the farmer with pagination
  const fetchFarmerFarms = async (
    farmerId: number,
    offset = 0,
    limit = 10,
    sorting?: {
      sortField?: string;
      sortOrder?: string;
      multiSortMeta?: Array<{
        field: string;
        order: number;
      }>;
    }
  ) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        farmerId: farmerId.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (sorting?.sortField) params.append("sortField", sorting.sortField);
      if (sorting?.sortOrder) params.append("sortOrder", sorting.sortOrder);
      if (sorting?.multiSortMeta) {
        const validSortMeta = sorting.multiSortMeta.filter(
          (item) => item.order === 1 || item.order === -1
        );
        if (validSortMeta.length > 0) {
          params.append("multiSortMeta", JSON.stringify(validSortMeta));
        }
      }

      const response = await fetch(
        `/api/v1/rubber-farms?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.results && result.paginator) {
          setFarms(result.results);
          setFarmsPagination({
            first: result.paginator.offset,
            rows: result.paginator.limit,
            totalRecords: result.paginator.total,
          });
        } else {
          setFarms(result);
          setFarmsPagination({
            first: 0,
            rows: 10,
            totalRecords: result.length || 0,
          });
        }
      } else {
        throw new Error("ไม่สามารถดึงข้อมูลสวนยางได้");
      }
    } catch (error) {
      console.error("Error fetching rubber farms:", error);
      setError("ไม่สามารถดึงข้อมูลสวนยางได้");
      setFarms([]);
      setFarmsPagination({ first: 0, rows: 10, totalRecords: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch farm details
  const fetchFarmDetails = async (farmId: number, provinces: any[]) => {
    try {
      setIsLoading(true);
      setIsLoadingFarmData(true);

      const response = await fetch(`/api/v1/rubber-farms/${farmId}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        if (provinces.length === 0) {
          console.warn("Provinces data not loaded yet");
          return;
        }

        const province = provinces.find(
          (p: any) => p.name_th === data.province
        );

        if (!province) {
          setRubberFarm({
            ...data,
            provinceId: 0,
            amphureId: 0,
            tambonId: 0,
          });
          return { amphures: [], tambons: [] };
        }

        const provinceId = province.id;
        const selectedAmphure = province.amphures.find(
          (a: any) => a.name_th === data.district
        );

        if (!selectedAmphure) {
          setRubberFarm({
            ...data,
            provinceId: provinceId,
            amphureId: 0,
            tambonId: 0,
          });
          return { amphures: province.amphures, tambons: [] };
        }

        const amphureId = selectedAmphure.id;
        const selectedTambon = selectedAmphure.tambons.find(
          (t: any) => t.name_th === data.subDistrict
        );
        const tambonId = selectedTambon ? selectedTambon.id : 0;

        // Set farm data
        setTimeout(() => {
          setRubberFarm({
            ...data,
            provinceId: provinceId,
            amphureId: amphureId,
            tambonId: tambonId,
          });
        }, 10);

        // Set planting details with version
        if (data.plantingDetails && data.plantingDetails.length > 0) {
          const correctedDetails = data.plantingDetails.map(
            (detail: PlantingDetail) => ({
              ...detail,
              yearOfTapping: detail.yearOfTapping || new Date().toISOString(),
              monthOfTapping: detail.monthOfTapping || new Date().toISOString(),
              areaOfPlot: Number(detail.areaOfPlot) || 0,
              numberOfRubber: Number(detail.numberOfRubber) || 0,
              numberOfTapping: Number(detail.numberOfTapping) || 0,
              ageOfRubber: Number(detail.ageOfRubber) || 0,
              totalProduction: Number(detail.totalProduction) || 0,
              version: detail.version,
            })
          );
          setPlantingDetails(correctedDetails);
        }

        return {
          amphures: province.amphures,
          tambons: selectedAmphure.tambons,
        };
      } else {
        throw new Error("ไม่สามารถดึงข้อมูลสวนยางได้");
      }
    } catch (error) {
      console.error("Error fetching farm details:", error);
      setError("ไม่สามารถดึงข้อมูลสวนยางได้");
      return { amphures: [], tambons: [] };
    } finally {
      setIsLoading(false);
      setIsLoadingFarmData(false);
    }
  };

  // Update farm data
  const updateFarmData = (name: string, value: string | number) => {
    if (
      name === "provinceId" ||
      name === "amphureId" ||
      name === "tambonId" ||
      name === "moo"
    ) {
      setRubberFarm((prev) => ({
        ...prev,
        [name]: Number(value) || 0,
      }));
    } else {
      setRubberFarm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Update planting detail
  const updatePlantingDetail = (
    index: number,
    field: keyof PlantingDetail,
    value: string | number | Date
  ) => {
    const updatedDetails = [...plantingDetails];

    if (
      field === "areaOfPlot" ||
      field === "numberOfRubber" ||
      field === "numberOfTapping" ||
      field === "ageOfRubber" ||
      field === "totalProduction"
    ) {
      updatedDetails[index][field] = parseFloat(value as string) || 0;
    } else if (field === "specie") {
      updatedDetails[index][field] = String(value);
    } else if (field === "yearOfTapping" || field === "monthOfTapping") {
      try {
        const date = value instanceof Date ? value : new Date(value as string);
        if (!Number.isNaN(date.getTime())) {
          if (field === "yearOfTapping") {
            date.setMonth(0, 1);
          } else {
            date.setDate(1);
          }
          date.setHours(0, 0, 0, 0);
          updatedDetails[index][field] = date.toISOString();
        } else {
          const defaultDate = new Date();
          defaultDate.setHours(0, 0, 0, 0);
          updatedDetails[index][field] = defaultDate.toISOString();
        }
      } catch {
        const defaultDate = new Date();
        defaultDate.setHours(0, 0, 0, 0);
        updatedDetails[index][field] = defaultDate.toISOString();
      }
    }

    setPlantingDetails(updatedDetails);
  };

  // Add new planting detail
  const addPlantingDetail = () => {
    const newDetail: PlantingDetail = {
      plantingDetailId: 0,
      specie: "",
      areaOfPlot: 0,
      numberOfRubber: 0,
      numberOfTapping: 0,
      ageOfRubber: 0,
      yearOfTapping: new Date().toISOString(),
      monthOfTapping: new Date().toISOString(),
      totalProduction: 0,
    };
    setPlantingDetails([...plantingDetails, newDetail]);
  };

  // Remove planting detail
  const removePlantingDetail = (index: number) => {
    const updatedDetails = [...plantingDetails];
    const [removed] = updatedDetails.splice(index, 1);
    if (removed && removed.plantingDetailId && removed.plantingDetailId > 0) {
      setDeletedPlantingDetailIds((prev) => [
        ...prev,
        removed.plantingDetailId,
      ]);
    }
    setPlantingDetails(updatedDetails);
  };

  // Validate farm data
  const validateFarmData = (): boolean => {
    if (
      !rubberFarm.villageName ||
      rubberFarm.moo <= 0 ||
      !rubberFarm.subDistrict ||
      !rubberFarm.district ||
      !rubberFarm.province
    ) {
      setError("กรุณากรอกข้อมูลฟาร์มให้ครบถ้วน");
      return false;
    }
    setError("");
    return true;
  };

  // Validate planting details
  const validatePlantingDetails = (): boolean => {
    const validDetails = plantingDetails.filter(
      (detail) =>
        detail.specie &&
        detail.areaOfPlot > 0 &&
        detail.numberOfRubber > 0 &&
        detail.numberOfTapping >= 0 &&
        detail.ageOfRubber >= 0 &&
        detail.yearOfTapping &&
        detail.monthOfTapping &&
        detail.totalProduction >= 0
    );

    if (validDetails.length === 0) {
      setError("กรุณากรอกข้อมูลรายละเอียดการปลูกอย่างน้อย 1 รายการให้ครบถ้วน");
      return false;
    }

    const incompleteDetails = plantingDetails.filter(
      (detail) =>
        detail.specie &&
        (detail.areaOfPlot <= 0 ||
          detail.numberOfRubber <= 0 ||
          !detail.numberOfTapping ||
          detail.numberOfTapping < 0 ||
          !detail.ageOfRubber ||
          detail.ageOfRubber < 0 ||
          !detail.yearOfTapping ||
          !detail.monthOfTapping ||
          !detail.totalProduction ||
          detail.totalProduction < 0)
    );

    if (incompleteDetails.length > 0) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วนในทุกรายการที่เลือกพันธุ์ยางแล้ว");
      return false;
    }

    setError("");
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError("");

    if (!validatePlantingDetails()) {
      return;
    }

    setIsLoading(true);

    try {
      if (!selectedFarmId) {
        throw new Error("กรุณาเลือกสวนยางที่ต้องการแก้ไข");
      }

      const validPlantingDetails = plantingDetails.filter(
        (detail) =>
          detail.specie && detail.areaOfPlot > 0 && detail.numberOfRubber > 0
      );

      const existingDetails = validPlantingDetails.filter(
        (detail) => detail.plantingDetailId && detail.plantingDetailId > 0
      );
      const newDetails = validPlantingDetails.filter(
        (detail) => !detail.plantingDetailId || detail.plantingDetailId <= 0
      );

      // Update farm
      const farmUpdatePayload: any = {
        villageName: rubberFarm.villageName,
        moo: Number(rubberFarm.moo) || 0,
        road: rubberFarm.road || "",
        alley: rubberFarm.alley || "",
        subDistrict: rubberFarm.subDistrict,
        district: rubberFarm.district,
        province: rubberFarm.province,
        location: rubberFarm.location,
      };

      if (rubberFarm.version !== undefined) {
        farmUpdatePayload.version = rubberFarm.version;
      }

      const farmResponse = await fetch(
        `/api/v1/rubber-farms/${selectedFarmId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(farmUpdatePayload),
        }
      );

      if (farmResponse.status === 409) {
        const errorData = await farmResponse.json();
        toast.error(
          errorData.userMessage ||
            "ข้อมูลถูกแก้ไขโดยผู้ใช้อื่นแล้ว กรุณาโหลดข้อมูลใหม่และลองอีกครั้ง",
          { duration: 5000 }
        );
        setIsLoading(false);
        return;
      }

      if (!farmResponse.ok) {
        const errorData = await farmResponse.json();
        throw new Error(errorData.message || "ไม่สามารถอัปเดตข้อมูลสวนยางได้");
      }

      const updatedFarmData = await farmResponse.json();
      setRubberFarm((prev) => ({
        ...prev,
        version: updatedFarmData.version,
      }));

      // Delete removed planting details
      for (const id of deletedPlantingDetailIds) {
        try {
          await fetch(`/api/v1/planting-details/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
        } catch (err) {
          console.error("Error deleting planting detail:", err);
        }
      }

      // Update existing planting details
      for (const detail of existingDetails) {
        try {
          if (detail.plantingDetailId) {
            const detailUpdatePayload: any = {
              specie: detail.specie,
              areaOfPlot: Number(detail.areaOfPlot),
              numberOfRubber: Number(detail.numberOfRubber),
              numberOfTapping: Number(detail.numberOfTapping) || 0,
              ageOfRubber: Number(detail.ageOfRubber) || 0,
              yearOfTapping: detail.yearOfTapping,
              monthOfTapping: detail.monthOfTapping,
              totalProduction: Number(detail.totalProduction) || 0,
            };

            if (detail.version !== undefined) {
              detailUpdatePayload.version = detail.version;
            }

            const detailResponse = await fetch(
              `/api/v1/planting-details/${detail.plantingDetailId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(detailUpdatePayload),
              }
            );

            if (detailResponse.status === 409) {
              const errorData = await detailResponse.json();
              toast.error(
                errorData.userMessage ||
                  "ข้อมูลรายละเอียดการปลูกถูกแก้ไขโดยผู้ใช้อื่นแล้ว",
                { duration: 5000 }
              );
              setIsLoading(false);
              return;
            }

            if (detailResponse.ok) {
              const updatedDetailData = await detailResponse.json();
              const detailIndex = plantingDetails.findIndex(
                (d) => d.plantingDetailId === detail.plantingDetailId
              );
              if (detailIndex !== -1) {
                const updatedDetails = [...plantingDetails];
                updatedDetails[detailIndex].version = updatedDetailData.version;
                setPlantingDetails(updatedDetails);
              }
            }
          }
        } catch (detailError) {
          console.error("Error with planting detail:", detailError);
        }
      }

      // Create new planting details
      for (const detail of newDetails) {
        try {
          const newDetailPayload = {
            rubberFarmId: selectedFarmId,
            specie: detail.specie,
            areaOfPlot: Number(detail.areaOfPlot),
            numberOfRubber: Number(detail.numberOfRubber),
            numberOfTapping: Number(detail.numberOfTapping) || 0,
            ageOfRubber: Number(detail.ageOfRubber) || 0,
            yearOfTapping: detail.yearOfTapping,
            monthOfTapping: detail.monthOfTapping,
            totalProduction: Number(detail.totalProduction) || 0,
          };

          await fetch(`/api/v1/planting-details`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(newDetailPayload),
          });
        } catch (detailError) {
          console.error("Error with new planting detail:", detailError);
        }
      }

      setSuccess(true);
      toast.success("บันทึกข้อมูลสำเร็จ", { duration: 3000 });

      setTimeout(() => {
        router.push("/farmer/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error updating farm data:", error);
      setError(error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      toast.error(error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rubberFarm,
    setRubberFarm,
    plantingDetails,
    farms,
    selectedFarmId,
    setSelectedFarmId,
    farmsPagination,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    multiSortMeta,
    setMultiSortMeta,
    isLoadingFarmData,
    updateFarmData,
    updatePlantingDetail,
    addPlantingDetail,
    removePlantingDetail,
    validateFarmData,
    validatePlantingDetails,
    fetchFarmerFarms,
    fetchFarmDetails,
    handleSubmit,
    isLoading,
    error,
    setError,
    success,
    farmerId,
  };
};
