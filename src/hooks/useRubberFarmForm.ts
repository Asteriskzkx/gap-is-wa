import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

// Interfaces
export interface PlantingDetail {
  specie: string;
  areaOfPlot: number;
  numberOfRubber: number;
  numberOfTapping: number;
  ageOfRubber: number;
  yearOfTapping: string;
  monthOfTapping: string;
  totalProduction: number;
}

export interface RubberFarm {
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
  location: {
    type: string;
    coordinates: [number, number];
  };
  plantingDetails: PlantingDetail[];
}

const initialPlantingDetail: PlantingDetail = {
  specie: "",
  areaOfPlot: 0,
  numberOfRubber: 0,
  numberOfTapping: 0,
  ageOfRubber: 0,
  yearOfTapping: new Date().toISOString(),
  monthOfTapping: new Date().toISOString(),
  totalProduction: 0,
};

const initialRubberFarm: RubberFarm = {
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
  location: {
    type: "Point",
    coordinates: [100.523186, 13.736717], // กรุงเทพฯ [lng, lat] เป็นค่าเริ่มต้นให้แผนที่แสดงที่ไทย
  },
  plantingDetails: [],
};

export const useRubberFarmForm = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [plantingDetails, setPlantingDetails] = useState<PlantingDetail[]>([
    { ...initialPlantingDetail },
  ]);
  const [rubberFarm, setRubberFarm] = useState<RubberFarm>(initialRubberFarm);

  // ดึงข้อมูล farmer ID จาก NextAuth session
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.user?.roleData) {
      const roleData = session.user.roleData;
      if (roleData.farmerId) {
        setFarmerId(roleData.farmerId);
      } else {
        toast.error("ไม่พบข้อมูลในระบบ กรุณาติดต่อผู้ดูแลระบบ");
      }
    }
  }, [status, session, router]);

  // อัปเดตข้อมูลฟาร์ม
  const updateFarmData = (name: string, value: string | number) => {
    if (
      name === "provinceId" ||
      name === "amphureId" ||
      name === "tambonId" ||
      name === "moo"
    ) {
      setRubberFarm((prev) => ({
        ...prev,
        [name]: typeof value === "string" ? Number.parseInt(value) || 0 : value,
      }));
    } else {
      setRubberFarm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // อัปเดตข้อมูลรายละเอียดการปลูก
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
      updatedDetails[index][field] = Number.parseFloat(value as string) || 0;
    } else if (field === "specie") {
      updatedDetails[index][field] = String(value);
    } else if (field === "yearOfTapping" || field === "monthOfTapping") {
      const date = value instanceof Date ? value : new Date(value as string);
      if (!Number.isNaN(date.getTime())) {
        if (field === "yearOfTapping") {
          date.setMonth(0, 1);
        } else {
          date.setDate(1);
        }
        date.setHours(0, 0, 0, 0);
        updatedDetails[index][field] = date.toISOString();
      }
    }

    setPlantingDetails(updatedDetails);
  };

  // ตรวจสอบความถูกต้องของข้อมูลฟาร์ม
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
    // ตรวจสอบตำแหน่งบนแผนที่ (ไม่อนุญาตให้เป็นค่าเริ่มต้น [0,0])
    try {
      const loc = rubberFarm.location;
      if (!loc) {
        setError("กรุณาระบุตำแหน่งที่ตั้งสวนยางบนแผนที่");
        return false;
      }

      // กรณี Point ให้ตรวจสอบว่าไม่ใช่พิกัดเริ่มต้น (กรุงเทพฯ)
      if (
        loc.type === "Point" &&
        Array.isArray(loc.coordinates) &&
        loc.coordinates.length === 2 &&
        loc.coordinates[0] === 100.523186 &&
        loc.coordinates[1] === 13.736717
      ) {
        setError("กรุณาคลิกบนแผนที่เพื่อระบุตำแหน่งสวนยางของคุณ");
        return false;
      }

      // กรณี Polygon/LineString ให้ตรวจสอบอย่างง่ายว่ามีพิกัดอยู่จริง
      if (loc.type === "Polygon" || loc.type === "LineString") {
        const coords: any = (loc as any).coordinates;
        if (!coords || (Array.isArray(coords) && coords.length === 0)) {
          setError("กรุณาระบุตำแหน่งที่ตั้งสวนยางบนแผนที่");
          return false;
        }
      }
    } catch (err) {
      console.error("Error validating location:", err);
      setError("เกิดข้อผิดพลาดในการตรวจสอบตำแหน่งบนแผนที่");
      return false;
    }
    setError("");
    return true;
  };

  // ฟังก์ชันตรวจสอบความครบถ้วนของรายการเดียว
  const validateSinglePlantingDetail = (
    detail: PlantingDetail,
    index: number
  ): string | null => {
    const itemNumber = index + 1;

    if (!detail.specie || detail.specie.trim() === "") {
      return `รายการที่ ${itemNumber}: กรุณาเลือกพันธุ์ยางพารา`;
    }

    if (detail.areaOfPlot === 0) {
      return `รายการที่ ${itemNumber}: กรุณากรอกพื้นที่แปลงให้ถูกต้อง`;
    }
    if (!detail.areaOfPlot || detail.areaOfPlot < 0) {
      return `รายการที่ ${itemNumber}: กรุณากรอกพื้นที่แปลง`;
    }

    if (detail.numberOfRubber === 0) {
      return `รายการที่ ${itemNumber}: กรุณากรอกจำนวนต้นยางทั้งหมดให้ถูกต้อง`;
    }
    if (!detail.numberOfRubber || detail.numberOfRubber < 0) {
      return `รายการที่ ${itemNumber}: กรุณากรอกจำนวนต้นยางทั้งหมด`;
    }

    if (detail.numberOfTapping == null || detail.numberOfTapping < 0) {
      return `รายการที่ ${itemNumber}: กรุณากรอกจำนวนต้นกรีดที่กรีดได้`;
    }

    if (detail.ageOfRubber == null || detail.ageOfRubber < 0) {
      return `รายการที่ ${itemNumber}: กรุณากรอกอายุต้นยาง`;
    }

    if (!detail.yearOfTapping || detail.yearOfTapping === "") {
      return `รายการที่ ${itemNumber}: กรุณาเลือกปีที่เริ่มกรีด`;
    }

    if (!detail.monthOfTapping || detail.monthOfTapping === "") {
      return `รายการที่ ${itemNumber}: กรุณาเลือกเดือนที่เริ่มกรีด`;
    }

    if (detail.totalProduction == null || detail.totalProduction < 0) {
      return `รายการที่ ${itemNumber}: กรุณากรอกผลผลิตรวม`;
    }

    return null;
  };

  // ตรวจสอบความถูกต้องของข้อมูลรายละเอียดการปลูก
  const validatePlantingDetails = (): boolean => {
    if (plantingDetails.length === 0) {
      setError("กรุณาเพิ่มรายละเอียดการปลูกอย่างน้อย 1 รายการ");
      return false;
    }

    for (let i = 0; i < plantingDetails.length; i++) {
      const errorMessage = validateSinglePlantingDetail(plantingDetails[i], i);
      if (errorMessage) {
        setError(errorMessage);
        return false;
      }
    }

    setError("");
    return true;
  };

  // เพิ่มรายการปลูกใหม่
  const addPlantingDetail = () => {
    setPlantingDetails([...plantingDetails, { ...initialPlantingDetail }]);
  };

  // ลบรายการปลูก
  const removePlantingDetail = (index: number) => {
    if (plantingDetails.length > 1) {
      const updatedDetails = plantingDetails.filter((_, i) => i !== index);
      setPlantingDetails(updatedDetails);
    }
  };

  // การส่งข้อมูล
  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (!farmerId) {
        throw new Error("ไม่พบข้อมูลเกษตรกร กรุณาเข้าสู่ระบบใหม่");
      }

      const validPlantingDetails = plantingDetails.filter(
        (detail) =>
          detail.specie && detail.areaOfPlot > 0 && detail.numberOfRubber > 0
      );

      const payload = {
        farmData: {
          farmerId,
          villageName: rubberFarm.villageName,
          moo: rubberFarm.moo,
          road: rubberFarm.road || "",
          alley: rubberFarm.alley || "",
          subDistrict: rubberFarm.subDistrict,
          district: rubberFarm.district,
          province: rubberFarm.province,
          location: rubberFarm.location,
          productDistributionType: rubberFarm.productDistributionType,
        },
        plantingDetailsData: validPlantingDetails,
      };

      const response = await fetch("/api/v1/rubber-farms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "ไม่สามารถส่งข้อมูลได้");
      }

      await response.json();
      setSuccess(true);

      setTimeout(() => {
        router.push("/farmer/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting farm data:", error);
      setError(error.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rubberFarm,
    setRubberFarm,
    plantingDetails,
    updateFarmData,
    updatePlantingDetail,
    addPlantingDetail,
    removePlantingDetail,
    validateFarmData,
    validatePlantingDetails,
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
