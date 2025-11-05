"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DynamicMapSelector from "./maps/DynamicMap";
import { parseISO } from "date-fns";
import thaiProvinceData from "@/data/thai-provinces.json";
import { toast } from "react-hot-toast";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import {
  PrimaryAutoComplete,
  PrimaryDropdown,
  PrimaryInputText,
  PrimaryInputNumber,
  PrimaryCalendar,
  PrimaryDataTable,
  PrimaryButton,
} from "./ui";

// Interfaces for the component
interface Tambon {
  id: number;
  name_th: string;
  name_en: string;
  zip_code: number;
}

interface Amphure {
  id: number;
  name_th: string;
  name_en: string;
  tambons: Tambon[];
}

interface Province {
  id: number;
  name_th: string;
  name_en: string;
  amphures: Amphure[];
}

interface PlantingDetail {
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

interface RubberFarm {
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
  version?: number; // เพิ่ม version field
  location: {
    type: string;
    coordinates: [number, number];
  };
  plantingDetails: PlantingDetail[];
}

export default function RubberFarmEditForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const maxSteps = 3;
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [farms, setFarms] = useState<RubberFarm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);

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

  // State for form data
  const [rubberFarm, setRubberFarm] = useState<RubberFarm>({
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
    version: undefined, // เพิ่ม version field
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
    plantingDetails: [],
  });

  // State for plantingDetails
  const [plantingDetails, setPlantingDetails] = useState<PlantingDetail[]>([]);

  // State for location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);

  // Check authentication and fetch farmer data
  useEffect(() => {
    if (status === "loading") return; // Wait for session to load

    if (status === "unauthenticated") {
      router.push("/"); // Redirect to login
      return;
    }

    if (status === "authenticated" && session?.user?.roleData?.farmerId) {
      setFarmerId(session.user.roleData.farmerId);
      fetchFarmerFarms(session.user.roleData.farmerId);
    }

    // Load province data
    const loadProvinceData = async () => {
      try {
        setIsLoadingProvinces(true);
        const formattedProvinces = thaiProvinceData.map((province) => ({
          id: province.id,
          name_th: province.name_th,
          name_en: province.name_en,
          amphures: province.amphure.map((amp) => ({
            id: amp.id,
            name_th: amp.name_th,
            name_en: amp.name_en,
            tambons: amp.tambon.map((tam) => ({
              id: tam.id,
              name_th: tam.name_th,
              name_en: tam.name_en,
              zip_code: tam.zip_code,
            })),
          })),
        }));
        setProvinces(formattedProvinces);
      } catch (err) {
        console.error("Error loading provinces:", err);
        setError("ไม่สามารถโหลดข้อมูลจังหวัดได้");
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    loadProvinceData();
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

      // สร้าง query parameters
      const params = new URLSearchParams({
        farmerId: farmerId.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
      });

      // เพิ่ม sort parameters
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

        // Handle paginated response
        if (result.results && result.paginator) {
          setFarms(result.results);
          setFarmsPagination({
            first: result.paginator.offset,
            rows: result.paginator.limit,
            totalRecords: result.paginator.total,
          });
        } else {
          // Fallback for non-paginated response
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

  useEffect(() => {
    // รอให้ provinces โหลดเสร็จก่อน และมี selectedFarmId
    if (selectedFarmId && provinces.length > 0 && !isLoadingProvinces) {
      fetchFarmDetails(selectedFarmId);
    }
  }, [selectedFarmId, provinces, isLoadingProvinces]);

  const [isLoadingFarmData, setIsLoadingFarmData] = useState(false);

  // แก้ไข fetchFarmDetails function
  const fetchFarmDetails = async (farmId: number) => {
    try {
      setIsLoading(true);
      setIsLoadingFarmData(true);

      const response = await fetch(`/api/v1/rubber-farms/${farmId}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        console.log("🔍 Fetched Farm Data:", {
          rubberFarmId: data.rubberFarmId,
          version: data.version,
          plantingDetailsCount: data.plantingDetails?.length || 0,
        });

        // ตรวจสอบว่า provinces data โหลดเสร็จแล้ว
        if (provinces.length === 0) {
          console.warn("Provinces data not loaded yet");
          return;
        }

        // Find province in the list
        const province = provinces.find((p) => p.name_th === data.province);

        if (!province) {
          console.warn(
            `Province "${data.province}" not found in provinces list`
          );
          // ถ้าไม่เจอ province ให้ใช้ข้อมูลจาก API โดยตรง
          setRubberFarm({
            ...data,
            provinceId: 0,
            amphureId: 0,
            tambonId: 0,
          });
          return;
        }

        const provinceId = province.id;

        // หา amphure
        const selectedAmphure = province.amphures.find(
          (a) => a.name_th === data.district
        );

        if (!selectedAmphure) {
          console.warn(
            `Amphure "${data.district}" not found in province "${province.name_th}"`
          );
          // ถ้าไม่เจอ amphure ให้ set เฉพาะ province
          setAmphures(province.amphures);
          setTambons([]);
          setRubberFarm({
            ...data,
            provinceId: provinceId,
            amphureId: 0,
            tambonId: 0,
          });
          return;
        }

        const amphureId = selectedAmphure.id;

        // หา tambon
        const selectedTambon = selectedAmphure.tambons.find(
          (t) => t.name_th === data.subDistrict
        );

        const tambonId = selectedTambon ? selectedTambon.id : 0;

        if (!selectedTambon) {
          console.warn(
            `Tambon "${data.subDistrict}" not found in amphure "${selectedAmphure.name_th}"`
          );
        }

        // Set ข้อมูลทั้งหมดในครั้งเดียวแทนการใช้ setTimeout
        setAmphures(province.amphures);

        setTimeout(() => {
          setTambons(selectedAmphure.tambons);

          setTimeout(() => {
            setRubberFarm({
              ...data,
              provinceId: provinceId,
              amphureId: amphureId,
              tambonId: tambonId,
            });
          }, 10); // delay เล็กน้อย
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
              version: detail.version, // เก็บ version จาก API
            })
          );

          console.log(
            "🔍 PlantingDetails Set:",
            correctedDetails.map((d: PlantingDetail) => ({
              id: d.plantingDetailId,
              version: d.version,
            }))
          );

          setPlantingDetails(correctedDetails);
        }
      } else {
        throw new Error("ไม่สามารถดึงข้อมูลสวนยางได้");
      }
    } catch (error) {
      console.error("Error fetching farm details:", error);
      setError("ไม่สามารถดึงข้อมูลสวนยางได้");
    } finally {
      setIsLoading(false);
      setIsLoadingFarmData(false); // ปิด flag
    }
  };

  // แก้ไข useEffect สำหรับ province
  useEffect(() => {
    // ไม่ทำอะไรถ้ากำลังโหลดข้อมูลฟาร์ม
    if (isLoadingFarmData) return;

    if (rubberFarm.provinceId > 0) {
      const selectedProvince = provinces.find(
        (province) => province.id === rubberFarm.provinceId
      );
      if (selectedProvince) {
        // อัปเดต amphures เฉพาะเมื่อจำเป็น
        if (
          amphures.length === 0 ||
          amphures[0]?.id !== selectedProvince.amphures[0]?.id
        ) {
          setAmphures(selectedProvince.amphures);
        }

        // อัปเดต province name ถ้าไม่ตรงกัน
        if (rubberFarm.province !== selectedProvince.name_th) {
          setRubberFarm((prev) => ({
            ...prev,
            province: selectedProvince.name_th,
          }));
        }
      }
    } else {
      if (amphures.length > 0) {
        setAmphures([]);
      }
      if (tambons.length > 0) {
        setTambons([]);
      }
    }
  }, [rubberFarm.provinceId, provinces, isLoadingFarmData]); // ลบ amphures ออกจาก dependency

  // แก้ไข useEffect สำหรับ amphure
  useEffect(() => {
    if (isLoadingFarmData) return;

    if (rubberFarm.amphureId > 0) {
      const selectedAmphure = amphures.find(
        (amphure) => amphure.id === rubberFarm.amphureId
      );
      if (selectedAmphure) {
        // อัปเดต tambons เฉพาะเมื่อจำเป็น
        if (
          tambons.length === 0 ||
          tambons[0]?.id !== selectedAmphure.tambons[0]?.id
        ) {
          setTambons(selectedAmphure.tambons);
        }

        // อัปเดต district name ถ้าไม่ตรงกัน
        if (rubberFarm.district !== selectedAmphure.name_th) {
          setRubberFarm((prev) => ({
            ...prev,
            district: selectedAmphure.name_th,
          }));
        }
      }
    } else {
      if (tambons.length > 0) {
        setTambons([]);
      }
    }
  }, [rubberFarm.amphureId, amphures, isLoadingFarmData]); // ลบ tambons ออกจาก dependency

  // แก้ไข useEffect สำหรับ tambon
  useEffect(() => {
    if (isLoadingFarmData) return;

    if (rubberFarm.tambonId > 0) {
      const selectedTambon = tambons.find(
        (tambon) => tambon.id === rubberFarm.tambonId
      );
      if (selectedTambon && rubberFarm.subDistrict !== selectedTambon.name_th) {
        setRubberFarm((prev) => ({
          ...prev,
          subDistrict: selectedTambon.name_th,
        }));
      }
    }
  }, [rubberFarm.tambonId, tambons, isLoadingFarmData]);

  // เพิ่ม useEffect เพื่อ debug
  // useEffect(() => {
  //   console.log("Provinces loaded:", provinces.length);
  //   console.log("Current rubberFarm:", {
  //     province: rubberFarm.province,
  //     district: rubberFarm.district,
  //     subDistrict: rubberFarm.subDistrict,
  //     provinceId: rubberFarm.provinceId,
  //     amphureId: rubberFarm.amphureId,
  //     tambonId: rubberFarm.tambonId,
  //   });
  // }, [provinces, rubberFarm]);

  // แก้ไข updateFarmData function ให้ handle การเปลี่ยน province/amphure/tambon ได้ดีขึ้น
  const updateFarmData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "provinceId" && !isLoadingFarmData) {
      const provinceId = parseInt(value) || 0;
      const selectedProvince = provinces.find((p) => p.id === provinceId);

      setRubberFarm((prev) => ({
        ...prev,
        provinceId: provinceId,
        province: selectedProvince ? selectedProvince.name_th : "",
        amphureId: 0, // reset เฉพาะเมื่อผู้ใช้เปลี่ยน
        tambonId: 0,
        district: "",
        subDistrict: "",
      }));

      // Update amphures และ reset tambons
      if (selectedProvince) {
        setAmphures(selectedProvince.amphures);
      } else {
        setAmphures([]);
      }
      setTambons([]);
    } else if (name === "amphureId" && !isLoadingFarmData) {
      const amphureId = parseInt(value) || 0;
      const selectedAmphure = amphures.find((a) => a.id === amphureId);

      setRubberFarm((prev) => ({
        ...prev,
        amphureId: amphureId,
        district: selectedAmphure ? selectedAmphure.name_th : "",
        tambonId: 0,
        subDistrict: "",
      }));

      // Update tambons
      if (selectedAmphure) {
        setTambons(selectedAmphure.tambons);
      } else {
        setTambons([]);
      }
    } else if (name === "tambonId" && !isLoadingFarmData) {
      const tambonId = parseInt(value) || 0;
      const selectedTambon = tambons.find((t) => t.id === tambonId);

      setRubberFarm((prev) => ({
        ...prev,
        tambonId: tambonId,
        subDistrict: selectedTambon ? selectedTambon.name_th : "",
      }));
    } else if (name === "moo") {
      setRubberFarm((prev) => ({
        ...prev,
        moo: parseInt(value) || 0,
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

    // Convert values based on field type
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
      // ทำให้แน่ใจว่าค่าวันที่เป็น ISO string โดยใช้เวลาท้องถิ่น
      try {
        const date = value instanceof Date ? value : new Date(value as string);
        if (!Number.isNaN(date.getTime())) {
          // ตั้งค่าเป็นวันแรกของเดือน/ปี และเวลาเที่ยงคืนตามเวลาท้องถิ่น
          if (field === "yearOfTapping") {
            // เก็บเฉพาะปี - ตั้งเป็นวันที่ 1 มกราคม
            date.setMonth(0, 1);
          } else {
            // เก็บเดือนและปี - ตั้งเป็นวันที่ 1 ของเดือนนั้น
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
        // ถ้ามีข้อผิดพลาดให้ใช้วันที่ปัจจุบัน
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
      plantingDetailId: 0, // Will be assigned by server
      specie: "",
      areaOfPlot: 0,
      numberOfRubber: 0,
      numberOfTapping: 0,
      ageOfRubber: 0,
      yearOfTapping: new Date().toISOString(), // ใช้ ISO string
      monthOfTapping: new Date().toISOString(), // ใช้ ISO string
      totalProduction: 0,
    };

    setPlantingDetails([...plantingDetails, newDetail]);
  };

  // เพิ่ม state สำหรับเก็บ ID ที่ถูกลบ
  const [deletedPlantingDetailIds, setDeletedPlantingDetailIds] = useState<
    number[]
  >([]);

  // Remove planting detail
  const removePlantingDetail = (index: number) => {
    const updatedDetails = [...plantingDetails];
    const [removed] = updatedDetails.splice(index, 1);
    // ถ้ามี plantingDetailId (คือเป็นข้อมูลเดิมในฐานข้อมูล) ให้เก็บ ID ไว้
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
    // ตรวจสอบว่ามีอย่างน้อยหนึ่งรายการที่กรอกข้อมูลครบถ้วน
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

    // ตรวจสอบว่า ถ้ามีการกรอก specie แล้ว ต้องกรอกข้อมูลทุก field
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
      setError(
        "กรุณากรอกข้อมูลให้ครบถ้วนในทุกรายการที่เลือกพันธุ์ยางแล้ว (พันธุ์ยาง, พื้นที่แปลง, จำนวนต้นยาง, จำนวนต้นกรีด, อายุต้นยาง, ปีที่เริ่มกรีด, เดือนที่เริ่มกรีด, ผลผลิตรวม)"
      );
      return false;
    }

    setError("");
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate ก่อนส่ง
    if (!validatePlantingDetails()) {
      return;
    }

    setIsLoading(true);

    try {
      if (!selectedFarmId) {
        throw new Error("กรุณาเลือกสวนยางที่ต้องการแก้ไข");
      }

      // กรองรายการที่กรอกข้อมูลครบถ้วน
      const validPlantingDetails = plantingDetails.filter(
        (detail) =>
          detail.specie && detail.areaOfPlot > 0 && detail.numberOfRubber > 0
      );

      // แยกรายการที่มีอยู่แล้วและรายการใหม่
      const existingDetails = validPlantingDetails.filter(
        (detail) => detail.plantingDetailId && detail.plantingDetailId > 0
      );
      const newDetails = validPlantingDetails.filter(
        (detail) => !detail.plantingDetailId || detail.plantingDetailId <= 0
      );

      console.log("Existing details:", existingDetails);
      console.log("New details:", newDetails);

      // สร้าง payload สำหรับอัพเดทฟาร์ม
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

      // เพิ่ม version ถ้ามี
      if (rubberFarm.version !== undefined) {
        farmUpdatePayload.version = rubberFarm.version;
      }

      console.log("🔍 RubberFarm Update - Current State:", {
        rubberFarmId: rubberFarm.rubberFarmId,
        version: rubberFarm.version,
        payload: farmUpdatePayload,
      });

      // อัพเดทข้อมูลฟาร์ม
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
        // Handle Optimistic Lock Conflict
        const errorData = await farmResponse.json();
        toast.error(
          errorData.userMessage ||
            "ข้อมูลถูกแก้ไขโดยผู้ใช้อื่นแล้ว กรุณาโหลดข้อมูลใหม่และลองอีกครั้ง",
          { duration: 5000 }
        );
        // Refresh farm data
        if (selectedFarmId) {
          await fetchFarmDetails(selectedFarmId);
        }
        setIsLoading(false);
        return;
      }

      if (!farmResponse.ok) {
        const errorData = await farmResponse.json();
        throw new Error(errorData.message || "ไม่สามารถอัปเดตข้อมูลสวนยางได้");
      }

      // อัพเดต version จาก response
      const updatedFarmData = await farmResponse.json();
      setRubberFarm((prev) => ({
        ...prev,
        version: updatedFarmData.version,
      }));

      for (const id of deletedPlantingDetailIds) {
        try {
          const res = await fetch(`/api/v1/planting-details/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) {
            const errorData = await res.json();
            console.error("Error deleting planting detail:", errorData);
          }
        } catch (err) {
          console.error("Error deleting planting detail:", err);
        }
      }

      // อัพเดทรายการที่มีอยู่แล้ว
      for (const detail of existingDetails) {
        try {
          if (detail.plantingDetailId) {
            // เตรียมข้อมูลสำหรับอัพเดท
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

            // เพิ่ม version ถ้ามี
            if (detail.version !== undefined) {
              detailUpdatePayload.version = detail.version;
            }

            console.log(
              `🔍 PlantingDetail Update - ID: ${detail.plantingDetailId}`,
              {
                currentVersion: detail.version,
                payload: detailUpdatePayload,
              }
            );

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
              // Handle Optimistic Lock Conflict
              const errorData = await detailResponse.json();
              toast.error(
                errorData.userMessage ||
                  "ข้อมูลรายละเอียดการปลูกถูกแก้ไขโดยผู้ใช้อื่นแล้ว กรุณาโหลดข้อมูลใหม่และลองอีกครั้ง",
                { duration: 5000 }
              );
              // Refresh farm data
              if (selectedFarmId) {
                await fetchFarmDetails(selectedFarmId);
              }
              setIsLoading(false);
              return;
            }

            if (!detailResponse.ok) {
              const errorData = await detailResponse.json();
              console.error("Error updating planting detail:", errorData);
            } else {
              // อัพเดต version จาก response
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

      // เพิ่มรายการใหม่
      for (const detail of newDetails) {
        try {
          // สร้าง payload สำหรับรายการใหม่
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

          console.log("Creating new planting detail:", newDetailPayload);

          const detailResponse = await fetch(`/api/v1/planting-details`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(newDetailPayload),
          });

          if (!detailResponse.ok) {
            const errorData = await detailResponse.json();
            console.error("Error creating planting detail:", errorData);
            throw new Error(
              errorData.message || "ไม่สามารถเพิ่มข้อมูลรายละเอียดการปลูกได้"
            );
          }
        } catch (detailError) {
          console.error("Error with new planting detail:", detailError);
        }
      }

      setSuccess(true);
      toast.success("บันทึกข้อมูลสำเร็จ", { duration: 3000 });

      // รอสักครู่แล้วเปลี่ยนหน้า
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

  // Handle page change for DataTable
  const onPageChange = (event: DataTablePageEvent) => {
    if (farmerId) {
      fetchFarmerFarms(farmerId, event.first, event.rows, {
        sortField,
        sortOrder:
          sortOrder === 1 ? "asc" : sortOrder === -1 ? "desc" : undefined,
        multiSortMeta: multiSortMeta.filter(
          (item) => item.order === 1 || item.order === -1
        ) as Array<{ field: string; order: number }>,
      });
    }
  };

  // Handle sort change
  const onSortChange = (event: DataTableSortEvent) => {
    if (event.multiSortMeta) {
      const validMultiSort = event.multiSortMeta.filter(
        (item) => item.order !== undefined
      ) as Array<{ field: string; order: 1 | -1 | 0 | null }>;
      setMultiSortMeta(validMultiSort);
      const validSortMeta = validMultiSort.filter(
        (item) => item.order === 1 || item.order === -1
      ) as Array<{ field: string; order: number }>;
      if (farmerId) {
        fetchFarmerFarms(
          farmerId,
          farmsPagination.first,
          farmsPagination.rows,
          {
            multiSortMeta: validSortMeta,
          }
        );
      }
    } else {
      setSortField(event.sortField);
      const validOrder = event.sortOrder !== undefined ? event.sortOrder : null;
      setSortOrder(validOrder);
      if (farmerId) {
        fetchFarmerFarms(
          farmerId,
          farmsPagination.first,
          farmsPagination.rows,
          {
            sortField: event.sortField,
            sortOrder: event.sortOrder === 1 ? "asc" : "desc",
          }
        );
      }
    }
  };

  // Move to next step
  const nextStep = () => {
    if (step === 1 && !selectedFarmId) {
      setError("กรุณาเลือกสวนยางที่ต้องการแก้ไข");
      return;
    }
    if (step === 2 && !validateFarmData()) return;
    if (step === 3 && !validatePlantingDetails()) return; // เพิ่ม validation สำหรับ step 3

    if (step < maxSteps) {
      setStep(step + 1);
      setError("");
    }
  };

  // Move to previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };

  // Render farm selection step
  const renderFarmSelection = () => (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
        เลือกสวนยางที่ต้องการแก้ไข
      </h2>

      {isLoading && farms.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
        </div>
      ) : farms.length === 0 && farmsPagination.totalRecords === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-700 mb-3">
            คุณยังไม่มีสวนยางในระบบ กรุณาลงทะเบียนสวนยางก่อน
          </p>
          <PrimaryButton
            label="ลงทะเบียนสวนยาง"
            color="warning"
            onClick={() => router.push("/farmer/applications/new")}
            type="button"
          />
        </div>
      ) : (
        <PrimaryDataTable
          value={farms}
          columns={[
            {
              field: "farmId",
              header: "รหัสสวน",
              body: (rowData: any) =>
                rowData.farmId ||
                `RF${rowData.rubberFarmId.toString().padStart(5, "0")}`,
              sortable: true,
              headerAlign: "center" as const,
              bodyAlign: "center" as const,
              style: { width: "10%" },
            },
            {
              field: "location",
              header: "สถานที่",
              body: (rowData: any) =>
                rowData.location ||
                `${rowData.villageName} หมู่ ${rowData.moo}`,
              sortable: true,
              headerAlign: "center" as const,
              bodyAlign: "left" as const,
              style: { width: "30%" },
            },
            {
              field: "province",
              header: "จังหวัด",
              body: (rowData: any) => rowData.province,
              sortable: true,
              headerAlign: "center" as const,
              bodyAlign: "left" as const,
              style: { width: "20%" },
            },
            {
              field: "district",
              header: "อำเภอ",
              body: (rowData: any) => rowData.district,
              sortable: true,
              headerAlign: "center" as const,
              bodyAlign: "left" as const,
              style: { width: "20%" },
            },
            {
              field: "subDistrict",
              header: "ตำบล",
              body: (rowData: any) => rowData.subDistrict,
              sortable: true,
              headerAlign: "center" as const,
              bodyAlign: "left" as const,
              style: { width: "20%" },
            },
          ]}
          loading={isLoading}
          paginator
          rows={farmsPagination.rows}
          totalRecords={farmsPagination.totalRecords}
          first={farmsPagination.first}
          lazy
          onPage={onPageChange}
          sortMode="multiple"
          multiSortMeta={multiSortMeta}
          onSort={onSortChange}
          emptyMessage="ไม่พบข้อมูลสวนยางพารา"
          selectionMode="single"
          selection={farms.find((f) => f.rubberFarmId === selectedFarmId)}
          onSelectionChange={(e) =>
            setSelectedFarmId(e.value?.rubberFarmId || null)
          }
          dataKey="rubberFarmId"
        />
      )}
    </div>
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ขอแก้ไขข้อมูลใบรับรองแหล่งผลิต
        </h1>
        <p className="text-gray-600">
          แก้ไขข้อมูลสวนยางพาราและรายละเอียดการปลูกที่ได้รับการรับรองมาตรฐานจีเอพี
        </p>
      </div>

      {/* Step Progress Indicator */}
      <div className="mb-8">
        {/* Desktop Version */}
        <div className="hidden md:block">
          <div className="flex items-center">
            {[1, 2, 3].map((s, index) => (
              <React.Fragment key={s}>
                {/* Step Circle */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`
                w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300
                ${
                  s <= step
                    ? "bg-green-600 border-green-600 text-white shadow-lg"
                    : s === step + 1
                    ? "bg-white border-green-300 text-green-600"
                    : "bg-white border-gray-300 text-gray-400"
                }
                ${s < step ? "cursor-pointer hover:shadow-xl" : ""}
              `}
                    onClick={() => s < step && setStep(s)}
                  >
                    {s < step ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      s
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <div
                      className={`text-sm font-medium transition-colors duration-300 ${
                        s <= step ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {s === 1 && "เลือกสวนยาง"}
                      {s === 2 && "ข้อมูลสวนยาง"}
                      {s === 3 && "รายละเอียดการปลูก"}
                    </div>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < 2 && (
                  <div className="flex-1 mx-4 mb-6">
                    <div
                      className={`h-1 rounded-full transition-all duration-500 ${
                        s < step ? "bg-green-600" : "bg-gray-300"
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Mobile Version */}
        <div className="md:hidden">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-green-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${(step / maxSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-3">
              {[1, 2, 3].map((s, index) => (
                <React.Fragment key={s}>
                  <div
                    className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                ${
                  s <= step
                    ? "bg-green-600 text-white"
                    : s === step + 1
                    ? "bg-green-100 text-green-600 border border-green-300"
                    : "bg-gray-200 text-gray-400"
                }
              `}
                  >
                    {s < step ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      s
                    )}
                  </div>
                  {index < 2 && (
                    <div
                      className={`w-8 h-0.5 transition-all duration-300 ${
                        s < step ? "bg-green-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Current Step Info */}
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">
              ขั้นตอนที่ {step}: {step === 1 && "เลือกสวนยาง"}
              {step === 2 && "ข้อมูลสวนยาง"}
              {step === 3 && "รายละเอียดการปลูก"}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {step} จาก {maxSteps} ขั้นตอน
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          อัปเดตข้อมูลสำเร็จ กำลังนำคุณไปยังหน้าหลัก...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Farm Selection */}
        {step === 1 && renderFarmSelection()}

        {/* Step 2: Farm Details */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              ข้อมูลสวนยาง
            </h2>

            {/* Village and Moo - Full width on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label
                  htmlFor="villageName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  หมู่บ้าน/ชุมชน <span className="text-red-500">*</span>
                </label>
                <PrimaryInputText
                  id="villageName"
                  name="villageName"
                  value={rubberFarm.villageName}
                  onChange={(value) =>
                    updateFarmData({
                      target: { name: "villageName", value },
                    } as any)
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="moo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  หมู่ที่ <span className="text-red-500">*</span>
                </label>
                <PrimaryInputNumber
                  id="moo"
                  name="moo"
                  value={rubberFarm.moo || null}
                  onChange={(value) =>
                    updateFarmData({
                      target: { name: "moo", value: value || 0 },
                    } as any)
                  }
                  min={0}
                  max={1000}
                  maxFractionDigits={0}
                  required
                />
              </div>
            </div>

            {/* Road and Alley - Full width on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label
                  htmlFor="road"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ถนน
                </label>
                <PrimaryInputText
                  id="road"
                  name="road"
                  value={rubberFarm.road}
                  onChange={(value) =>
                    updateFarmData({
                      target: { name: "road", value },
                    } as any)
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="alley"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ซอย
                </label>
                <PrimaryInputText
                  id="alley"
                  name="alley"
                  value={rubberFarm.alley}
                  onChange={(value) =>
                    updateFarmData({
                      target: { name: "alley", value },
                    } as any)
                  }
                />
              </div>
            </div>

            {/* Address dropdowns - Stack on mobile, grid on larger screens */}
            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4 lg:gap-6">
              {/* Province dropdown */}
              <div>
                <label
                  htmlFor="provinceId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  จังหวัด <span className="text-red-500">*</span>
                </label>
                <PrimaryAutoComplete
                  id="provinceId"
                  name="provinceId"
                  value={rubberFarm.provinceId || ""}
                  options={provinces.map((province) => ({
                    label: province.name_th,
                    value: province.id,
                  }))}
                  onChange={(value) => {
                    updateFarmData({
                      target: { name: "provinceId", value },
                    } as any);
                  }}
                  placeholder="เลือกจังหวัด"
                  required
                />
              </div>

              {/* District dropdown */}
              <div>
                <label
                  htmlFor="amphureId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  อำเภอ/เขต <span className="text-red-500">*</span>
                </label>
                <PrimaryAutoComplete
                  id="amphureId"
                  name="amphureId"
                  value={rubberFarm.amphureId || ""}
                  options={amphures.map((amphure) => ({
                    label: amphure.name_th,
                    value: amphure.id,
                  }))}
                  onChange={(value) => {
                    updateFarmData({
                      target: { name: "amphureId", value },
                    } as any);
                  }}
                  placeholder="เลือกอำเภอ/เขต"
                  disabled={!rubberFarm.provinceId}
                  required
                />
              </div>

              {/* Sub-district dropdown */}
              <div>
                <label
                  htmlFor="tambonId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ตำบล/แขวง <span className="text-red-500">*</span>
                </label>
                <PrimaryAutoComplete
                  id="tambonId"
                  name="tambonId"
                  value={rubberFarm.tambonId || ""}
                  options={tambons.map((tambon) => ({
                    label: tambon.name_th,
                    value: tambon.id,
                  }))}
                  onChange={(value) => {
                    updateFarmData({
                      target: { name: "tambonId", value },
                    } as any);
                  }}
                  placeholder="เลือกตำบล/แขวง"
                  disabled={!rubberFarm.amphureId}
                  required
                />
              </div>
            </div>

            {/* Map section - COMPLETELY SIMPLIFIED */}
            <div className="mt-6 mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ตำแหน่งที่ตั้งสวนยาง <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">
                คลิกบนแผนที่หรือใช้เครื่องมือวาดเพื่อระบุตำแหน่งที่ตั้งของสวนยางพารา
              </p>

              {/* Minimal container with proper spacing */}
              <div
                style={{
                  height: "500px",
                  width: "100%",
                  marginBottom: "100px", // เพิ่ม margin-bottom เพื่อให้เว้นระยะกับปุ่ม
                }}
              >
                <DynamicMapSelector
                  location={rubberFarm.location}
                  onChange={(newLocation) =>
                    setRubberFarm({
                      ...rubberFarm,
                      location: newLocation,
                    })
                  }
                  height="400px"
                />
              </div>

              {/* Coordinates display */}
              {/* {rubberFarm.location &&
                rubberFarm.location.coordinates[0] !== 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    พิกัด: {rubberFarm.location.coordinates[1].toFixed(6)},{" "}
                    {rubberFarm.location.coordinates[0].toFixed(6)}
                  </div>
                )} */}
            </div>
          </div>
        )}

        {/* Step 3: Planting Details */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              รายละเอียดการปลูก
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              กรุณากรอกข้อมูลรายละเอียดการปลูกยางพารา (อย่างน้อย 1 รายการ)
            </p>

            {plantingDetails.map((detail, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-md mb-4 relative"
              >
                <h3 className="font-medium text-gray-800 mb-3 pr-8">
                  รายการที่ {index + 1}
                </h3>

                {/* Remove button */}
                {plantingDetails.length > 1 && (
                  <PrimaryButton
                    icon="pi pi-times"
                    variant="text"
                    color="danger"
                    rounded
                    onClick={() => removePlantingDetail(index)}
                    tooltip="ลบรายการ"
                    className="absolute top-4 right-4"
                    type="button"
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      พันธุ์ยาง <span className="text-red-500">*</span>
                    </label>
                    <PrimaryAutoComplete
                      value={detail.specie}
                      options={[
                        { label: "RRIT 251", value: "RRIT 251" },
                        { label: "RRIM 600", value: "RRIM 600" },
                        { label: "BPM 24", value: "BPM 24" },
                        { label: "PB 235", value: "PB 235" },
                        { label: "RRIT 408", value: "RRIT 408" },
                        { label: "RRIT 226", value: "RRIT 226" },
                        { label: "อื่นๆ", value: "อื่นๆ" },
                      ]}
                      onChange={(value) =>
                        updatePlantingDetail(index, "specie", value)
                      }
                      placeholder="เลือกพันธุ์ยาง"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      พื้นที่แปลง (ไร่) <span className="text-red-500">*</span>
                    </label>
                    <PrimaryInputNumber
                      value={detail.areaOfPlot || null}
                      onChange={(value) =>
                        updatePlantingDetail(index, "areaOfPlot", value || 0)
                      }
                      min={0}
                      max={10000}
                      minFractionDigits={0}
                      maxFractionDigits={4}
                      invalid={
                        detail.specie !== "" &&
                        (!detail.areaOfPlot || detail.areaOfPlot <= 0)
                      }
                      errorMessage={
                        detail.specie &&
                        (!detail.areaOfPlot || detail.areaOfPlot <= 0)
                          ? "กรุณากรอกพื้นที่แปลงที่มากกว่า 0"
                          : ""
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนต้นยางทั้งหมด <span className="text-red-500">*</span>
                    </label>
                    <PrimaryInputNumber
                      value={detail.numberOfRubber || null}
                      onChange={(value) =>
                        updatePlantingDetail(
                          index,
                          "numberOfRubber",
                          value || 0
                        )
                      }
                      min={0}
                      max={10000}
                      maxFractionDigits={0}
                      invalid={
                        detail.specie !== "" &&
                        (!detail.numberOfRubber || detail.numberOfRubber <= 0)
                      }
                      errorMessage={
                        detail.specie &&
                        (!detail.numberOfRubber || detail.numberOfRubber <= 0)
                          ? "กรุณากรอกจำนวนต้นยางที่มากกว่า 0"
                          : ""
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนต้นยางที่กรีดได้{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <PrimaryInputNumber
                      value={detail.numberOfTapping || null}
                      onChange={(value) =>
                        updatePlantingDetail(
                          index,
                          "numberOfTapping",
                          value || 0
                        )
                      }
                      min={0}
                      max={10000}
                      maxFractionDigits={0}
                      invalid={
                        detail.specie !== "" &&
                        (!detail.numberOfTapping || detail.numberOfTapping < 0)
                      }
                      errorMessage={
                        detail.specie &&
                        (!detail.numberOfTapping || detail.numberOfTapping < 0)
                          ? "กรุณากรอกจำนวนต้นยางที่กรีดได้"
                          : ""
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      อายุต้นยาง (ปี) <span className="text-red-500">*</span>
                    </label>
                    <PrimaryInputNumber
                      value={detail.ageOfRubber || null}
                      onChange={(value) =>
                        updatePlantingDetail(index, "ageOfRubber", value || 0)
                      }
                      min={0}
                      max={100}
                      maxFractionDigits={0}
                      invalid={
                        detail.specie !== "" &&
                        (!detail.ageOfRubber || detail.ageOfRubber < 0)
                      }
                      errorMessage={
                        detail.specie &&
                        (!detail.ageOfRubber || detail.ageOfRubber < 0)
                          ? "กรุณากรอกอายุต้นยาง"
                          : ""
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ปีที่เริ่มกรีด <span className="text-red-500">*</span>
                    </label>
                    <PrimaryCalendar
                      value={
                        detail.yearOfTapping
                          ? parseISO(detail.yearOfTapping)
                          : null
                      }
                      onChange={(value) =>
                        updatePlantingDetail(
                          index,
                          "yearOfTapping",
                          value || ""
                        )
                      }
                      view="year"
                      dateFormat="yy"
                      placeholder="เลือกปี"
                      invalid={detail.specie !== "" && !detail.yearOfTapping}
                      errorMessage={
                        detail.specie && !detail.yearOfTapping
                          ? "กรุณาเลือกปีที่เริ่มกรีด"
                          : ""
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เดือนที่เริ่มกรีด <span className="text-red-500">*</span>
                    </label>
                    <PrimaryDropdown
                      value={
                        detail.monthOfTapping
                          ? new Date(detail.monthOfTapping).getMonth()
                          : ""
                      }
                      options={[
                        { label: "มกราคม", value: 0 },
                        { label: "กุมภาพันธ์", value: 1 },
                        { label: "มีนาคม", value: 2 },
                        { label: "เมษายน", value: 3 },
                        { label: "พฤษภาคม", value: 4 },
                        { label: "มิถุนายน", value: 5 },
                        { label: "กรกฎาคม", value: 6 },
                        { label: "สิงหาคม", value: 7 },
                        { label: "กันยายน", value: 8 },
                        { label: "ตุลาคม", value: 9 },
                        { label: "พฤศจิกายน", value: 10 },
                        { label: "ธันวาคม", value: 11 },
                      ]}
                      onChange={(value) => {
                        const date = new Date();
                        date.setMonth(value);
                        updatePlantingDetail(index, "monthOfTapping", date);
                      }}
                      placeholder="เลือกเดือน"
                      invalid={detail.specie !== "" && !detail.monthOfTapping}
                      errorMessage={
                        detail.specie && !detail.monthOfTapping
                          ? "กรุณาเลือกเดือนที่เริ่มกรีด"
                          : ""
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ผลผลิตรวม (กก.) <span className="text-red-500">*</span>
                    </label>
                    <PrimaryInputNumber
                      value={detail.totalProduction || null}
                      onChange={(value) =>
                        updatePlantingDetail(
                          index,
                          "totalProduction",
                          value || 0
                        )
                      }
                      min={0}
                      max={10000}
                      minFractionDigits={0}
                      maxFractionDigits={4}
                      invalid={
                        detail.specie !== "" &&
                        (!detail.totalProduction || detail.totalProduction < 0)
                      }
                      errorMessage={
                        detail.specie &&
                        (!detail.totalProduction || detail.totalProduction < 0)
                          ? "กรุณากรอกผลผลิตรวม"
                          : ""
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add planting detail button */}
            <PrimaryButton
              label="เพิ่มรายละเอียดการปลูก"
              icon="pi pi-plus"
              variant="text"
              color="success"
              onClick={addPlantingDetail}
              type="button"
            />

            <div className="mt-6">
              <div className="flex items-center mb-4">
                <input
                  id="confirm"
                  name="confirm"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="confirm"
                  className="ml-2 block text-sm text-gray-700"
                >
                  ข้าพเจ้าขอรับรองว่าข้อมูลที่กรอกข้างต้นเป็นความจริงทุกประการ
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <PrimaryButton
              label="ย้อนกลับ"
              variant="outlined"
              icon="pi pi-arrow-left"
              onClick={prevStep}
              type="button"
            />
          ) : (
            <PrimaryButton
              label="กลับไปหน้าหลัก"
              variant="outlined"
              color="secondary"
              icon="pi pi-arrow-left"
              onClick={() => router.push("/farmer/dashboard")}
              type="button"
            />
          )}

          {step < maxSteps ? (
            <PrimaryButton
              label="ถัดไป"
              color="success"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={nextStep}
              type="button"
            />
          ) : (
            <PrimaryButton
              label={isLoading ? "กำลังบันทึก..." : "บันทึกและส่งข้อมูล"}
              color="success"
              type="submit"
              disabled={isLoading || success}
              loading={isLoading}
            />
          )}
        </div>
      </form>
    </div>
  );
}
