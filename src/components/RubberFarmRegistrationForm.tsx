"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import thaiProvinceData from "@/data/thai-provinces.json";
import DynamicMapSelector from "./maps/DynamicMap";
import { parseISO } from "date-fns";
import {
  PrimaryAutoComplete,
  PrimaryDropdown,
  PrimaryInputText,
  PrimaryInputNumber,
  PrimaryCalendar,
  PrimaryButton,
} from "./ui";

// ประเภทข้อมูลสำหรับโครงสร้าง API จังหวัด อำเภอ ตำบล (ตามที่มีใน FarmerRegisterPage)
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

// ประเภทข้อมูลสำหรับ Planting Detail
interface PlantingDetail {
  specie: string;
  areaOfPlot: number;
  numberOfRubber: number;
  numberOfTapping: number;
  ageOfRubber: number;
  yearOfTapping: string; // รูปแบบ ISO date string
  monthOfTapping: string; // รูปแบบ ISO date string
  totalProduction: number;
}

// ประเภทข้อมูลสำหรับ RubberFarm
interface RubberFarm {
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

export default function RubberFarmRegistrationForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const maxSteps = 3; // จำนวนขั้นตอนทั้งหมด
  const [farmerId, setFarmerId] = useState<number | null>(null);

  // ข้อมูลจังหวัด อำเภอ ตำบล
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);

  // ข้อมูลรายละเอียดการปลูก (Planting Details) - แก้ไขเพื่อใช้ ISO string เต็มรูปแบบ
  const [plantingDetails, setPlantingDetails] = useState<PlantingDetail[]>([
    {
      specie: "",
      areaOfPlot: 0,
      numberOfRubber: 0,
      numberOfTapping: 0,
      ageOfRubber: 0,
      yearOfTapping: new Date().toISOString(), // เปลี่ยนเป็น ISO string เต็มรูปแบบ
      monthOfTapping: new Date().toISOString(), // เปลี่ยนเป็น ISO string เต็มรูปแบบ
      totalProduction: 0,
    },
    {
      specie: "",
      areaOfPlot: 0,
      numberOfRubber: 0,
      numberOfTapping: 0,
      ageOfRubber: 0,
      yearOfTapping: new Date().toISOString(),
      monthOfTapping: new Date().toISOString(),
      totalProduction: 0,
    },
    {
      specie: "",
      areaOfPlot: 0,
      numberOfRubber: 0,
      numberOfTapping: 0,
      ageOfRubber: 0,
      yearOfTapping: new Date().toISOString(),
      monthOfTapping: new Date().toISOString(),
      totalProduction: 0,
    },
    {
      specie: "",
      areaOfPlot: 0,
      numberOfRubber: 0,
      numberOfTapping: 0,
      ageOfRubber: 0,
      yearOfTapping: new Date().toISOString(),
      monthOfTapping: new Date().toISOString(),
      totalProduction: 0,
    },
  ]);

  // ข้อมูลฟาร์มยาง
  const [rubberFarm, setRubberFarm] = useState<RubberFarm>({
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
      coordinates: [0, 0], // [longitude, latitude]
    },
    plantingDetails: [],
  });

  // ฟังก์ชันสำหรับแสดงวันที่ในรูปแบบต่างๆ
  const formatThaiDate = (
    dateString: string | null,
    format: "year" | "month" | "full" = "full"
  ): string => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (format === "year") {
      return date.toLocaleDateString("th-TH", { year: "numeric" });
    } else if (format === "month") {
      return date.toLocaleDateString("th-TH", { month: "long" });
    } else {
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // ดึงข้อมูล farmer ID จาก NextAuth session
  useEffect(() => {
    if (status === "loading") return; // รอจนกว่า session จะโหลดเสร็จ

    if (status === "unauthenticated") {
      router.push("/"); // ถ้าไม่ได้ login ให้กลับไปหน้า login
      return;
    }

    if (status === "authenticated" && session?.user?.roleData) {
      const roleData = session.user.roleData;
      if (roleData.farmerId) {
        setFarmerId(roleData.farmerId);
      } else {
        alert("ไม่พบข้อมูล farmerId ในระบบ กรุณาติดต่อผู้ดูแลระบบ");
      }
    }
  }, [status, session, router]);

  // โหลดข้อมูลจังหวัด อำเภอ ตำบล
  useEffect(() => {
    try {
      setIsLoadingProvinces(true);

      // แปลงโครงสร้างข้อมูลให้ตรงกับ interface ที่กำหนดไว้ (เหมือนใน FarmerRegisterPage)
      const formattedProvinces = thaiProvinceData.map((province) => ({
        id: province.id,
        name_th: province.name_th,
        name_en: province.name_en,
        // แปลง amphure เป็น amphures
        amphures: province.amphure.map((amp) => ({
          id: amp.id,
          name_th: amp.name_th,
          name_en: amp.name_en,
          // แปลง tambon เป็น tambons
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

  // อัปเดตอำเภอเมื่อเลือกจังหวัด
  useEffect(() => {
    if (rubberFarm.provinceId > 0) {
      const selectedProvince = provinces.find(
        (province) => province.id === rubberFarm.provinceId
      );
      if (selectedProvince) {
        setAmphures(selectedProvince.amphures);
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
    }
  }, [rubberFarm.provinceId, provinces]);

  // อัปเดตตำบลเมื่อเลือกอำเภอ
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
    }
  }, [rubberFarm.amphureId, amphures]);

  // อัปเดตตำบลเมื่อเลือกตำบล
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

  // อัปเดตข้อมูลฟาร์ม
  const updateFarmData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (
      name === "provinceId" ||
      name === "amphureId" ||
      name === "tambonId" ||
      name === "moo"
    ) {
      setRubberFarm({
        ...rubberFarm,
        [name]: parseInt(value) || 0,
      });
    } else {
      setRubberFarm({
        ...rubberFarm,
        [name]: value,
      });
    }
  };

  // อัปเดตข้อมูลรายละเอียดการปลูก - แก้ไขการจัดการวันที่
  const updatePlantingDetail = (
    index: number,
    field: keyof PlantingDetail,
    value: string | number | Date
  ) => {
    const updatedDetails = [...plantingDetails];

    // แปลงค่าตามประเภทข้อมูล
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
      // เมื่อได้รับค่าจาก Calendar ให้แปลงเป็น ISO string โดยใช้เวลาท้องถิ่น
      const date = value instanceof Date ? value : new Date(value as string);
      if (!Number.isNaN(date.getTime())) {
        // ตรวจสอบว่าเป็นวันที่ที่ถูกต้อง
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
      }
    }

    setPlantingDetails(updatedDetails);
  };

  // ตรวจสอบความถูกต้องของข้อมูลฟาร์ม
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

  // ตรวจสอบความถูกต้องของข้อมูลรายละเอียดการปลูก
  const validatePlantingDetails = (): boolean => {
    // ตรวจสอบว่ามีอย่างน้อยหนึ่งรายการที่กรอกข้อมูลครบถ้วน
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

  // การส่งข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!farmerId) {
        throw new Error("ไม่พบข้อมูลเกษตรกร กรุณาเข้าสู่ระบบใหม่");
      }

      // กรองเอาเฉพาะรายการที่กรอกข้อมูลครบถ้วน
      const validPlantingDetails = plantingDetails.filter(
        (detail) =>
          detail.specie && detail.areaOfPlot > 0 && detail.numberOfRubber > 0
      );

      // สร้างข้อมูลที่จะส่งไป API
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
        },
        plantingDetailsData: validPlantingDetails,
      };

      // เรียก API เพื่อส่งข้อมูล (ใช้ NextAuth session แทน localStorage token)
      const response = await fetch("/api/v1/rubber-farms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // ส่ง cookie session ไปด้วย
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "ไม่สามารถส่งข้อมูลได้");
      }

      const data = await response.json();
      setSuccess(true);

      // รอสักครู่แล้วเปลี่ยนหน้า
      setTimeout(() => {
        router.push("/farmer/dashboard"); // เปลี่ยนไปยังหน้า dashboard ของเกษตรกร
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting farm data:", error);
      setError(error.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  // ไปขั้นตอนถัดไป
  const nextStep = () => {
    if (step === 1 && !validateFarmData()) return;
    if (step === 2 && !validatePlantingDetails()) return;

    if (step < maxSteps) {
      setStep(step + 1);
      setError("");
    }
  };

  // ย้อนกลับขั้นตอนก่อนหน้า
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ยื่นขอใบรับรองแหล่งผลิต
        </h1>
        <p className="text-gray-600">
          กรอกข้อมูลสวนยางพาราและรายละเอียดการปลูกเพื่อขอรับรองมาตรฐานจีเอพี
        </p>
      </div>

      {/* Step Progress Indicator */}
      <div className="mb-8">
        {/* Desktop Version */}
        <div className="hidden md:block">
          <div className="flex items-center">
            {[1, 2, 3].map((s, index) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`
                w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 cursor-pointer
                ${
                  s <= step
                    ? "bg-green-600 border-green-600 text-white shadow-lg"
                    : s === step + 1
                    ? "bg-white border-green-300 text-green-600"
                    : "bg-white border-gray-300 text-gray-400"
                }
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

                  <div className="mt-3 text-center">
                    <div
                      className={`text-sm font-medium transition-colors duration-300 ${
                        s <= step ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {s === 1 && "ข้อมูลสวนยาง"}
                      {s === 2 && "รายละเอียดการปลูก"}
                      {s === 3 && "ยืนยันข้อมูล"}
                    </div>
                  </div>
                </div>

                {index < 2 && (
                  <div className="flex-1 mx-4 mb-6">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${
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
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
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

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">
              ขั้นตอนที่ {step}: {step === 1 && "ข้อมูลสวนยาง"}
              {step === 2 && "รายละเอียดการปลูก"}
              {step === 3 && "ยืนยันข้อมูล"}
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
          บันทึกข้อมูลสำเร็จ กำลังนำคุณไปยังหน้าติดตามสถานะ...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: ข้อมูลสวนยาง */}
        {step === 1 && (
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
                  min={1}
                  max={1000}
                  maxFractionDigits={0}
                  required
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Dropdown จังหวัด */}
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

              {/* Dropdown อำเภอ/เขต */}
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

              {/* Dropdown ตำบล/แขวง */}
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

            {/* เพิ่มส่วนแผนที่ - Updated with responsive styles */}
            <div className="col-span-2 mt-6 mb-8">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ตำแหน่งที่ตั้งสวนยาง <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">
                คลิกบนแผนที่หรือใช้เครื่องมือวาดเพื่อระบุตำแหน่งที่ตั้งของสวนยางพารา
              </p>

              {/* Simplified map container */}
              <div
                style={{
                  height: "500px",
                  width: "100%",
                  marginBottom: "100px", // เพิ่ม margin-bottom เพื่อให้เว้นระยะกับปุ่ม
                }}
              >
                <DynamicMapSelector
                  location={rubberFarm.location as any}
                  onChange={(newLocation) =>
                    setRubberFarm({
                      ...rubberFarm,
                      location: newLocation as any,
                    })
                  }
                  height="400px"
                />
              </div>

              {/* Location coordinates display */}
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

        {/* Step 2: รายละเอียดการปลูก */}
        {step === 2 && (
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
                className="p-4 border border-gray-200 rounded-md mb-4"
              >
                <h3 className="font-medium text-gray-800 mb-3">
                  รายการที่ {index + 1}
                </h3>

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
                      required
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
                      required
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
                      required
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
                      required
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
                      required
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
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: ยืนยันข้อมูล */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              ยืนยันข้อมูล
            </h2>

            <div className="p-4 bg-gray-50 rounded-md mb-6">
              <h3 className="font-medium text-gray-800 mb-3">ข้อมูลสวนยาง</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">หมู่บ้าน/ชุมชน:</p>
                  <p className="font-medium">{rubberFarm.villageName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">หมู่ที่:</p>
                  <p className="font-medium">{rubberFarm.moo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ถนน:</p>
                  <p className="font-medium">{rubberFarm.road || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ซอย:</p>
                  <p className="font-medium">{rubberFarm.alley || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ตำบล/แขวง:</p>
                  <p className="font-medium">{rubberFarm.subDistrict}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">อำเภอ/เขต:</p>
                  <p className="font-medium">{rubberFarm.district}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">จังหวัด:</p>
                  <p className="font-medium">{rubberFarm.province}</p>
                </div>
              </div>
            </div>

            <h3 className="font-medium text-gray-800 mb-3">
              รายละเอียดการปลูก
            </h3>
            {plantingDetails
              .filter(
                (detail) =>
                  detail.specie &&
                  detail.areaOfPlot > 0 &&
                  detail.numberOfRubber > 0
              )
              .map((detail, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-md mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">
                    รายการที่ {index + 1}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">พันธุ์ยาง:</p>
                      <p className="font-medium">{detail.specie}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        พื้นที่แปลง (ไร่):
                      </p>
                      <p className="font-medium">{detail.areaOfPlot}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        จำนวนต้นยางทั้งหมด:
                      </p>
                      <p className="font-medium">{detail.numberOfRubber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        จำนวนต้นยางที่กรีดได้:
                      </p>
                      <p className="font-medium">
                        {detail.numberOfTapping || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">อายุต้นยาง (ปี):</p>
                      <p className="font-medium">{detail.ageOfRubber || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ปีที่เริ่มกรีด:</p>
                      <p className="font-medium">
                        {formatThaiDate(detail.yearOfTapping, "year")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        เดือนที่เริ่มกรีด:
                      </p>
                      <p className="font-medium">
                        {formatThaiDate(detail.monthOfTapping, "month")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ผลผลิตรวม (กก.):</p>
                      <p className="font-medium">
                        {detail.totalProduction || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            <div className="mt-6">
              <div className="flex items-center mb-4">
                <input
                  id="confirm"
                  name="confirm"
                  type="checkbox"
                  required
                  onInvalid={(e) => {
                    (e.target as HTMLInputElement).setCustomValidity(
                      "กรุณายืนยันการรับรองความถูกต้องของข้อมูลก่อนส่งคำขอ"
                    );
                  }}
                  onChange={(e) => {
                    (e.target as HTMLInputElement).setCustomValidity("");
                  }}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="confirm"
                  className="ml-2 block text-sm text-gray-700"
                >
                  ข้าพเจ้าขอรับรองว่าข้อมูลที่แจ้งไว้ข้างต้นเป็นความจริงทุกประการ
                  และยินยอมให้เจ้าหน้าที่ตรวจสอบข้อมูลและสถานที่ตามที่ระบุไว้
                </label>
              </div>
              <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="font-medium text-yellow-800 mb-1">หมายเหตุ:</p>
                <p>
                  การแจ้งข้อมูลเท็จหรือปกปิดข้อเท็จจริงอาจส่งผลต่อการพิจารณาออกใบรับรองแหล่งผลิต
                </p>
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
            />
          ) : (
            <PrimaryButton
              label="กลับไปหน้าหลัก"
              variant="outlined"
              color="secondary"
              icon="pi pi-arrow-left"
              onClick={() => router.push("/farmer/dashboard")}
            />
          )}

          {step < maxSteps ? (
            <PrimaryButton
              label="ถัดไป"
              color="success"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={nextStep}
            />
          ) : (
            <PrimaryButton
              label="ยืนยันและส่งข้อมูล"
              color="success"
              type="submit"
              disabled={isLoading || success}
            />
          )}
        </div>
      </form>
    </div>
  );
}
