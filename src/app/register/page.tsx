"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import thaiProvinceData from "@/data/thai-provinces.json";

// Import reusable components
import PrimaryInputText from "@/components/ui/PrimaryInputText";
import PrimaryPassword from "@/components/ui/PrimaryPassword";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PrimaryDropdown from "@/components/ui/PrimaryDropdown";
import PrimaryInputMask from "@/components/ui/PrimaryInputMask";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryAutoComplete from "@/components/ui/PrimaryAutoComplete";
import { RadioButton } from "primereact/radiobutton";

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
    birthDate: null as Date | null,
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

  // Form validation errors
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    namePrefix: "",
    firstName: "",
    lastName: "",
    identificationNumber: "",
    birthDate: "",
    houseNo: "",
    moo: "",
    provinceId: "",
    amphureId: "",
    tambonId: "",
    mobilePhoneNumber: "",
  });

  // Memoized options for dropdowns
  const namePrefixOptions = useMemo(
    () => [
      { label: "นาย", value: "นาย" },
      { label: "นาง", value: "นาง" },
      { label: "นางสาว", value: "นางสาว" },
    ],
    []
  );

  const provinceOptions = useMemo(
    () =>
      provinces.map((province) => ({
        label: province.name_th,
        value: province.id,
      })),
    [provinces]
  );

  const amphureOptions = useMemo(
    () =>
      amphures.map((amphure) => ({
        label: amphure.name_th,
        value: amphure.id,
      })),
    [amphures]
  );

  const tambonOptions = useMemo(
    () =>
      tambons.map((tambon) => ({
        label: tambon.name_th,
        value: tambon.id,
      })),
    [tambons]
  );

  // Load provinces data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingProvinces(true);

        // Simulate async loading (even though data is imported)
        await new Promise((resolve) => setTimeout(resolve, 100));

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

    loadData();
  }, []);

  // Update amphures when province changes
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

  // Update tambons when amphure changes
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

  // Update zipcode when tambon changes
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

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return "กรุณากรอกอีเมล";
    if (!email.includes("@")) return "รูปแบบอีเมลไม่ถูกต้อง";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "กรุณากรอกรหัสผ่าน";
    if (password.length < 8) return "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
    return "";
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ) => {
    if (!confirmPassword) return "กรุณายืนยันรหัสผ่าน";
    if (password !== confirmPassword) return "รหัสผ่านไม่ตรงกัน";
    return "";
  };

  const validateIdentificationNumber = (idNumber: string) => {
    if (!idNumber) return "กรุณากรอกเลขบัตรประชาชน";

    // Remove dashes for validation
    const cleanedNumber = idNumber.replaceAll("-", "");

    if (cleanedNumber.length !== 13 || !/^\d+$/.test(cleanedNumber)) {
      return "เลขบัตรประชาชนไม่ถูกต้อง ต้องเป็นตัวเลข 13 หลัก";
    }
    return "";
  };

  const validateStep1 = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    setErrors((prev) => ({
      ...prev,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    }));

    if (emailError || passwordError || confirmPasswordError) {
      setError("กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง");
      return false;
    }

    setError("");
    return true;
  };

  const validateStep2 = () => {
    const newErrors = {
      namePrefix: !formData.namePrefix ? "กรุณาเลือกคำนำหน้า" : "",
      firstName: !formData.firstName ? "กรุณากรอกชื่อ" : "",
      lastName: !formData.lastName ? "กรุณากรอกนามสกุล" : "",
      identificationNumber: validateIdentificationNumber(
        formData.identificationNumber
      ),
      birthDate: !formData.birthDate ? "กรุณาเลือกวันเกิด" : "",
    };

    setErrors((prev) => ({ ...prev, ...newErrors }));

    const hasError = Object.values(newErrors).some((err) => err !== "");
    if (hasError) {
      setError("กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง");
      return false;
    }

    setError("");
    return true;
  };

  const validateStep3 = () => {
    const newErrors = {
      houseNo: !formData.houseNo ? "กรุณากรอกบ้านเลขที่" : "",
      moo: !formData.moo ? "กรุณากรอกหมู่ที่" : "",
      provinceId: !formData.provinceId ? "กรุณาเลือกจังหวัด" : "",
      amphureId: !formData.amphureId ? "กรุณาเลือกอำเภอ/เขต" : "",
      tambonId: !formData.tambonId ? "กรุณาเลือกตำบล/แขวง" : "",
    };

    setErrors((prev) => ({ ...prev, ...newErrors }));

    const hasError = Object.values(newErrors).some((err) => err !== "");
    if (hasError) {
      setError("กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง");
      return false;
    }

    setError("");
    return true;
  };

  const validateStep4 = () => {
    if (!formData.mobilePhoneNumber) {
      const mobileError = "กรุณากรอกเบอร์โทรศัพท์มือถือ";
      setErrors((prev) => ({ ...prev, mobilePhoneNumber: mobileError }));
      setError(mobileError);
      return false;
    }

    // Remove dashes for validation
    const cleanedMobile = formData.mobilePhoneNumber.replaceAll("-", "");

    if (cleanedMobile.length !== 10) {
      const mobileError = "เบอร์โทรศัพท์มือถือต้องเป็นตัวเลข 10 หลัก";
      setErrors((prev) => ({ ...prev, mobilePhoneNumber: mobileError }));
      setError(mobileError);
      return false;
    }

    setErrors((prev) => ({ ...prev, mobilePhoneNumber: "" }));
    setError("");
    return true;
  };

  // Navigation between steps
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

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep4()) return;

    setIsLoading(true);
    setError("");

    try {
      // Convert Date to YYYY-MM-DD format
      const birthDateString = formData.birthDate
        ? formData.birthDate.toISOString().split("T")[0]
        : "";

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
          identificationNumber: formData.identificationNumber.replaceAll(
            "-",
            ""
          ),
          birthDate: birthDateString,
          gender: formData.gender,
          houseNo: formData.houseNo,
          villageName: formData.villageName,
          moo: Number.parseInt(formData.moo, 10) || 0,
          road: formData.road,
          alley: formData.alley,
          subDistrict: formData.subDistrict,
          district: formData.district,
          provinceName: formData.provinceName,
          zipCode: formData.zipCode,
          phoneNumber: formData.phoneNumber.replaceAll("-", ""),
          mobilePhoneNumber: formData.mobilePhoneNumber.replaceAll("-", ""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "การลงทะเบียนล้มเหลว");
      }

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
      <div className="max-w-7xl mx-auto">
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
                  <PrimaryInputText
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, email: value }))
                    }
                    placeholder="email@example.com"
                    required
                    autoComplete="email"
                    invalid={!!errors.email}
                    errorMessage={errors.email}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    รหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <PrimaryPassword
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, password: value }))
                    }
                    placeholder="รหัสผ่านอย่างน้อย 8 ตัวอักษร"
                    required
                    autoComplete="new-password"
                    feedback={false}
                    toggleMask
                    invalid={!!errors.password}
                    errorMessage={errors.password}
                  />
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
                  <PrimaryPassword
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: value,
                      }))
                    }
                    placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                    required
                    autoComplete="new-password"
                    feedback={false}
                    toggleMask
                    invalid={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword}
                  />
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
                    <PrimaryDropdown
                      id="namePrefix"
                      name="namePrefix"
                      value={formData.namePrefix}
                      options={namePrefixOptions}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, namePrefix: value }))
                      }
                      placeholder="เลือกคำนำหน้า"
                      required
                      invalid={!!errors.namePrefix}
                      errorMessage={errors.namePrefix}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ชื่อ <span className="text-red-500">*</span>
                    </label>
                    <PrimaryInputText
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(value) => {
                        const regex = /^[a-zA-Zก-ฮะ-์\s]*$/;
                        if (regex.test(value)) {
                          setFormData((prev) => ({
                            ...prev,
                            firstName: value,
                          }));
                        }
                      }}
                      placeholder="ชื่อ"
                      maxLength={100}
                      required
                      invalid={!!errors.firstName}
                      errorMessage={errors.firstName}
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
                  <PrimaryInputText
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(value) => {
                      const regex = /^[a-zA-Zก-ฮะ-์\s]*$/;
                      if (regex.test(value)) {
                        setFormData((prev) => ({ ...prev, lastName: value }));
                      }
                    }}
                    placeholder="นามสกุล"
                    maxLength={100}
                    required
                    invalid={!!errors.lastName}
                    errorMessage={errors.lastName}
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
                  <PrimaryInputMask
                    id="identificationNumber"
                    name="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        identificationNumber: value,
                      }))
                    }
                    mask="9-9999-99999-99-9"
                    placeholder="X-XXXX-XXXXX-XX-X"
                    required
                    invalid={!!errors.identificationNumber}
                    errorMessage={errors.identificationNumber}
                  />
                </div>

                <div>
                  <label
                    htmlFor="birthDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    วันเดือนปีเกิด <span className="text-red-500">*</span>
                  </label>
                  <PrimaryCalendar
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, birthDate: value }))
                    }
                    placeholder="เลือกวันเกิด"
                    dateFormat="dd/mm/yy"
                    showIcon
                    minDate={new Date("1900-01-01")}
                    maxDate={new Date()}
                    required
                    invalid={!!errors.birthDate}
                    errorMessage={errors.birthDate}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    เพศ <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    <div className="flex items-center">
                      <RadioButton
                        inputId="gender-male"
                        name="gender"
                        value="ชาย"
                        checked={formData.gender === "ชาย"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            gender: e.value,
                          }))
                        }
                      />
                      <label
                        htmlFor="gender-male"
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        ชาย
                      </label>
                    </div>
                    <div className="flex items-center">
                      <RadioButton
                        inputId="gender-female"
                        name="gender"
                        value="หญิง"
                        checked={formData.gender === "หญิง"}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            gender: e.value,
                          }))
                        }
                      />
                      <label
                        htmlFor="gender-female"
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
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
                    <PrimaryInputText
                      id="houseNo"
                      name="houseNo"
                      value={formData.houseNo}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, houseNo: value }))
                      }
                      placeholder="บ้านเลขที่"
                      maxLength={10}
                      required
                      invalid={!!errors.houseNo}
                      errorMessage={errors.houseNo}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="villageName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      หมู่บ้าน
                    </label>
                    <PrimaryInputText
                      id="villageName"
                      name="villageName"
                      value={formData.villageName}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, villageName: value }))
                      }
                      placeholder="ชื่อหมู่บ้าน"
                      maxLength={255}
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
                    <PrimaryInputText
                      id="moo"
                      name="moo"
                      type="number"
                      value={formData.moo}
                      onChange={(value) => {
                        const numValue = Number.parseInt(value, 10);
                        if (
                          value === "" ||
                          (!Number.isNaN(numValue) &&
                            numValue >= 0 &&
                            numValue <= 1000)
                        ) {
                          setFormData((prev) => ({ ...prev, moo: value }));
                        }
                      }}
                      placeholder="หมู่ที่"
                      required
                      invalid={!!errors.moo}
                      errorMessage={errors.moo}
                    />
                  </div>

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
                      value={formData.road}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, road: value }))
                      }
                      placeholder="ชื่อถนน"
                      maxLength={100}
                    />
                  </div>
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
                    value={formData.alley}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, alley: value }))
                    }
                    placeholder="ชื่อซอย"
                    maxLength={100}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="provinceId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      จังหวัด <span className="text-red-500">*</span>
                    </label>
                    {isLoadingProvinces ? (
                      <div className="flex items-center justify-center h-12 border border-gray-300 rounded-md bg-gray-50">
                        <i className="pi pi-spin pi-spinner text-green-600 mr-2"></i>
                        <span className="text-sm text-gray-600">
                          กำลังโหลดข้อมูล...
                        </span>
                      </div>
                    ) : (
                      <PrimaryAutoComplete
                        id="provinceId"
                        name="provinceId"
                        value={formData.provinceId}
                        options={provinceOptions}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            provinceId: value,
                          }))
                        }
                        placeholder="เลือกหรือพิมพ์ค้นหาจังหวัด"
                        required
                        invalid={!!errors.provinceId}
                        errorMessage={errors.provinceId}
                      />
                    )}
                  </div>

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
                      value={formData.amphureId}
                      options={amphureOptions}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, amphureId: value }))
                      }
                      placeholder="เลือกหรือพิมพ์ค้นหาอำเภอ/เขต"
                      disabled={amphures.length === 0 || isLoadingProvinces}
                      required
                      invalid={!!errors.amphureId}
                      errorMessage={errors.amphureId}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      value={formData.tambonId}
                      options={tambonOptions}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, tambonId: value }))
                      }
                      placeholder="เลือกหรือพิมพ์ค้นหาตำบล/แขวง"
                      disabled={tambons.length === 0}
                      required
                      invalid={!!errors.tambonId}
                      errorMessage={errors.tambonId}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="zipCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      รหัสไปรษณีย์ <span className="text-red-500">*</span>
                    </label>
                    <PrimaryInputText
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, zipCode: value }))
                      }
                      placeholder="รหัสไปรษณีย์"
                      disabled
                      className="bg-gray-100"
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
                  <PrimaryInputMask
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, phoneNumber: value }))
                    }
                    mask="99-999-9999"
                    placeholder="0X-XXX-XXXX"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mobilePhoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    เบอร์โทรศัพท์มือถือ <span className="text-red-500">*</span>
                  </label>
                  <PrimaryInputMask
                    id="mobilePhoneNumber"
                    name="mobilePhoneNumber"
                    value={formData.mobilePhoneNumber}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        mobilePhoneNumber: value,
                      }))
                    }
                    mask="999-999-9999"
                    placeholder="0XX-XXX-XXXX"
                    required
                    invalid={!!errors.mobilePhoneNumber}
                    errorMessage={errors.mobilePhoneNumber}
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
                        e.target.setCustomValidity("");
                      }}
                    />
                    <label
                      htmlFor="terms"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      ข้าพเจ้ายอมรับ{" "}
                      <button
                        type="button"
                        className="text-green-600 hover:text-green-500 underline"
                        onClick={() => {
                          // Open terms and conditions (to be implemented)
                          console.log("Open terms and conditions");
                        }}
                      >
                        เงื่อนไขและข้อตกลงการใช้งาน
                      </button>{" "}
                      ของระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
                      การยางแห่งประเทศไทย
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <PrimaryButton
                  type="button"
                  onClick={prevStep}
                  variant="outlined"
                  color="secondary"
                  icon="pi pi-chevron-left"
                  label="ย้อนกลับ"
                />
              ) : (
                <Link href="/">
                  <PrimaryButton
                    type="button"
                    variant="outlined"
                    color="secondary"
                    icon="pi pi-arrow-left"
                    label="กลับไปหน้าเข้าสู่ระบบ"
                  />
                </Link>
              )}

              {step < 4 ? (
                <PrimaryButton
                  type="button"
                  onClick={nextStep}
                  icon="pi pi-chevron-right"
                  iconPos="right"
                  label="ถัดไป"
                  color="success"
                />
              ) : (
                <PrimaryButton
                  type="submit"
                  loading={isLoading}
                  icon="pi pi-check"
                  label="ลงทะเบียน"
                  color="success"
                />
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
