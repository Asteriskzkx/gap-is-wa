import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryInputText from "@/components/ui/PrimaryInputText";
import PrimaryInputMask from "@/components/ui/PrimaryInputMask";
import PrimaryDropdown from "@/components/ui/PrimaryDropdown";
import PrimaryAutoComplete from "@/components/ui/PrimaryAutoComplete";
import thaiProvinceData from "@/data/thai-provinces.json";

type Option = { name: string; value: string };

export enum UserRole {
  BASIC = "BASIC",
  FARMER = "FARMER",
  AUDITOR = "AUDITOR",
  COMMITTEE = "COMMITTEE",
  ADMIN = "ADMIN",
}

// Consolidated address state (Issue #7)
type AddressState = {
  houseNo: string;
  villageName: string;
  moo: string; // Will validate > 0
  road: string;
  alley: string;
  subDistrict: string;
  district: string;
  provinceName: string;
  zipCode: string;
};

type Props = {
  namePrefixOptions?: Option[];
  visible: boolean;
  onHide: () => void;
  onCreated: () => Promise<void>;
  showSuccess: () => void;
  showError: (message?: string) => void;
};

export const AddUserDialog: React.FC<Props> = ({
  visible,
  namePrefixOptions,
  onHide,
  onCreated,
  showSuccess,
  showError,
}) => {
  // User role and basic info
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [namePrefix, setNamePrefix] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Farmer-specific personal info
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState("ชาย");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mobilePhoneNumber, setMobilePhoneNumber] = useState("");

  // Consolidated address state (Issue #7 - reduces re-renders)
  const [address, setAddress] = useState<AddressState>({
    houseNo: "",
    villageName: "",
    moo: "",
    road: "",
    alley: "",
    subDistrict: "",
    district: "",
    provinceName: "",
    zipCode: "",
  });

  // Location hierarchy with proper type safety (Issue #4)
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [amphureId, setAmphureId] = useState<number | "">("");
  const [tambonId, setTambonId] = useState<number | "">("");
  const [provinces, setProvinces] = useState<any[]>([]);
  const [amphures, setAmphures] = useState<any[]>([]);
  const [tambons, setTambons] = useState<any[]>([]);

  // Form state tracking (Issues #1, #2)
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Helper to update address field
  const updateAddress = useCallback(
    (field: keyof AddressState, value: string) => {
      setAddress((prev) => ({ ...prev, [field]: value }));
      setDirty((d) => ({ ...d, [field]: true }));
    },
    []
  );

  // Helper to mark field touched (Issue #1)
  const markTouched = useCallback((field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
  }, []);

  const reset = () => {
    setSelectedRole(null);
    setNamePrefix("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setIdentificationNumber("");
    setBirthDate(null);
    setGender("ชาย");
    setPhoneNumber("");
    setMobilePhoneNumber("");
    setAddress({
      houseNo: "",
      villageName: "",
      moo: "",
      road: "",
      alley: "",
      subDistrict: "",
      district: "",
      provinceName: "",
      zipCode: "",
    });
    setProvinceId("");
    setAmphureId("");
    setTambonId("");
    setDirty({});
    setTouched({});
  };

  const prefixOptions: Option[] = namePrefixOptions ?? [
    { name: "นาย", value: "นาย" },
    { name: "นางสาว", value: "นางสาว" },
    { name: "นาง", value: "นาง" },
  ];

  // Load provinces on mount
  useEffect(() => {
    const formattedProvinces = (thaiProvinceData as any[]).map(
      (province: any) => ({
        id: province.id,
        name_th: province.name_th,
        amphures: province.amphure.map((amp: any) => ({
          id: amp.id,
          name_th: amp.name_th,
          tambons: amp.tambon.map((tam: any) => ({
            id: tam.id,
            name_th: tam.name_th,
            zip_code: tam.zip_code,
          })),
        })),
      })
    );
    setProvinces(formattedProvinces);
  }, []);

  // When province changes, update amphures and reset dependent fields (Issue #2)
  useEffect(() => {
    if (provinceId !== "") {
      const p = provinces.find((p) => p.id === provinceId);
      if (p) {
        setAmphures(p.amphures);
        setAddress((prev) => ({ ...prev, provinceName: p.name_th }));
        setAmphureId("");
        setTambonId("");
        // Reset touched for cascading fields (Issue #2)
        setTouched((t) => ({
          ...t,
          amphureId: false,
          tambonId: false,
          zipCode: false,
        }));
        setAddress((prev) => ({
          ...prev,
          district: "",
          subDistrict: "",
          zipCode: "",
        }));
      }
    } else {
      setAmphures([]);
      setTambons([]);
    }
  }, [provinceId, provinces]);

  // When amphure changes, update tambons and reset dependent fields (Issue #2)
  useEffect(() => {
    if (amphureId !== "") {
      const a = amphures.find((a) => a.id === amphureId);
      if (a) {
        setTambons(a.tambons);
        setAddress((prev) => ({ ...prev, district: a.name_th }));
        setTambonId("");
        // Reset touched for cascading fields (Issue #2)
        setTouched((t) => ({
          ...t,
          tambonId: false,
          zipCode: false,
        }));
        setAddress((prev) => ({
          ...prev,
          subDistrict: "",
          zipCode: "",
        }));
      }
    } else {
      setTambons([]);
    }
  }, [amphureId, amphures]);

  // When tambon changes, auto-fill zipCode
  useEffect(() => {
    if (tambonId !== "") {
      const t = tambons.find((t) => t.id === tambonId);
      if (t) {
        setAddress((prev) => ({
          ...prev,
          subDistrict: t.name_th,
          zipCode: String(t.zip_code),
        }));
      }
    }
  }, [tambonId, tambons]);

  const provinceOptions = useMemo(
    () => provinces.map((p) => ({ label: p.name_th, value: p.id })),
    [provinces]
  );
  const amphureOptions = useMemo(
    () => amphures.map((a) => ({ label: a.name_th, value: a.id })),
    [amphures]
  );
  const tambonOptions = useMemo(
    () => tambons.map((t) => ({ label: t.name_th, value: t.id })),
    [tambons]
  );

  // Validation helpers
  const isValidId = (id: string) => id.replaceAll("-", "").length === 13;
  const isValidMobile = (mobile: string) => mobile.replaceAll("-", "").length === 10;
  const isValidMoo = (moo: string) => moo !== "" && Number(moo) > 0; // Issue #3

  // Memoized canSubmit to prevent recalculation (Issue #5)
  const canSubmit = useMemo(() => {
    if (!selectedRole) return false;
    if (
      !namePrefix ||
      !firstName ||
      !lastName ||
      !email ||
      !email.includes("@")
    )
      return false;

    if (selectedRole === UserRole.FARMER) {
      return (
        isValidId(identificationNumber) &&
        birthDate !== null &&
        gender &&
        address.houseNo &&
        isValidMoo(address.moo) &&
        provinceId !== "" &&
        amphureId !== "" &&
        tambonId !== "" &&
        isValidMobile(mobilePhoneNumber)
      );
    }
    return true;
  }, [
    selectedRole,
    namePrefix,
    firstName,
    lastName,
    email,
    identificationNumber,
    birthDate,
    gender,
    address,
    provinceId,
    amphureId,
    tambonId,
    mobilePhoneNumber,
  ]);

  // Build farmer payload with clean data
  const buildFarmerPayload = () => {
    return {
      identificationNumber: identificationNumber.replaceAll("-", ""),
      birthDate: birthDate ? birthDate.toISOString().split("T")[0] : null,
      gender,
      houseNo: address.houseNo,
      villageName: address.villageName,
      moo: Number(address.moo),
      road: address.road,
      alley: address.alley,
      subDistrict: address.subDistrict,
      district: address.district,
      provinceName: address.provinceName,
      zipCode: address.zipCode,
      phoneNumber: phoneNumber.replaceAll("-", ""),
      mobilePhoneNumber: mobilePhoneNumber.replaceAll("-", ""),
    };
  };

  // Submit with improved error handling (Issue #6)
  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const payload: any = {
        role: selectedRole,
        namePrefix,
        firstName,
        lastName,
        email,
      };

      if (selectedRole === UserRole.FARMER) {
        Object.assign(payload, buildFarmerPayload());
      }

      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Issue #6: Extract error message from backend
        try {
          const errorData = await res.json();
          throw new Error(errorData.message || `Error: ${res.status}`);
        } catch {
          throw new Error(`Create failed: ${res.status} ${res.statusText}`);
        }
      }

      await onCreated();
      showSuccess();
      onHide();
      reset();
    } catch (e) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : "Unknown error";
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="เพิ่มผู้ใช้ใหม่"
      visible={visible}
      style={{ width: "42rem" }}
      onHide={() => {
        onHide();
        reset();
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Role Selection */}
        <PrimaryDropdown
          value={selectedRole}
          options={Object.values(UserRole).map((r) => ({ label: r, value: r }))}
          onChange={(v) => {
            setSelectedRole(v);
            setDirty((d) => ({ ...d, selectedRole: true }));
          }}
          onBlur={() => markTouched("selectedRole")}
          placeholder="เลือกบทบาท (Role)"
          required
          invalid={
            (dirty.selectedRole || touched.selectedRole) && !selectedRole
          }
          errorMessage={
            (dirty.selectedRole || touched.selectedRole) && !selectedRole
              ? "กรุณาเลือกบทบาท"
              : ""
          }
        />

        {!selectedRole && (
          <div className="text-gray-500 text-sm">
            เลือก Role เพื่อกรอกข้อมูล
          </div>
        )}

        {selectedRole && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <span className="flex flex-col">
              <label className="text-sm mb-1">
                คำนำหน้า <span className="text-red-500">*</span>
              </label>
              <PrimaryDropdown
                value={namePrefix}
                options={prefixOptions.map((p) => ({
                  label: p.name,
                  value: p.value,
                }))}
                onChange={(v) => {
                  setNamePrefix(v);
                  setDirty((d) => ({ ...d, namePrefix: true }));
                }}
                onBlur={() => markTouched("namePrefix")}
                placeholder="คำนำหน้า"
                required
                invalid={
                  (dirty.namePrefix || touched.namePrefix) && !namePrefix
                }
                errorMessage={
                  (dirty.namePrefix || touched.namePrefix) && !namePrefix
                    ? "กรุณาเลือกคำนำหน้า"
                    : ""
                }
              />
            </span>

            <span className="flex flex-col">
              <label className="text-sm mb-1">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <PrimaryInputText
                value={firstName}
                onChange={(v) => {
                  setFirstName(v);
                  setDirty((d) => ({ ...d, firstName: true }));
                }}
                onBlur={() => markTouched("firstName")}
                required
                invalid={(dirty.firstName || touched.firstName) && !firstName}
                errorMessage={
                  (dirty.firstName || touched.firstName) && !firstName
                    ? "กรุณากรอกชื่อ"
                    : ""
                }
              />
            </span>

            <span className="flex flex-col">
              <label className="text-sm mb-1">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <PrimaryInputText
                value={lastName}
                onChange={(v) => {
                  setLastName(v);
                  setDirty((d) => ({ ...d, lastName: true }));
                }}
                onBlur={() => markTouched("lastName")}
                required
                invalid={(dirty.lastName || touched.lastName) && !lastName}
                errorMessage={
                  (dirty.lastName || touched.lastName) && !lastName
                    ? "กรุณากรอกนามสกุล"
                    : ""
                }
              />
            </span>

            <span className="flex flex-col">
              <label className="text-sm mb-1">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <PrimaryInputText
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  setDirty((d) => ({ ...d, email: true }));
                }}
                onBlur={() => markTouched("email")}
                type="email"
                required
                invalid={
                  (dirty.email || touched.email) &&
                  (!email || !email.includes("@"))
                }
                errorMessage={
                  dirty.email || touched.email
                    ? !email
                      ? "กรุณากรอกอีเมล"
                      : !email.includes("@")
                      ? "รูปแบบอีเมลไม่ถูกต้อง"
                      : ""
                    : ""
                }
              />
            </span>

            {/* Farmer-Specific Fields */}
            {selectedRole === UserRole.FARMER && (
              <>
                {/* Personal Info */}
                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    เลขบัตรประชาชน <span className="text-red-500">*</span>
                  </label>
                  <PrimaryInputMask
                    value={identificationNumber}
                    onChange={(v) => {
                      setIdentificationNumber(v);
                      setDirty((d) => ({ ...d, identificationNumber: true }));
                    }}
                    onBlur={() => markTouched("identificationNumber")}
                    mask="9-9999-99999-99-9"
                    required
                    invalid={
                      (dirty.identificationNumber ||
                        touched.identificationNumber) &&
                      !isValidId(identificationNumber)
                    }
                    errorMessage={
                      dirty.identificationNumber || touched.identificationNumber
                        ? identificationNumber
                          ? !isValidId(identificationNumber)
                            ? "ต้องมี 13 หลัก"
                            : ""
                          : "กรุณากรอกเลขบัตร"
                        : ""
                    }
                    placeholder="X-XXXX-XXXXX-XX-X"
                  />
                </span>

                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    วันเดือนปีเกิด <span className="text-red-500">*</span>
                  </label>
                  <PrimaryCalendar
                    id="birthDate"
                    name="birthDate"
                    value={birthDate}
                    onChange={(v) => {
                      setBirthDate(v);
                      setDirty((d) => ({ ...d, birthDate: true }));
                    }}
                    onBlur={() => markTouched("birthDate")}
                    placeholder="เลือกวันเกิด"
                    dateFormat="dd/mm/yy"
                    showIcon
                    minDate={new Date("1900-01-01")}
                    maxDate={new Date()}
                    required
                    invalid={
                      (dirty.birthDate || touched.birthDate) &&
                      birthDate === null
                    }
                    errorMessage={
                      (dirty.birthDate || touched.birthDate) &&
                      birthDate === null
                        ? "กรุณาเลือกวันเกิด"
                        : ""
                    }
                  />
                </span>

                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    เพศ <span className="text-red-500">*</span>
                  </label>
                  <PrimaryDropdown
                    value={gender}
                    onChange={(v) => {
                      setGender(v);
                      setDirty((d) => ({ ...d, gender: true }));
                    }}
                    onBlur={() => markTouched("gender")}
                    options={[
                      { label: "ชาย", value: "ชาย" },
                      { label: "หญิง", value: "หญิง" },
                      { label: "ไม่ระบุ", value: "ไม่ระบุ" },
                    ]}
                    placeholder="เลือกเพศ"
                    required
                    invalid={(dirty.gender || touched.gender) && !gender}
                    errorMessage={
                      (dirty.gender || touched.gender) && !gender
                        ? "กรุณาเลือกเพศ"
                        : ""
                    }
                  />
                </span>

                {/* Address Section - using consolidated state */}
                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    บ้านเลขที่ <span className="text-red-500">*</span>
                  </label>
                  <PrimaryInputText
                    value={address.houseNo}
                    onChange={(v) => updateAddress("houseNo", v)}
                    onBlur={() => markTouched("houseNo")}
                    required
                    invalid={
                      (dirty.houseNo || touched.houseNo) && !address.houseNo
                    }
                    errorMessage={
                      (dirty.houseNo || touched.houseNo) && !address.houseNo
                        ? "กรุณากรอกบ้านเลขที่"
                        : ""
                    }
                  />
                </span>

                <span className="flex flex-col">
                  <label className="text-sm mb-1">ชื่อหมู่บ้าน</label>
                  <PrimaryInputText
                    value={address.villageName}
                    onChange={(v) => updateAddress("villageName", v)}
                    onBlur={() => markTouched("villageName")}
                  />
                </span>

                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    หมู่ที่ (Moo) <span className="text-red-500">*</span>
                  </label>
                  <PrimaryInputText
                    type="number"
                    value={address.moo}
                    onChange={(v) => {
                      if (v === "" || /^\d+$/.test(v)) {
                        updateAddress("moo", v);
                      }
                    }}
                    onBlur={() => markTouched("moo")}
                    required
                    invalid={
                      (dirty.moo || touched.moo) && !isValidMoo(address.moo)
                    }
                    errorMessage={
                      dirty.moo || touched.moo
                        ? !address.moo
                          ? "กรุณากรอกหมู่ที่"
                          : Number(address.moo) <= 0
                          ? "หมู่ที่ต้องเป็นตัวเลขบวก"
                          : ""
                        : ""
                    }
                  />
                </span>

                <span className="flex flex-col">
                  <label className="text-sm mb-1">ถนน</label>
                  <PrimaryInputText
                    value={address.road}
                    onChange={(v) => updateAddress("road", v)}
                    onBlur={() => markTouched("road")}
                  />
                </span>

                <span className="flex flex-col">
                  <label className="text-sm mb-1">ซอย</label>
                  <PrimaryInputText
                    value={address.alley}
                    onChange={(v) => updateAddress("alley", v)}
                    onBlur={() => markTouched("alley")}
                  />
                </span>

                {/* Location Selection */}
                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    จังหวัด <span className="text-red-500">*</span>
                  </label>
                  <PrimaryAutoComplete
                    value={provinceId}
                    options={provinceOptions}
                    onChange={(v) => {
                      // Issue #4: Type safety for IDs
                      setProvinceId(Number(v));
                      setDirty((d) => ({ ...d, provinceId: true }));
                    }}
                    onBlur={() => markTouched("provinceId")}
                    placeholder="เลือกหรือค้นหาจังหวัด"
                    required
                    invalid={
                      (dirty.provinceId || touched.provinceId) &&
                      provinceId === ""
                    }
                    errorMessage={
                      (dirty.provinceId || touched.provinceId) &&
                      provinceId === ""
                        ? "กรุณาเลือกจังหวัด"
                        : ""
                    }
                  />
                </span>

                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    อำเภอ/เขต <span className="text-red-500">*</span>
                  </label>
                  <PrimaryAutoComplete
                    value={amphureId}
                    options={amphureOptions}
                    onChange={(v) => {
                      setAmphureId(Number(v));
                      setDirty((d) => ({ ...d, amphureId: true }));
                    }}
                    onBlur={() => markTouched("amphureId")}
                    placeholder="เลือกหรือค้นหาอำเภอ/เขต"
                    disabled={amphureOptions.length === 0}
                    required
                    invalid={
                      (dirty.amphureId || touched.amphureId) && amphureId === ""
                    }
                    errorMessage={
                      (dirty.amphureId || touched.amphureId) && amphureId === ""
                        ? "กรุณาเลือกอำเภอ/เขต"
                        : ""
                    }
                  />
                </span>

                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    ตำบล/แขวง <span className="text-red-500">*</span>
                  </label>
                  <PrimaryAutoComplete
                    value={tambonId}
                    options={tambonOptions}
                    onChange={(v) => {
                      setTambonId(Number(v));
                      setDirty((d) => ({ ...d, tambonId: true }));
                    }}
                    onBlur={() => markTouched("tambonId")}
                    placeholder="เลือกหรือค้นหาตำบล/แขวง"
                    disabled={tambonOptions.length === 0}
                    required
                    invalid={
                      (dirty.tambonId || touched.tambonId) && tambonId === ""
                    }
                    errorMessage={
                      (dirty.tambonId || touched.tambonId) && tambonId === ""
                        ? "กรุณาเลือกตำบล/แขวง"
                        : ""
                    }
                  />
                </span>

                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    รหัสไปรษณีย์ <span className="text-red-500">*</span>
                  </label>
                  <PrimaryInputText
                    value={address.zipCode}
                    onChange={() => {}}
                    disabled
                    required
                    invalid={
                      (dirty.tambonId || touched.zipCode) && address.zipCode === ""
                    }
                    errorMessage={
                      (dirty.tambonId || touched.zipCode) && address.zipCode === ""
                        ? "เลือกตำบลเพื่อเติมรหัสไปรษณีย์"
                        : ""
                    }
                  />
                </span>

                {/* Phone Numbers */}
                <span className="flex flex-col">
                  <label className="text-sm mb-1">เบอร์โทรศัพท์บ้าน</label>
                  <PrimaryInputMask
                    value={phoneNumber}
                    onChange={(v) => {
                      setPhoneNumber(v);
                      setDirty((d) => ({ ...d, phoneNumber: true }));
                    }}
                    onBlur={() => markTouched("phoneNumber")}
                    mask="99-999-9999"
                    placeholder="0X-XXX-XXXX"
                  />
                </span>

                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    เบอร์โทรศัพท์มือถือ <span className="text-red-500">*</span>
                  </label>
                  <PrimaryInputMask
                    value={mobilePhoneNumber}
                    onChange={(v) => {
                      setMobilePhoneNumber(v);
                      setDirty((d) => ({ ...d, mobilePhoneNumber: true }));
                    }}
                    onBlur={() => markTouched("mobilePhoneNumber")}
                    mask="999-999-9999"
                    required
                    invalid={
                      (dirty.mobilePhoneNumber ||
                        touched.mobilePhoneNumber) &&
                      !isValidMobile(mobilePhoneNumber)
                    }
                    errorMessage={
                      dirty.mobilePhoneNumber || touched.mobilePhoneNumber
                        ? mobilePhoneNumber
                          ? !isValidMobile(mobilePhoneNumber)
                            ? "ต้องเป็น 10 หลัก"
                            : ""
                          : "กรุณากรอกเบอร์มือถือ"
                        : ""
                    }
                    placeholder="0XX-XXX-XXXX"
                  />
                </span>
              </>
            )}
          </div>
        )}

        {/* Dialog Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <Button
            label="ยกเลิก"
            severity="secondary"
            icon="pi pi-times"
            onClick={() => {
              onHide();
              reset();
            }}
            className="px-4"
          />
          <Button
            label="บันทึก"
            icon="pi pi-save"
            disabled={!canSubmit || loading}
            loading={loading}
            onClick={submit}
            className="px-4"
          />
        </div>
      </div>
    </Dialog>
  );
};
