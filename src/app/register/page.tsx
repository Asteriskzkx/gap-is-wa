"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import thaiProvinceData from "@/data/thai-provinces.json";

// ประเภทข้อมูลสำหรับโครงสร้าง API จังหวัด อำเภอ ตำบล
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

export default function FarmerRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // ข้อมูลจังหวัด อำเภอ ตำบล
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    // ข้อมูลการเข้าสู่ระบบ
    email: "",
    password: "",
    confirmPassword: "",

    // ข้อมูลส่วนตัว
    namePrefix: "",
    firstName: "",
    lastName: "",
    identificationNumber: "",
    birthDate: "",
    gender: "ชาย",

    // ข้อมูลที่อยู่
    houseNo: "",
    villageName: "",
    moo: "",
    road: "",
    alley: "",
    subDistrict: "",
    district: "",
    provinceName: "",
    provinceId: 0,
    amphureId: 0,
    tambonId: 0,
    zipCode: "",

    // ข้อมูลการติดต่อ
    phoneNumber: "",
    mobilePhoneNumber: "",
  });

  // ใน useEffect สำหรับการโหลดข้อมูล
  useEffect(() => {
    try {
      setIsLoadingProvinces(true);

      // แปลงโครงสร้างข้อมูลให้ตรงกับ interface ที่กำหนดไว้
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
    if (formData.provinceId > 0) {
      const selectedProvince = provinces.find(
        (province) => province.id === formData.provinceId
      );
      if (selectedProvince) {
        setAmphures(selectedProvince.amphures);
        setFormData((prev) => ({
          ...prev,
          provinceName: selectedProvince.name_th,
          amphureId: 0,
          tambonId: 0,
          district: "",
          subDistrict: "",
          zipCode: "",
        }));
      }
    } else {
      setAmphures([]);
      setTambons([]);
    }
  }, [formData.provinceId, provinces]);

  // อัปเดตตำบลเมื่อเลือกอำเภอ
  useEffect(() => {
    if (formData.amphureId > 0) {
      const selectedAmphure = amphures.find(
        (amphure) => amphure.id === formData.amphureId
      );
      if (selectedAmphure) {
        setTambons(selectedAmphure.tambons);
        setFormData((prev) => ({
          ...prev,
          district: selectedAmphure.name_th,
          tambonId: 0,
          subDistrict: "",
          zipCode: "",
        }));
      }
    } else {
      setTambons([]);
    }
  }, [formData.amphureId, amphures]);

  // อัปเดตรหัสไปรษณีย์เมื่อเลือกตำบล
  useEffect(() => {
    if (formData.tambonId > 0) {
      const selectedTambon = tambons.find(
        (tambon) => tambon.id === formData.tambonId
      );
      if (selectedTambon) {
        setFormData((prev) => ({
          ...prev,
          subDistrict: selectedTambon.name_th,
          zipCode: selectedTambon.zip_code.toString(),
        }));
      }
    }
  }, [formData.tambonId, tambons]);

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // ถ้าค่าว่างให้ผ่าน
    if (!value) {
      setFormData((prev) => ({ ...prev, birthDate: value }));
      return;
    }

    // ตรวจสอบรูปแบบ YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      return; // ไม่อัปเดตถ้ารูปแบบไม่ถูกต้อง
    }

    const inputDate = new Date(value);
    const today = new Date();
    const minDate = new Date("1900-01-01");
    const maxDate = new Date();

    // ตั้งเวลาเป็น 00:00:00 เพื่อเปรียบเทียบเฉพาะวันที่
    maxDate.setHours(23, 59, 59, 999);

    // ตรวจสอบว่าเป็นวันที่ที่ถูกต้อง
    if (isNaN(inputDate.getTime())) {
      return; // ไม่อัปเดตถ้าวันที่ไม่ถูกต้อง
    }

    // ตรวจสอบปี (1900-ปีปัจจุบัน)
    const year = inputDate.getFullYear();
    if (year < 1900 || year > today.getFullYear()) {
      return; // ไม่อัปเดตถ้าปีไม่อยู่ในช่วงที่กำหนด
    }

    // ตรวจสอบว่าไม่เกินวันปัจจุบัน
    if (inputDate > maxDate) {
      return; // ไม่อัปเดตถ้าเป็นวันในอนาคต
    }

    // ตรวจสอบว่าไม่น้อยกว่าวันที่ขั้นต่ำ
    if (inputDate < minDate) {
      return; // ไม่อัปเดตถ้าน้อยกว่า 1900
    }

    // ถ้าผ่านการตรวจสอบทั้งหมดให้อัปเดต
    setFormData((prev) => ({ ...prev, birthDate: value }));
  };

  const updateFormData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // ตรวจสอบเฉพาะตัวอักษร
    if (name === "firstName") {
      const regex = /^[a-zA-Zก-ฮะ-์\s]*$/; // รองรับตัวอักษรภาษาไทย, ภาษาอังกฤษ, สระ, วรรณยุกต์ และช่องว่าง
      if (!regex.test(value)) {
        return; // ถ้าไม่ตรงกับ RegEx จะไม่อัปเดตค่า
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return false;
    }

    if (!formData.email.includes("@")) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง");
      return false;
    }

    if (formData.password.length < 8) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return false;
    }

    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (
      !formData.namePrefix ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.identificationNumber ||
      !formData.birthDate
    ) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return false;
    }

    // ตรวจสอบเลขบัตรประชาชน (ตัวอย่างเท่านั้น)
    if (
      formData.identificationNumber.length !== 13 ||
      !/^\d+$/.test(formData.identificationNumber)
    ) {
      setError("เลขบัตรประชาชนไม่ถูกต้อง ต้องเป็นตัวเลข 13 หลัก");
      return false;
    }

    setError("");
    return true;
  };

  const validateStep3 = () => {
    if (
      !formData.houseNo ||
      !formData.moo ||
      !formData.subDistrict ||
      !formData.district ||
      !formData.provinceName ||
      !formData.zipCode
    ) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return false;
    }

    if (!/^\d{5}$/.test(formData.zipCode)) {
      setError("รหัสไปรษณีย์ไม่ถูกต้อง ต้องเป็นตัวเลข 5 หลัก");
      return false;
    }

    setError("");
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;

    setStep(step + 1);
    setError("");
  };

  const prevStep = () => {
    setStep(step - 1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ตรวจสอบข้อมูลขั้นสุดท้าย
    if (!formData.mobilePhoneNumber) {
      setError("กรุณากรอกเบอร์โทรศัพท์มือถือ");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/farmers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          namePrefix: formData.namePrefix,
          firstName: formData.firstName,
          lastName: formData.lastName,
          identificationNumber: formData.identificationNumber,
          birthDate: formData.birthDate,
          gender: formData.gender,
          houseNo: formData.houseNo,
          villageName: formData.villageName,
          moo: parseInt(formData.moo, 10) || 0,
          road: formData.road,
          alley: formData.alley,
          subDistrict: formData.subDistrict,
          district: formData.district,
          provinceName: formData.provinceName,
          zipCode: formData.zipCode,
          phoneNumber: formData.phoneNumber,
          mobilePhoneNumber: formData.mobilePhoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "การลงทะเบียนล้มเหลว");
      }

      // ลงทะเบียนสำเร็จ
      router.push("/register/success");
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-green-50 to-white py-10 px-4 sm:px-6 lg:px-8">
      {" "}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="การยางแห่งประเทศไทย"
              width={100}
              height={100}
              priority
            />
          </Link>
          <h1 className="mt-4 text-2xl md:text-3xl font-bold text-green-800">
            ลงทะเบียนเกษตรกรใหม่
          </h1>
          <p className="mt-2 text-gray-600">
            สร้างบัญชีผู้ใช้สำหรับระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
          </p>
        </div>
        {/* Step progress bar and indicators */}
        <div className="mb-8">
          {/* Desktop Version */}
          <div className="hidden sm:block">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((s, index) => (
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
                        {s === 1 && "บัญชีผู้ใช้"}
                        {s === 2 && "ข้อมูลส่วนตัว"}
                        {s === 3 && "ที่อยู่"}
                        {s === 4 && "ติดต่อ"}
                      </div>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < 3 && (
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
          <div className="sm:hidden">
            {/* Step Indicators */}
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4].map((s, index) => (
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
                    {index < 3 && (
                      <div
                        className={`w-6 h-0.5 transition-all duration-300 ${
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
                ขั้นตอนที่ {step}: {step === 1 && "บัญชีผู้ใช้"}
                {step === 2 && "ข้อมูลส่วนตัว"}
                {step === 3 && "ที่อยู่"}
                {step === 4 && "ติดต่อ"}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {step} จาก 4 ขั้นตอน
              </div>
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit}>
            {/* Step 1: ข้อมูลบัญชีผู้ใช้ */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  ข้อมูลบัญชีผู้ใช้
                </h2>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={updateFormData}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    รหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={updateFormData}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="รหัสผ่านอย่างน้อย 8 ตัวอักษร"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    รหัสผ่านควรมีความยาวอย่างน้อย 8 ตัวอักษร
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={updateFormData}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: ข้อมูลส่วนตัว */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  ข้อมูลส่วนตัว
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label
                      htmlFor="namePrefix"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      คำนำหน้า <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="namePrefix"
                      name="namePrefix"
                      required
                      value={formData.namePrefix}
                      onChange={updateFormData}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">เลือกคำนำหน้า</option>
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ชื่อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      maxLength={100}
                      required
                      value={formData.firstName}
                      onChange={updateFormData}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    maxLength={100}
                    required
                    value={formData.lastName}
                    onChange={updateFormData}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="identificationNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    เลขบัตรประจำตัวประชาชน{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="identificationNumber"
                    name="identificationNumber"
                    type="text"
                    required
                    maxLength={13}
                    value={formData.identificationNumber}
                    onChange={updateFormData}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="เลขบัตรประชาชน 13 หลัก"
                  />
                </div>

                <div>
                  <label
                    htmlFor="birthDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    วันเดือนปีเกิด <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    required
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.birthDate}
                    onChange={handleBirthDateChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    เพศ <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-6">
                    <div className="flex items-center">
                      <input
                        id="gender-male"
                        name="gender"
                        type="radio"
                        value="ชาย"
                        checked={formData.gender === "ชาย"}
                        onChange={updateFormData}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label
                        htmlFor="gender-male"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        ชาย
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="gender-female"
                        name="gender"
                        type="radio"
                        value="หญิง"
                        checked={formData.gender === "หญิง"}
                        onChange={updateFormData}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label
                        htmlFor="gender-female"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        หญิง
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: ข้อมูลที่อยู่ */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  ข้อมูลที่อยู่
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="houseNo"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      บ้านเลขที่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="houseNo"
                      name="houseNo"
                      type="text"
                      maxLength={10}
                      required
                      value={formData.houseNo}
                      onChange={updateFormData}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="villageName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      หมู่บ้าน <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="villageName"
                      name="villageName"
                      type="text"
                      maxLength={255}
                      required
                      value={formData.villageName}
                      onChange={updateFormData}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      min={0}
                      max={1000}
                      value={formData.moo}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (
                          e.target.value === "" ||
                          (value >= 0 && value <= 1000)
                        ) {
                          updateFormData(e); // อัปเดตค่าเฉพาะเมื่ออยู่ในช่วงที่กำหนดหรือค่าว่าง
                        }
                      }}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

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
                      maxLength={100}
                      required
                      value={formData.road}
                      onChange={updateFormData}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
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
                    maxLength={100}
                    required
                    value={formData.alley}
                    onChange={updateFormData}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      value={formData.provinceId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          provinceId: parseInt(e.target.value, 10),
                        }))
                      }
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">เลือกจังหวัด</option>
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
                      value={formData.amphureId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          amphureId: parseInt(e.target.value, 10),
                        }))
                      }
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      disabled={amphures.length === 0}
                    >
                      <option value="">เลือกอำเภอ/เขต</option>
                      {amphures.map((amphure) => (
                        <option key={amphure.id} value={amphure.id}>
                          {amphure.name_th}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      value={formData.tambonId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tambonId: parseInt(e.target.value, 10),
                        }))
                      }
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      disabled={tambons.length === 0}
                    >
                      <option value="">เลือกตำบล/แขวง</option>
                      {tambons.map((tambon) => (
                        <option key={tambon.id} value={tambon.id}>
                          {tambon.name_th}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* รหัสไปรษณีย์ */}
                  <div>
                    <label
                      htmlFor="zipCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      รหัสไปรษณีย์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      readOnly
                      value={formData.zipCode}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: ข้อมูลการติดต่อ */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  ข้อมูลการติดต่อ
                </h2>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    เบอร์โทรศัพท์บ้าน
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    maxLength={9}
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // เอาเฉพาะตัวเลข
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: value,
                      }));
                    }}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="0XXXXXXXX"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mobilePhoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    เบอร์โทรศัพท์มือถือ <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="mobilePhoneNumber"
                    name="mobilePhoneNumber"
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobilePhoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // เอาเฉพาะตัวเลข
                      setFormData((prev) => ({
                        ...prev,
                        mobilePhoneNumber: value,
                      }));
                    }}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="0XXXXXXXXX"
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      onInvalid={(e) => {
                        (e.target as HTMLInputElement).setCustomValidity(
                          "กรุณายืนยันการยอมรับเงื่อนไขและข้อตกลงในการใช้งานระบบ"
                        );
                      }}
                      onChange={(e) => {
                        // ล้างข้อความ error เมื่อมีการเปลี่ยนแปลง
                        e.target.setCustomValidity("");
                      }}
                    />
                    <label
                      htmlFor="terms"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      ข้าพเจ้ายอมรับ{" "}
                      <a
                        href="#"
                        className="text-green-600 hover:text-green-500"
                      >
                        เงื่อนไขและข้อตกลงการใช้งาน
                      </a>{" "}
                      ของระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
                      การยางแห่งประเทศไทย
                    </label>
                  </div>
                </div>
              </div>
            )}

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
                  href="/"
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
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              )}

              {step < 4 ? (
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
                  disabled={isLoading}
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
                  ลงทะเบียน
                </button>
              )}
            </div>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500">
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            href="/"
            className="font-medium text-green-600 hover:text-green-500"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
