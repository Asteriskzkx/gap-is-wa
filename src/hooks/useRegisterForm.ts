import thaiProvinceData from "@/data/thai-provinces.json";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  namePrefix: string;
  firstName: string;
  lastName: string;
  identificationNumber: string;
  birthDate: string;
  gender: string;
  houseNo: string;
  villageName: string;
  moo: string;
  road: string;
  alley: string;
  subDistrict: string;
  district: string;
  provinceName: string;
  provinceId: number;
  amphureId: number;
  tambonId: number;
  zipCode: string;
  phoneNumber: string;
  mobilePhoneNumber: string;
}

interface FormErrors {
  email: string;
  password: string;
  confirmPassword: string;
  namePrefix: string;
  firstName: string;
  lastName: string;
  identificationNumber: string;
  birthDate: string;
  gender: string;
  houseNo: string;
  villageName: string;
  moo: string;
  road: string;
  alley: string;
  provinceId: string;
  amphureId: string;
  tambonId: string;
  phoneNumber: string;
  mobilePhoneNumber: string;
}

export function useRegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // ข้อมูลจังหวัด อำเภอ ตำบล
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [amphures, setAmphures] = useState<Amphure[]>([]);
  const [tambons, setTambons] = useState<Tambon[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);

  // สำหรับการตรวจสอบ email ซ้ำ
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // สำหรับการยอมรับเงื่อนไข
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    namePrefix: "",
    firstName: "",
    lastName: "",
    identificationNumber: "",
    birthDate: "",
    gender: "ชาย",
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
    phoneNumber: "",
    mobilePhoneNumber: "",
  });

  // Form validation errors
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    password: "",
    confirmPassword: "",
    namePrefix: "",
    firstName: "",
    lastName: "",
    identificationNumber: "",
    birthDate: "",
    gender: "",
    houseNo: "",
    villageName: "",
    moo: "",
    road: "",
    alley: "",
    provinceId: "",
    amphureId: "",
    tambonId: "",
    phoneNumber: "",
    mobilePhoneNumber: "",
  });

  // Memoized options
  const namePrefixOptions = useMemo(
    () => [
      { label: "นาย", value: "นาย" },
      { label: "นาง", value: "นาง" },
      { label: "นางสาว", value: "นางสาว" },
    ],
    []
  );

  const genderOptions = useMemo(
    () => [
      { label: "ชาย", value: "ชาย" },
      { label: "หญิง", value: "หญิง" },
      { label: "ไม่ระบุ", value: "ไม่ระบุ" },
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

  // ตรวจสอบ email ซ้ำจาก API (เรียกเมื่อผู้ใช้กดปุ่มเท่านั้น)
  const checkDuplicateEmail = async () => {
    const email = formData.email;

    // ตรวจสอบ format ก่อน
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    setIsCheckingEmail(true);
    setIsEmailVerified(false);

    try {
      const response = await fetch(
        `/api/v1/users/check-dup-email?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (data.isDuplicate) {
        setErrors((prev) => ({ ...prev, email: "อีเมลนี้ถูกใช้งานแล้ว" }));
        setIsEmailVerified(false);
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
        setIsEmailVerified(true);
      }
    } catch (error) {
      console.error("Error checking duplicate email:", error);
      setErrors((prev) => ({ ...prev, email: "เกิดข้อผิดพลาดในการตรวจสอบ" }));
      setIsEmailVerified(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // ฟังก์ชันเมื่อ email เปลี่ยน - reset verification status
  const handleEmailChange = (email: string) => {
    setFormData((prev) => ({ ...prev, email }));
    setIsEmailVerified(false);
    setErrors((prev) => ({ ...prev, email: "" }));
  };

  const validatePassword = (password: string) => {
    if (!password) return "กรุณากรอกรหัสผ่าน";
    if (password.length < 8) return "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
    if (!/[A-Z]/.test(password)) return "รหัสผ่านต้องมีตัวพิมพ์ใหญ่";
    if (!/\d/.test(password)) return "รหัสผ่านต้องมีตัวเลข";
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
    const cleanedNumber = idNumber.replaceAll("-", "");
    if (cleanedNumber.length !== 13 || !/^\d+$/.test(cleanedNumber)) {
      return "เลขบัตรประชาชนไม่ถูกต้อง ต้องเป็นตัวเลข 13 หลัก";
    }
    return "";
  };

  const validateStep1 = async () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    // ตรวจสอบว่า email ถูก verify แล้วหรือยัง
    let finalEmailError = emailError;
    if (!emailError && !isEmailVerified) {
      finalEmailError = "กรุณากดปุ่มตรวจสอบอีเมลก่อน";
    }

    setErrors((prev) => ({
      ...prev,
      email: finalEmailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    }));

    if (finalEmailError || passwordError || confirmPasswordError) {
      setError("กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง");
      return false;
    }

    setError("");
    return true;
  };

  const validateStep2 = () => {
    const newErrors = {
      namePrefix: formData.namePrefix ? "" : "กรุณาเลือกคำนำหน้า",
      firstName: formData.firstName ? "" : "กรุณากรอกชื่อ",
      lastName: formData.lastName ? "" : "กรุณากรอกนามสกุล",
      identificationNumber: validateIdentificationNumber(
        formData.identificationNumber
      ),
      birthDate: formData.birthDate ? "" : "กรุณาเลือกวันเกิด",
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
      houseNo: formData.houseNo ? "" : "กรุณากรอกบ้านเลขที่",
      villageName: formData.villageName ? "" : "กรุณากรอกชื่อหมู่บ้าน",
      moo: formData.moo ? "" : "กรุณากรอกหมู่ที่",
      road: formData.road ? "" : "กรุณากรอกชื่อถนน",
      alley: formData.alley ? "" : "กรุณากรอกชื่อซอย",
      provinceId: formData.provinceId ? "" : "กรุณาเลือกจังหวัด",
      amphureId: formData.amphureId ? "" : "กรุณาเลือกอำเภอ/เขต",
      tambonId: formData.tambonId ? "" : "กรุณาเลือกตำบล/แขวง",
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
    if (!formData.phoneNumber) {
      const phoneError = "กรุณากรอกเบอร์โทรศัพท์";
      setErrors((prev) => ({ ...prev, phoneNumber: phoneError }));
      setError(phoneError);
      return false;
    }

    const cleanedPhone = formData.phoneNumber
      .replaceAll("-", "")
      .replaceAll("_", "");
    if (cleanedPhone.length !== 9 || !/^\d+$/.test(cleanedPhone)) {
      const phoneError = "เบอร์โทรศัพท์ต้องเป็นตัวเลข 9 หลัก";
      setErrors((prev) => ({ ...prev, phoneNumber: phoneError }));
      setError(phoneError);
      return false;
    }

    if (!formData.mobilePhoneNumber) {
      const mobileError = "กรุณากรอกเบอร์โทรศัพท์มือถือ";
      setErrors((prev) => ({ ...prev, mobilePhoneNumber: mobileError }));
      setError(mobileError);
      return false;
    }

    const cleanedMobile = formData.mobilePhoneNumber
      .replaceAll("-", "")
      .replaceAll("_", "");
    if (cleanedMobile.length !== 10 || !/^\d+$/.test(cleanedMobile)) {
      const mobileError = "เบอร์โทรศัพท์มือถือต้องเป็นตัวเลข 10 หลัก";
      setErrors((prev) => ({ ...prev, mobilePhoneNumber: mobileError }));
      setError(mobileError);
      return false;
    }

    setErrors((prev) => ({ ...prev, phoneNumber: "", mobilePhoneNumber: "" }));
    setError("");
    return true;
  };

  // Navigation between steps
  const nextStep = async () => {
    if (step === 1 && !(await validateStep1())) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;

    setStep(step + 1);
    setError("");
  };

  const prevStep = () => {
    // Reset terms acceptance when leaving step 4
    if (step === 4) {
      setTermsAccepted(false);
    }
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
      const birthDateString = formData.birthDate || "";

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

  return {
    // State
    isLoading,
    error,
    step,
    formData,
    errors,
    provinces,
    amphures,
    tambons,
    isLoadingProvinces,
    isCheckingEmail,
    isEmailVerified,
    termsAccepted,

    // Options
    namePrefixOptions,
    genderOptions,
    provinceOptions,
    amphureOptions,
    tambonOptions,

    // Actions
    setFormData,
    setErrors,
    setError,
    setTermsAccepted,
    nextStep,
    prevStep,
    handleSubmit,
    handleEmailChange,
    checkDuplicateEmail,
    validateEmail,
    validatePassword,
  };
}
