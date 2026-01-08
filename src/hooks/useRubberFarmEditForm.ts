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
  numberOfTapping?: number;
  ageOfRubber?: number;
  yearOfTapping: string;
  monthOfTapping: string;
  totalProduction?: number;
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
  productDistributionType: string;
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
  productDistributionType: "",
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
  const [isConfirmed, setIsConfirmed] = useState(false);

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
              numberOfTapping:
                detail.numberOfTapping !== undefined
                  ? Number(detail.numberOfTapping)
                  : undefined,
              ageOfRubber:
                detail.ageOfRubber !== undefined
                  ? Number(detail.ageOfRubber)
                  : undefined,
              totalProduction:
                detail.totalProduction !== undefined
                  ? Number(detail.totalProduction)
                  : undefined,
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
    value: string | number | Date | undefined
  ) => {
    const updatedDetails = [...plantingDetails];

    if (
      field === "areaOfPlot" ||
      field === "numberOfRubber" ||
      field === "numberOfTapping" ||
      field === "ageOfRubber" ||
      field === "totalProduction"
    ) {
      updatedDetails[index][field] =
        value === undefined
          ? undefined
          : ((parseFloat(value as string) || 0) as any);
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
      numberOfTapping: undefined,
      ageOfRubber: undefined,
      yearOfTapping: new Date().toISOString(),
      monthOfTapping: new Date().toISOString(),
      totalProduction: undefined,
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
      !rubberFarm.road ||
      !rubberFarm.alley ||
      !rubberFarm.subDistrict ||
      !rubberFarm.district ||
      !rubberFarm.province ||
      !rubberFarm.productDistributionType
    ) {
      setError("กรุณากรอกข้อมูลสวนยางให้ครบถ้วน");
      return false;
    }
    setError("");
    return true;
  };

  // Validate planting details
  const validatePlantingDetails = (): boolean => {
    if (plantingDetails.length === 0) {
      setError("กรุณาเพิ่มรายละเอียดการปลูกอย่างน้อย 1 รายการ");
      return false;
    }

    for (let i = 0; i < plantingDetails.length; i++) {
      const detail = plantingDetails[i];
      const itemNumber = i + 1;

      if (!detail.specie || detail.specie.trim() === "") {
        setError(`รายการที่ ${itemNumber}: กรุณาเลือกพันธุ์ยางพารา`);
        return false;
      }

      if (detail.areaOfPlot === 0) {
        setError(`รายการที่ ${itemNumber}: กรุณากรอกพื้นที่แปลงให้ถูกต้อง`);
        return false;
      }
      if (!detail.areaOfPlot || detail.areaOfPlot < 0) {
        setError(`รายการที่ ${itemNumber}: กรุณากรอกพื้นที่แปลง`);
        return false;
      }

      if (detail.numberOfRubber === 0) {
        setError(
          `รายการที่ ${itemNumber}: กรุณากรอกจำนวนต้นยางทั้งหมดให้ถูกต้อง`
        );
        return false;
      }
      if (!detail.numberOfRubber || detail.numberOfRubber < 0) {
        setError(`รายการที่ ${itemNumber}: กรุณากรอกจำนวนต้นยางทั้งหมด`);
        return false;
      }

      if (detail.numberOfTapping === undefined) {
        setError(`รายการที่ ${itemNumber}: กรุณากรอกจำนวนต้นกรีดที่กรีดได้`);
        return false;
      }
      if (detail.numberOfTapping < 0) {
        setError(
          `รายการที่ ${itemNumber}: กรุณากรอกจำนวนต้นกรีดที่กรีดได้ให้ถูกต้อง`
        );
        return false;
      }

      if (detail.ageOfRubber === undefined) {
        setError(`รายการที่ ${itemNumber}: กรุณากรอกอายุต้นยาง`);
        return false;
      }
      if (detail.ageOfRubber < 0) {
        setError(`รายการที่ ${itemNumber}: กรุณากรอกอายุต้นยางให้ถูกต้อง`);
        return false;
      }

      if (!detail.yearOfTapping || detail.yearOfTapping === "") {
        setError(`รายการที่ ${itemNumber}: กรุณาเลือกปีที่เริ่มกรีด`);
        return false;
      }

      if (!detail.monthOfTapping || detail.monthOfTapping === "") {
        setError(`รายการที่ ${itemNumber}: กรุณาเลือกเดือนที่เริ่มกรีด`);
        return false;
      }

      if (detail.totalProduction === undefined) {
        setError(`รายการที่ ${itemNumber}: กรุณากรอกผลผลิตรวม`);
        return false;
      }
      if (detail.totalProduction < 0) {
        setError(`รายการที่ ${itemNumber}: กรุณากรอกผลผลิตรวมให้ถูกต้อง`);
        return false;
      }
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

      const existingDetails = validPlantingDetails
        .filter(
          (detail) => detail.plantingDetailId && detail.plantingDetailId > 0
        )
        .map((detail) => ({
          plantingDetailId: detail.plantingDetailId,
          specie: detail.specie,
          areaOfPlot: Number(detail.areaOfPlot),
          numberOfRubber: Number(detail.numberOfRubber),
          numberOfTapping:
            detail.numberOfTapping !== undefined
              ? Number(detail.numberOfTapping)
              : undefined,
          ageOfRubber:
            detail.ageOfRubber !== undefined
              ? Number(detail.ageOfRubber)
              : undefined,
          yearOfTapping: detail.yearOfTapping,
          monthOfTapping: detail.monthOfTapping,
          totalProduction:
            detail.totalProduction !== undefined
              ? Number(detail.totalProduction)
              : undefined,
          version: detail.version,
        }));

      const newDetails = validPlantingDetails
        .filter(
          (detail) => !detail.plantingDetailId || detail.plantingDetailId <= 0
        )
        .map((detail) => ({
          specie: detail.specie,
          areaOfPlot: Number(detail.areaOfPlot),
          numberOfRubber: Number(detail.numberOfRubber),
          numberOfTapping:
            detail.numberOfTapping !== undefined
              ? Number(detail.numberOfTapping)
              : undefined,
          ageOfRubber:
            detail.ageOfRubber !== undefined
              ? Number(detail.ageOfRubber)
              : undefined,
          yearOfTapping: detail.yearOfTapping,
          monthOfTapping: detail.monthOfTapping,
          totalProduction:
            detail.totalProduction !== undefined
              ? Number(detail.totalProduction)
              : undefined,
        }));

      // Prepare single payload with all data
      const payload = {
        farmData: {
          villageName: rubberFarm.villageName,
          moo: Number(rubberFarm.moo) || 0,
          road: rubberFarm.road || "",
          alley: rubberFarm.alley || "",
          subDistrict: rubberFarm.subDistrict,
          district: rubberFarm.district,
          province: rubberFarm.province,
          location: rubberFarm.location,
          productDistributionType: rubberFarm.productDistributionType,
          version: rubberFarm.version,
        },
        existingPlantingDetails: existingDetails,
        newPlantingDetails: newDetails,
        deletedPlantingDetailIds: deletedPlantingDetailIds,
      };

      // Call single API endpoint
      const response = await fetch(
        `/api/v1/rubber-farms/${selectedFarmId}/update-with-details`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 409) {
        const errorData = await response.json();
        toast.error(
          errorData.userMessage ||
            "ข้อมูลถูกแก้ไขโดยผู้ใช้อื่นแล้ว กรุณาโหลดข้อมูลใหม่และลองอีกครั้ง",
          { duration: 5000 }
        );
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "ไม่สามารถอัปเดตข้อมูลได้");
      }

      const result = await response.json();

      // Update local state with new versions
      setRubberFarm((prev) => ({
        ...prev,
        version: result.rubberFarm?.version || prev.version,
      }));

      if (result.plantingDetails) {
        const updatedDetails = plantingDetails.map((detail) => {
          const updated = result.plantingDetails.find(
            (pd: any) => pd.plantingDetailId === detail.plantingDetailId
          );
          return updated ? { ...detail, version: updated.version } : detail;
        });
        setPlantingDetails(updatedDetails);
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
    isConfirmed,
    setIsConfirmed,
  };
};
