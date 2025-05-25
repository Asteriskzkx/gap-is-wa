"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import thaiProvinceData from "@/data/thai-provinces.json";
import DynamicMapSelector from "./maps/DynamicMap";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale/th"; // นำเข้า locale ภาษาไทย
import { addYears } from "date-fns/addYears"; // สำหรับการปรับปีเป็น พ.ศ.

// ลงทะเบียน locale ภาษาไทย
registerLocale("th", th);

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

  // ดึงข้อมูล farmer ID จาก localStorage เมื่อ component โหลด
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // เรียกใช้ API โดยตรง ไม่พยายามถอดรหัส token เอง
      fetchFarmerData(token);
    } else {
      router.push("/"); // ถ้าไม่มี token ให้กลับไปหน้า login
    }
  }, []);

  // ดึงข้อมูล farmer
  const fetchFarmerData = async (token: string) => {
    try {
      const response = await fetch("/api/v1/farmers/current", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Farmer data:", data);

        // ตรวจสอบโครงสร้างของข้อมูลที่ได้รับ
        if (data && data.farmerId) {
          setFarmerId(data.farmerId);
        } else {
          // เพิ่มตัวเลือกให้ผู้ใช้กรอก farmerId เอง
          alert("ไม่พบข้อมูล farmerId ในระบบ กรุณากรอกเอง");
          // หรือให้ผู้ใช้ติดต่อผู้ดูแลระบบ
          setError("ไม่พบข้อมูล farmerId กรุณาติดต่อผู้ดูแลระบบ");
        }
      } else {
        throw new Error("ไม่สามารถดึงข้อมูลเกษตรกรได้");
      }
    } catch (error) {
      console.error("Error fetching farmer data:", error);
      setError("ไม่สามารถดึงข้อมูลเกษตรกรได้ กรุณาเข้าสู่ระบบใหม่");
    }
  };

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
    value: string | number
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
      // เมื่อได้รับค่าจาก input type="date" ให้แปลงเป็น ISO string เต็มรูปแบบ
      const date = new Date(value as string);
      if (!isNaN(date.getTime())) {
        // ตรวจสอบว่าเป็นวันที่ที่ถูกต้อง
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

      // เรียก API เพื่อส่งข้อมูล
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/rubber-farms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (
                      e.target.value === "" ||
                      (value >= 1 && value <= 1000)
                    ) {
                      updateFarmData(e); // อัปเดตค่าเฉพาะเมื่ออยู่ในช่วงที่กำหนด
                    }
                  }}
                  min={1}
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
                  ถนน <span className="text-red-500">*</span>
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
                  ซอย <span className="text-red-500">*</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="col-span-3 mt-6">
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
                  location={rubberFarm.location as any} // ใช้ as any เพื่อแก้ปัญหา TypeScript ชั่วคราว
                  onChange={(newLocation) =>
                    setRubberFarm({
                      ...rubberFarm,
                      location: newLocation as any, // ใช้ as any เพื่อแก้ปัญหา TypeScript ชั่วคราว
                    })
                  }
                  height="600px" // ปรับความสูงให้เหมาะสม
                />
              </div>
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
                      step="0.0001"
                      min={0}
                      max={10000}
                      required
                      value={detail.areaOfPlot || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (
                          e.target.value === "" ||
                          (value >= 0 && value <= 10000)
                        ) {
                          const formattedValue = parseFloat(value.toFixed(4));

                          updatePlantingDetail(
                            index,
                            "areaOfPlot",
                            formattedValue
                          );
                        }
                      }}
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
                      max={10000}
                      required
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (
                          e.target.value === "" ||
                          (value >= 0 && value <= 10000)
                        ) {
                          updatePlantingDetail(index, "numberOfRubber", value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนต้นยางที่กรีดได้{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={detail.numberOfTapping || ""}
                      min={0}
                      max={10000}
                      required
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (
                          e.target.value === "" ||
                          (value >= 0 && value <= 10000)
                        ) {
                          updatePlantingDetail(index, "numberOfTapping", value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      อายุต้นยาง (ปี) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={detail.ageOfRubber || ""}
                      min={0}
                      max={100}
                      required
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (
                          e.target.value === "" ||
                          (value >= 0 && value <= 100)
                        ) {
                          updatePlantingDetail(index, "ageOfRubber", value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ปีที่เริ่มกรีด <span className="text-red-500">*</span>
                    </label>
                    <ReactDatePicker
                      selected={
                        detail.yearOfTapping
                          ? parseISO(detail.yearOfTapping)
                          : null
                      }
                      onChange={(date: Date | null) =>
                        updatePlantingDetail(
                          index,
                          "yearOfTapping",
                          date ? date.toISOString() : ""
                        )
                      }
                      locale="th"
                      dateFormat="พ.ศ. yyyy"
                      showYearPicker
                      yearItemNumber={6}
                      renderYearContent={(year) => year + 543} // แสดงปีเป็น พ.ศ. โดยไม่เปลี่ยนค่าจริงของ Date
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เดือนที่เริ่มกรีด <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={
                        detail.monthOfTapping
                          ? new Date(detail.monthOfTapping).getMonth()
                          : ""
                      }
                      onChange={(e) => {
                        const month = parseInt(e.target.value);
                        const date = new Date();
                        date.setMonth(month);
                        updatePlantingDetail(
                          index,
                          "monthOfTapping",
                          date.toISOString()
                        );
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="0">มกราคม</option>
                      <option value="1">กุมภาพันธ์</option>
                      <option value="2">มีนาคม</option>
                      <option value="3">เมษายน</option>
                      <option value="4">พฤษภาคม</option>
                      <option value="5">มิถุนายน</option>
                      <option value="6">กรกฎาคม</option>
                      <option value="7">สิงหาคม</option>
                      <option value="8">กันยายน</option>
                      <option value="9">ตุลาคม</option>
                      <option value="10">พฤศจิกายน</option>
                      <option value="11">ธันวาคม</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ผลผลิตรวม (กก.) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      min={0}
                      max={10000}
                      value={detail.totalProduction || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (
                          e.target.value === "" ||
                          (value >= 0 && value <= 10000)
                        ) {
                          const formattedValue = parseFloat(value.toFixed(4));

                          updatePlantingDetail(
                            index,
                            "totalProduction",
                            formattedValue
                          );
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
              ยืนยันและส่งข้อมูล
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
