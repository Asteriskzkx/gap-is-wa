"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DynamicMapSelector from "./maps/DynamicMap";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO } from "date-fns";
import thaiProvinceData from "@/data/thai-provinces.json";

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
  location: {
    type: string;
    coordinates: [number, number];
  };
  plantingDetails: PlantingDetail[];
}

export default function RubberFarmEditForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const maxSteps = 3;
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [farms, setFarms] = useState<RubberFarm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);

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

  // Fetch farmerId from local storage and get farms data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchFarmerData(token);
    } else {
      router.push("/"); // If no token, redirect to login
    }

    // Load province data
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
  }, []);

  // Fetch farmer data and farms
  const fetchFarmerData = async (token: string) => {
    try {
      const response = await fetch("/api/v1/farmers/current", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.farmerId) {
          setFarmerId(data.farmerId);
          fetchFarmerFarms(token, data.farmerId);
        } else {
          setError("ไม่พบข้อมูล farmerId ในระบบ");
        }
      } else {
        throw new Error("ไม่สามารถดึงข้อมูลเกษตรกรได้");
      }
    } catch (error) {
      console.error("Error fetching farmer data:", error);
      setError("ไม่สามารถดึงข้อมูลเกษตรกรได้ กรุณาเข้าสู่ระบบใหม่");
    }
  };

  // Fetch farms belonging to the farmer
  const fetchFarmerFarms = async (token: string, farmerId: number) => {
    try {
      const response = await fetch(
        `/api/v1/rubber-farms?farmerId=${farmerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFarms(data);
      } else {
        throw new Error("ไม่สามารถดึงข้อมูลสวนยางได้");
      }
    } catch (error) {
      console.error("Error fetching rubber farms:", error);
      setError("ไม่สามารถดึงข้อมูลสวนยางได้");
    }
  };

  // Fetch farm details when a farm is selected
  useEffect(() => {
    if (selectedFarmId) {
      fetchFarmDetails(selectedFarmId);
    }
  }, [selectedFarmId]);

  // Fetch detailed information about a specific farm
  const fetchFarmDetails = async (farmId: number) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/v1/rubber-farms/${farmId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Find province in the list
        const province = provinces.find((p) => p.name_th === data.province);
        const provinceId = province ? province.id : 0;

        // ตั้งค่าอำเภอ (amphure) ทันทีที่เจอจังหวัด
        let amphuresList: React.SetStateAction<Amphure[]> = [];
        let selectedAmphure = null;
        let tambonsList: React.SetStateAction<Tambon[]> = [];
        let amphureId = 0;
        let tambonId = 0;

        if (province) {
          amphuresList = province.amphures;
          // Find amphure in the province
          selectedAmphure = province.amphures.find(
            (a) => a.name_th === data.district
          );
          amphureId = selectedAmphure ? selectedAmphure.id : 0;

          // ตั้งค่าตำบล (tambon) ทันทีที่เจอข้อมูลอำเภอ
          if (selectedAmphure) {
            tambonsList = selectedAmphure.tambons;
            // Find tambon in the amphure
            const selectedTambon = selectedAmphure.tambons.find(
              (t) => t.name_th === data.subDistrict
            );
            tambonId = selectedTambon ? selectedTambon.id : 0;
          }
        }

        // อัปเดตข้อมูลทั้งหมดในครั้งเดียว
        setAmphures(amphuresList);
        setTambons(tambonsList);
        setRubberFarm({
          ...data,
          provinceId: provinceId,
          amphureId: amphureId,
          tambonId: tambonId,
        });

        // Set planting details
        if (data.plantingDetails && data.plantingDetails.length > 0) {
          // ตรวจสอบและแก้ไขรูปแบบข้อมูลวันที่ให้ถูกต้อง
          const correctedDetails = data.plantingDetails.map(
            (detail: PlantingDetail) => ({
              ...detail,
              // ตรวจสอบและแก้ไขรูปแบบวันที่ให้ถูกต้อง
              yearOfTapping: detail.yearOfTapping || new Date().toISOString(),
              monthOfTapping: detail.monthOfTapping || new Date().toISOString(),
              // ตรวจสอบค่าตัวเลขให้เป็นตัวเลขจริงๆ
              areaOfPlot: Number(detail.areaOfPlot) || 0,
              numberOfRubber: Number(detail.numberOfRubber) || 0,
              numberOfTapping: Number(detail.numberOfTapping) || 0,
              ageOfRubber: Number(detail.ageOfRubber) || 0,
              totalProduction: Number(detail.totalProduction) || 0,
            })
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
    }
  };

  // Update amphures and reset amphure/tambon when province changes
  useEffect(() => {
    if (rubberFarm.provinceId > 0) {
      const selectedProvince = provinces.find(
        (province) => province.id === rubberFarm.provinceId
      );
      if (selectedProvince) {
        setAmphures(selectedProvince.amphures);
        // รีเซ็ตอำเภอ/เขตและตำบล/แขวง เป็นค่าแรก (หรือค่าว่าง)
        setTambons([]);
        setRubberFarm((prev) => ({
          ...prev,
          province: selectedProvince.name_th,
          amphureId: 0,
          tambonId: 0,
          district: "",
          subDistrict: "",
        }));
      }
    } else {
      setAmphures([]);
      setTambons([]);
      setRubberFarm((prev) => ({
        ...prev,
        amphureId: 0,
        tambonId: 0,
        district: "",
        subDistrict: "",
      }));
    }
  }, [rubberFarm.provinceId, provinces]);

  // Update tambons and reset tambon when amphure changes
  useEffect(() => {
    if (rubberFarm.amphureId > 0) {
      const selectedAmphure = amphures.find(
        (amphure) => amphure.id === rubberFarm.amphureId
      );
      if (selectedAmphure) {
        setTambons(selectedAmphure.tambons);
        setRubberFarm((prev) => ({
          ...prev,
          district: selectedAmphure.name_th,
          tambonId: 0,
          subDistrict: "",
        }));
      }
    } else {
      setTambons([]);
      setRubberFarm((prev) => ({
        ...prev,
        tambonId: 0,
        subDistrict: "",
      }));
    }
  }, [rubberFarm.amphureId, amphures]);

  // Update subdistrict when tambon changes
  useEffect(() => {
    if (rubberFarm.tambonId > 0) {
      const selectedTambon = tambons.find(
        (tambon) => tambon.id === rubberFarm.tambonId
      );
      if (selectedTambon) {
        setRubberFarm((prev) => ({
          ...prev,
          subDistrict: selectedTambon.name_th,
        }));
      }
    }
  }, [rubberFarm.tambonId, tambons]);

  // Update farm data
  const updateFarmData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "provinceId") {
      setRubberFarm({
        ...rubberFarm,
        provinceId: parseInt(value) || 0,
        amphureId: 0,
        tambonId: 0,
        district: "",
        subDistrict: "",
      });
    } else if (name === "amphureId") {
      setRubberFarm({
        ...rubberFarm,
        amphureId: parseInt(value) || 0,
        tambonId: 0,
        district: "",
        subDistrict: "",
      });
    } else if (name === "tambonId") {
      setRubberFarm({
        ...rubberFarm,
        tambonId: parseInt(value) || 0,
        subDistrict: "",
      });
    } else if (name === "moo") {
      setRubberFarm({
        ...rubberFarm,
        moo: parseInt(value) || 0,
      });
    } else {
      setRubberFarm({
        ...rubberFarm,
        [name]: value,
      });
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
      // ทำให้แน่ใจว่าค่าวันที่เป็น ISO string
      try {
        const date = value instanceof Date ? value : new Date(value as string);
        if (!isNaN(date.getTime())) {
          updatedDetails[index][field] = date.toISOString();
        } else {
          updatedDetails[index][field] = new Date().toISOString();
        }
      } catch (error) {
        // ถ้ามีข้อผิดพลาดให้ใช้วันที่ปัจจุบัน
        updatedDetails[index][field] = new Date().toISOString();
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
    // Check if at least one planting detail is filled
    const validDetails = plantingDetails.filter(
      (detail) =>
        detail.specie && detail.areaOfPlot > 0 && detail.numberOfRubber > 0
    );

    if (validDetails.length === 0) {
      setError("กรุณากรอกข้อมูลรายละเอียดการปลูกอย่างน้อย 1 รายการ");
      return false;
    }

    setError("");
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
      const farmUpdatePayload = {
        villageName: rubberFarm.villageName,
        moo: Number(rubberFarm.moo) || 0,
        road: rubberFarm.road || "",
        alley: rubberFarm.alley || "",
        subDistrict: rubberFarm.subDistrict,
        district: rubberFarm.district,
        province: rubberFarm.province,
        location: rubberFarm.location,
      };

      // อัพเดทข้อมูลฟาร์ม
      const token = localStorage.getItem("token");
      const farmResponse = await fetch(
        `/api/v1/rubber-farms/${selectedFarmId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(farmUpdatePayload),
        }
      );

      if (!farmResponse.ok) {
        const errorData = await farmResponse.json();
        throw new Error(errorData.message || "ไม่สามารถอัปเดตข้อมูลสวนยางได้");
      }

      for (const id of deletedPlantingDetailIds) {
        try {
          const res = await fetch(`/api/v1/planting-details/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
            const detailUpdatePayload = {
              specie: detail.specie,
              areaOfPlot: Number(detail.areaOfPlot),
              numberOfRubber: Number(detail.numberOfRubber),
              numberOfTapping: Number(detail.numberOfTapping) || 0,
              ageOfRubber: Number(detail.ageOfRubber) || 0,
              yearOfTapping: detail.yearOfTapping,
              monthOfTapping: detail.monthOfTapping,
              totalProduction: Number(detail.totalProduction) || 0,
            };

            console.log(
              `Updating detail ${detail.plantingDetailId}:`,
              detailUpdatePayload
            );

            const detailResponse = await fetch(
              `/api/v1/planting-details/${detail.plantingDetailId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(detailUpdatePayload),
              }
            );

            if (!detailResponse.ok) {
              const errorData = await detailResponse.json();
              console.error("Error updating planting detail:", errorData);
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
              Authorization: `Bearer ${token}`,
            },
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

      // รอสักครู่แล้วเปลี่ยนหน้า
      setTimeout(() => {
        router.push("/farmer/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error updating farm data:", error);
      setError(error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  // Move to next step
  const nextStep = () => {
    if (step === 1 && !selectedFarmId) {
      setError("กรุณาเลือกสวนยางที่ต้องการแก้ไข");
      return;
    }
    if (step === 2 && !validateFarmData()) return;

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

      {farms.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="text-yellow-700">
            คุณยังไม่มีสวนยางในระบบ กรุณาลงทะเบียนสวนยางก่อน
          </p>
          <Link
            href="/farmer/applications/new"
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700"
          >
            ลงทะเบียนสวนยาง
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {farms.map((farm) => (
            <div
              key={farm.rubberFarmId}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedFarmId === farm.rubberFarmId
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-green-300 hover:bg-green-50/30"
              }`}
              onClick={() => setSelectedFarmId(farm.rubberFarmId)}
            >
              <h3 className="font-medium text-gray-900">
                สวนยางพารา ตำบล{farm.subDistrict} อำเภอ{farm.district} จังหวัด
                {farm.province}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                หมู่บ้าน {farm.villageName} หมู่ {farm.moo}
              </p>
              {/* <p className="text-gray-600 text-sm mt-1">
                จำนวนแปลง: {farm.plantingDetails?.length || 0} แปลง
              </p> */}
            </div>
          ))}
        </div>
      )}

      {selectedFarmId && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            แก้ไขข้อมูลสวนยาง
          </button>
        </div>
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
      <div className="relative mb-16">
        <div className="h-1 bg-gray-200 rounded-full">
          <div
            className="h-1 bg-green-500 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(step / maxSteps) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative">
              {/* Circle indicator */}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  s <= step
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-500 border-gray-300"
                } ${s < step ? "cursor-pointer" : ""}`}
                onClick={() => s < step && setStep(s)}
              >
                {s}
              </div>

              {/* Label below the circle with improved positioning */}
              <div
                className={`absolute text-center text-xs mt-2 w-20 ${
                  s <= step
                    ? "font-medium text-green-700"
                    : "font-medium text-gray-500"
                }`}
                style={{
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: "100%",
                }}
              >
                {s === 1
                  ? "เลือกสวนยาง"
                  : s === 2
                  ? "ข้อมูลสวนยาง"
                  : "รายละเอียดการปลูก"}
              </div>
            </div>
          ))}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="villageName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  หมู่บ้าน/ชุมชน <span className="text-red-500">*</span>
                </label>
                <input
                  id="villageName"
                  name="villageName"
                  type="text"
                  required
                  value={rubberFarm.villageName}
                  onChange={updateFarmData}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label
                  htmlFor="moo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  หมู่ที่ <span className="text-red-500">*</span>
                </label>
                <input
                  id="moo"
                  name="moo"
                  type="number"
                  required
                  value={rubberFarm.moo || ""}
                  onChange={updateFarmData}
                  min={0}
                  max={1000}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="road"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ถนน
                </label>
                <input
                  id="road"
                  name="road"
                  type="text"
                  value={rubberFarm.road}
                  onChange={updateFarmData}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label
                  htmlFor="alley"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ซอย
                </label>
                <input
                  id="alley"
                  name="alley"
                  type="text"
                  value={rubberFarm.alley}
                  onChange={updateFarmData}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Dropdown จังหวัด */}
              <div>
                <label
                  htmlFor="provinceId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  จังหวัด <span className="text-red-500">*</span>
                </label>
                <select
                  id="provinceId"
                  name="provinceId"
                  required
                  value={rubberFarm.provinceId || ""}
                  onChange={updateFarmData}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- เลือกจังหวัด --</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name_th}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown อำเภอ/เขต */}
              <div>
                <label
                  htmlFor="amphureId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  อำเภอ/เขต <span className="text-red-500">*</span>
                </label>
                <select
                  id="amphureId"
                  name="amphureId"
                  required
                  value={rubberFarm.amphureId || ""}
                  onChange={updateFarmData}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={!rubberFarm.provinceId}
                >
                  <option value="">-- เลือกอำเภอ/เขต --</option>
                  {amphures.map((amphure) => (
                    <option key={amphure.id} value={amphure.id}>
                      {amphure.name_th}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown ตำบล/แขวง */}
              <div>
                <label
                  htmlFor="tambonId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ตำบล/แขวง <span className="text-red-500">*</span>
                </label>
                <select
                  id="tambonId"
                  name="tambonId"
                  required
                  value={rubberFarm.tambonId || ""}
                  onChange={updateFarmData}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={!rubberFarm.amphureId}
                >
                  <option value="">-- เลือกตำบล/แขวง --</option>
                  {tambons.map((tambon) => (
                    <option key={tambon.id} value={tambon.id}>
                      {tambon.name_th}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* เพิ่มส่วนแผนที่ */}
            <div className="mt-6">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ตำแหน่งที่ตั้งสวนยาง <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">
                คลิกบนแผนที่หรือใช้เครื่องมือวาดเพื่อระบุตำแหน่งที่ตั้งของสวนยางพารา
              </p>
              <DynamicMapSelector
                location={rubberFarm.location}
                onChange={(newLocation) =>
                  setRubberFarm({
                    ...rubberFarm,
                    location: newLocation,
                  })
                }
                height="600px"
              />
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
                  <button
                    type="button"
                    onClick={() => removePlantingDetail(index)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      พันธุ์ยาง <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={detail.specie}
                      onChange={(e) =>
                        updatePlantingDetail(index, "specie", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">-- เลือกพันธุ์ยาง --</option>
                      <option value="RRIT 251">RRIT 251</option>
                      <option value="RRIM 600">RRIM 600</option>
                      <option value="BPM 24">BPM 24</option>
                      <option value="PB 235">PB 235</option>
                      <option value="RRIT 408">RRIT 408</option>
                      <option value="RRIT 226">RRIT 226</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      พื้นที่แปลง (ไร่) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={detail.areaOfPlot || ""}
                      onChange={(e) =>
                        updatePlantingDetail(
                          index,
                          "areaOfPlot",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนต้นยางทั้งหมด <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={detail.numberOfRubber || ""}
                      min={0}
                      onChange={(e) =>
                        updatePlantingDetail(
                          index,
                          "numberOfRubber",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนต้นยางที่กรีดได้
                    </label>
                    <input
                      type="number"
                      value={detail.numberOfTapping || ""}
                      min={0}
                      onChange={(e) =>
                        updatePlantingDetail(
                          index,
                          "numberOfTapping",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      อายุต้นยาง (ปี)
                    </label>
                    <input
                      type="number"
                      value={detail.ageOfRubber || ""}
                      min={0}
                      onChange={(e) =>
                        updatePlantingDetail(
                          index,
                          "ageOfRubber",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ปีที่เริ่มกรีด
                    </label>
                    <ReactDatePicker
                      selected={
                        detail.yearOfTapping
                          ? parseISO(detail.yearOfTapping)
                          : null
                      }
                      onChange={(date) =>
                        updatePlantingDetail(
                          index,
                          "yearOfTapping",
                          date ? date.toISOString() : ""
                        )
                      }
                      dateFormat="dd/MM/yyyy"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เดือนที่เริ่มกรีด
                    </label>
                    <ReactDatePicker
                      selected={
                        detail.monthOfTapping
                          ? parseISO(detail.monthOfTapping)
                          : null
                      }
                      onChange={(date) =>
                        updatePlantingDetail(
                          index,
                          "monthOfTapping",
                          date ? date.toISOString() : ""
                        )
                      }
                      dateFormat="dd/MM/yyyy"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ผลผลิตรวม (กก.)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={detail.totalProduction || ""}
                      onChange={(e) =>
                        updatePlantingDetail(
                          index,
                          "totalProduction",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add planting detail button */}
            <button
              type="button"
              onClick={addPlantingDetail}
              className="flex items-center text-sm font-medium text-green-600 hover:text-green-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              เพิ่มรายละเอียดการปลูก
            </button>

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
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              ย้อนกลับ
            </button>
          ) : (
            <Link
              href="/farmer/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="-ml-1 mr-2 h-5 w-5"
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
              กลับไปหน้าหลัก
            </Link>
          )}

          {step < maxSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              ถัดไป
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 -mr-1 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || success}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              บันทึกและส่งข้อมูล
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
