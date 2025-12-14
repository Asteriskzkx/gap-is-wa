import { NormalizedUser, FarmerInfo } from "@/types/UserType";
import { InputText } from "primereact/inputtext";
import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import BaseUserForm, { BaseUserFormValues } from "./BaseUserForm";
import { PrimaryCalendar, PrimaryInputMask, PrimaryDropdown } from "../ui";
import useThaiAddress from "@/hooks/useThaiAddress";

type Props = {
  user: NormalizedUser;
  onSuccess?: (updated: FarmerInfo) => void;
};

// Format phone number with dashes: 021234567 -> 02-123-4567
const formatHomePhone = (phone: string | null | undefined): string => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 9) return phone;
  return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
};

// Format mobile phone with dashes: 0812345678 -> 081-234-5678
const formatMobilePhone = (phone: string | null | undefined): string => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

// Format ID number with dashes: 1234567890123 -> 1-2345-67890-12-3
const formatIdNumber = (id: string | null | undefined): string => {
  if (!id) return "";
  const digits = id.replace(/\D/g, "");
  if (digits.length !== 13) return id;
  return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits[12]}`;
};

// Helper to create extra state from farmer data
const createExtraFromFarmer = (farmer: Props["user"]["farmer"]) => ({
  identificationNumber: formatIdNumber(farmer?.identificationNumber),
  birthDate: farmer?.birthDate
    ? new Date(farmer.birthDate).toISOString().slice(0, 10)
    : "",
  gender: farmer?.gender ?? "",
  houseNo: farmer?.houseNo ?? "",
  villageName: farmer?.villageName ?? "",
  moo: farmer?.moo?.toString?.() ?? "",
  road: farmer?.road ?? "",
  alley: farmer?.alley ?? "",
  subDistrict: farmer?.subDistrict ?? "",
  district: farmer?.district ?? "",
  provinceName: farmer?.provinceName ?? "",
  zipCode: farmer?.zipCode ?? "",
  phoneNumber: formatHomePhone(farmer?.phoneNumber),
  mobilePhoneNumber: formatMobilePhone(farmer?.mobilePhoneNumber),
});

export default function FarmerEditForm({ user, onSuccess }: Props) {
  const initialValues: BaseUserFormValues = useMemo(
    () => ({
      namePrefix: user.farmer?.namePrefix ?? "",
      firstName: user.farmer?.firstName ?? "",
      lastName: user.farmer?.lastName ?? "",
      email: user.email ?? "",
    }),
    [user]
  );

  const [extra, setExtra] = useState(() => createExtraFromFarmer(user.farmer));
  const initialExtra = useMemo(() => createExtraFromFarmer(user.farmer), [user]);
  const initialExtraRef = useRef(createExtraFromFarmer(user.farmer));

  // Sync extra state when user.farmer changes (e.g., after successful save)
  const farmerVersion = user.farmer?.version;
  useEffect(() => {
    const newExtra = createExtraFromFarmer(user.farmer);
    setExtra(newExtra);
    initialExtraRef.current = newExtra;
  }, [farmerVersion, user.farmer]);

  const externalDirty = useMemo(
    () => JSON.stringify(extra) !== JSON.stringify(initialExtra),
    [extra, initialExtra]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState(0);
  const [pendingReset, setPendingReset] = useState(false);

  // Increment resetKey AFTER extra state has been updated
  useEffect(() => {
    if (pendingReset) {
      setResetKey((prev) => prev + 1);
      setPendingReset(false);
    }
  }, [pendingReset, extra]);

  const onChangeExtra = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!name) return;
    setExtra((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Thai address cascade state
  const {
    isLoading: isLoadingAddress,
    provinces,
    getDistricts,
    getSubDistricts,
    getZipCode,
  } = useThaiAddress();

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSyncedExtra, setLastSyncedExtra] = useState("");

  // Strip Thai prefixes for matching
  const stripPrefix = useCallback((name: string): string => {
    if (!name) return "";
    return name
      .replace(/^จังหวัด/, "")
      .replace(/^อำเภอ/, "")
      .replace(/^เขต/, "")
      .replace(/^ตำบล/, "")
      .replace(/^แขวง/, "")
      .trim();
  }, []);

  // Find matching option (case-insensitive, prefix-insensitive)
  const findMatchingOption = useCallback(
    (value: string, options: string[]): string | undefined => {
      if (!value) return undefined;
      const strippedValue = stripPrefix(value);
      if (options.includes(value)) return value;
      return options.find((opt) => stripPrefix(opt) === strippedValue);
    },
    [stripPrefix]
  );

  // Initialize address values when data is loaded
  useEffect(() => {
    if (!isLoadingAddress && provinces.length > 0 && !isInitialized) {
      const initialProvince = user.farmer?.provinceName ?? "";
      const initialDistrict = user.farmer?.district ?? "";
      const initialSubDistrict = user.farmer?.subDistrict ?? "";
      const initialZipCode = user.farmer?.zipCode ?? "";

      const matchedProvince = findMatchingOption(initialProvince, provinces);
      if (matchedProvince) {
        setProvince(matchedProvince);
        const districts = getDistricts(matchedProvince);
        const matchedDistrict = findMatchingOption(initialDistrict, districts);
        
        if (matchedDistrict) {
          setDistrict(matchedDistrict);
          const subDistricts = getSubDistricts(matchedProvince, matchedDistrict);
          const matchedSubDistrict = findMatchingOption(initialSubDistrict, subDistricts);
          
          if (matchedSubDistrict) {
            setSubDistrict(matchedSubDistrict);
            setZipCode(initialZipCode || getZipCode(matchedProvince, matchedDistrict, matchedSubDistrict));
          }
        }
      }
      
      setIsInitialized(true);
      setLastSyncedExtra(JSON.stringify({
        provinceName: extra.provinceName,
        district: extra.district,
        subDistrict: extra.subDistrict,
        zipCode: extra.zipCode,
      }));
    }
  }, [isLoadingAddress, provinces, user.farmer, getDistricts, getSubDistricts, getZipCode, findMatchingOption, isInitialized, extra.provinceName, extra.district, extra.subDistrict, extra.zipCode]);

  // Dropdown options
  const provinceOptions = useMemo(
    () => provinces.map((p) => ({ label: p, value: p })),
    [provinces]
  );

  const districtOptions = useMemo(
    () => (province ? getDistricts(province).map((d) => ({ label: d, value: d })) : []),
    [province, getDistricts]
  );

  const subDistrictOptions = useMemo(
    () =>
      province && district
        ? getSubDistricts(province, district).map((s) => ({ label: s, value: s }))
        : [],
    [province, district, getSubDistricts]
  );

  const genderOptions = useMemo(
    () => [
      { label: "ชาย", value: "ชาย" },
      { label: "หญิง", value: "หญิง" },
      { label: "ไม่ระบุ", value: "ไม่ระบุ" },
    ],
    []
  );

  const onProvinceChange = useCallback((value: string) => {
    setProvince(value);
    setDistrict("");
    setSubDistrict("");
    setZipCode("");
    setExtra((prev) => ({
      ...prev,
      provinceName: value,
      district: "",
      subDistrict: "",
      zipCode: "",
    }));
  }, []);

  const onDistrictChange = useCallback((value: string) => {
    setDistrict(value);
    setSubDistrict("");
    setZipCode("");
    setExtra((prev) => ({
      ...prev,
      district: value,
      subDistrict: "",
      zipCode: "",
    }));
  }, []);

  const onSubDistrictChange = useCallback((value: string) => {
    setSubDistrict(value);
    const z = getZipCode(province, district, value);
    setZipCode(z);
    setExtra((prev) => ({ ...prev, subDistrict: value, zipCode: z }));
  }, [getZipCode, province, district]);

  // Sync local cascades when extra changes (e.g., reset button)
  useEffect(() => {
    const currentExtraKey = JSON.stringify({
      provinceName: extra.provinceName,
      district: extra.district,
      subDistrict: extra.subDistrict,
      zipCode: extra.zipCode,
    });
    
    if (isInitialized && !isLoadingAddress && currentExtraKey !== lastSyncedExtra) {
      const matchedProvince = findMatchingOption(extra.provinceName, provinces);
      
      if (matchedProvince) {
        setProvince(matchedProvince);
        const districts = getDistricts(matchedProvince);
        const matchedDistrict = findMatchingOption(extra.district, districts);
        
        if (matchedDistrict) {
          setDistrict(matchedDistrict);
          const subDistricts = getSubDistricts(matchedProvince, matchedDistrict);
          const matchedSubDistrict = findMatchingOption(extra.subDistrict, subDistricts);
          
          if (matchedSubDistrict) {
            setSubDistrict(matchedSubDistrict);
            setZipCode(extra.zipCode || getZipCode(matchedProvince, matchedDistrict, matchedSubDistrict));
          } else {
            setSubDistrict("");
            setZipCode("");
          }
        } else {
          setDistrict("");
          setSubDistrict("");
          setZipCode("");
        }
      } else {
        setProvince("");
        setDistrict("");
        setSubDistrict("");
        setZipCode("");
      }
      
      setLastSyncedExtra(currentExtraKey);
    }
  }, [extra.provinceName, extra.district, extra.subDistrict, extra.zipCode, isInitialized, isLoadingAddress, provinces, getDistricts, getSubDistricts, getZipCode, findMatchingOption, lastSyncedExtra]);

  // Reset function that resets both extra and local cascade state
  const resetToInitial = React.useCallback(() => {
    // Use ref values (preserved original)
    const resetData = initialExtraRef.current;
    
    // Update extra state first
    setExtra({ ...resetData });
    
    // Also reset local cascade state directly
    if (provinces.length > 0) {
      const matchedProvince = findMatchingOption(resetData.provinceName, provinces);
      
      if (matchedProvince) {
        setProvince(matchedProvince);
        
        const districts = getDistricts(matchedProvince);
        const matchedDistrict = findMatchingOption(resetData.district, districts);
        
        if (matchedDistrict) {
          setDistrict(matchedDistrict);
          
          const subDistricts = getSubDistricts(matchedProvince, matchedDistrict);
          const matchedSubDistrict = findMatchingOption(resetData.subDistrict, subDistricts);
          
          if (matchedSubDistrict) {
            setSubDistrict(matchedSubDistrict);
            setZipCode(resetData.zipCode || getZipCode(matchedProvince, matchedDistrict, matchedSubDistrict));
          } else {
            setSubDistrict("");
            setZipCode("");
          }
        } else {
          setDistrict("");
          setSubDistrict("");
          setZipCode("");
        }
      } else {
        setProvince("");
        setDistrict("");
        setSubDistrict("");
        setZipCode("");
      }
    }
    
    // Update lastSyncedExtra to prevent useEffect from overwriting
    setLastSyncedExtra(JSON.stringify({
      provinceName: resetData.provinceName,
      district: resetData.district,
      subDistrict: resetData.subDistrict,
      zipCode: resetData.zipCode,
    }));
    
    // Set pending reset flag - the useEffect will increment resetKey after state is updated
    setPendingReset(true);
    
    // Clear errors
    setErrors({});
  }, [provinces, findMatchingOption, getDistricts, getSubDistricts, getZipCode]);

  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};
    
    const idDigits = (extra.identificationNumber || "").replace(/\D/g, "");
    if (idDigits.length !== 13) errs.identificationNumber = "เลขบัตรประชาชนต้องมี 13 หลัก";
    if (!extra.birthDate) errs.birthDate = "กรุณาเลือกวันเดือนปีเกิด";
    if (!extra.gender?.trim()) errs.gender = "กรุณาเลือกเพศ";
    if (!extra.houseNo?.trim()) errs.houseNo = "กรุณากรอกบ้านเลขที่";

    const mooStr = (extra.moo ?? "").toString().trim();
    const mooNum = mooStr === "" ? NaN : Number(mooStr);
    if (Number.isNaN(mooNum)) errs.moo = "กรุณากรอกหมู่เป็นตัวเลข";
    else if (mooNum < 0 || mooNum > 1000) errs.moo = "กรุณากรอกหมู่ระหว่าง 0-1000";

    if (!province) errs.province = "กรุณาเลือกจังหวัด";
    if (!district) errs.district = "กรุณาเลือกอำเภอ";
    if (!subDistrict) errs.subDistrict = "กรุณาเลือกตำบล";

    const mobileDigits = (extra.mobilePhoneNumber || "").replace(/\D/g, "");
    if (mobileDigits.length !== 10) errs.mobilePhoneNumber = "กรุณากรอกเบอร์มือถือ 10 หลัก";

    return errs;
  }, [extra, province, district, subDistrict]);

  const submit = async (values: BaseUserFormValues): Promise<FarmerInfo> => {
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
    const payload = {
      ...values,
      ...extra,
      moo: Number(extra.moo) ,
      birthDate: extra.birthDate
        ? new Date(extra.birthDate).toISOString().split("T")[0]
        : null,
      identificationNumber: (extra.identificationNumber || "").replaceAll(
        "-",
        ""
      ),
      phoneNumber: (extra.phoneNumber || "").replaceAll("-", ""),
      mobilePhoneNumber: (extra.mobilePhoneNumber || "").replaceAll("-", ""),
      version: user.farmer?.version || 0,
    };

    const res = await fetch(`/api/v1/farmers/${user.farmer?.farmerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let msg = "บันทึกไม่สำเร็จ";
      try {
        const err = await res.json();
        if (err?.message) msg = err.message;
      } catch {}
      throw new Error(msg);
    }
    
    const updated: FarmerInfo = await res.json();
    return updated;
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          แก้ไขข้อมูลผู้ใช้ของ เกษตรกร
        </h1>
      </div>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <p className="text-lg font-bold mb-4 text-center">
          คุณกำลังแก้ไขข้อมูลผู้ใช้ชื่อ{" "}
          {[
            `${user.farmer?.namePrefix ?? ""}${user.farmer?.firstName ?? ""}`,
            user.farmer?.lastName ?? "",
          ]
            .map((s) => s.trim())
            .filter(Boolean)
            .join(" ") || "-"}{" "}
          ( รหัสผู้ใช้ : {user.userId} )
        </p>

        <BaseUserForm
          defaultValues={initialValues}
          onSubmit={submit}
          onSuccess={onSuccess}
          successMessage="บันทึกข้อมูลเกษตรกรเรียบร้อย"
          errorMessage="บันทึกข้อมูลเกษตรกรไม่สำเร็จ"
          externalDirty={externalDirty}
          onResetExternal={resetToInitial}
        >
          {/* Extra farmer fields inside the same form so the submit button stays at the bottom */}
          <div className="space-y-3 mt-4">
            <h3 className="font-semibold text-center pt-4">ข้อมูลเพิ่มเติมของเกษตรกร</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm mb-1"
                  htmlFor="identificationNumber"
                >
                  เลขบัตรประชาชน <span className="text-red-500">*</span>
                </label>
                <PrimaryInputMask
                  key={`id-${resetKey}`}
                  id="identificationNumber"
                  name="identificationNumber"
                  value={extra.identificationNumber}
                  onChange={(value) =>
                    setExtra((prev) => ({
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
                <label className="block text-sm mb-1" htmlFor="birthDate">
                  วันเดือนปีเกิด <span className="text-red-500">*</span>
                </label>
                <PrimaryCalendar
                  key={`bd-${resetKey}`}
                  id="birthDate"
                  name="birthDate"
                  value={extra.birthDate ? new Date(extra.birthDate) : null}
                  onChange={(value) =>
                    setExtra((prev) => ({
                      ...prev,
                      birthDate: value
                        ? new Date(value).toISOString().slice(0, 10)
                        : "",
                    }))
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
                <label className="block text-sm mb-1" htmlFor="gender">
                  เพศ <span className="text-red-500">*</span>
                </label>
                <PrimaryDropdown
                  id="gender"
                  name="gender"
                  value={extra.gender}
                  options={genderOptions}
                  onChange={(value) =>
                    setExtra((prev) => ({ ...prev, gender: value }))
                  }
                  placeholder="เลือกเพศ"
                  invalid={!!errors.gender}
                  errorMessage={errors.gender}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="phoneNumber">
                  เบอร์โทรศัพท์บ้าน
                </label>
                <PrimaryInputMask
                  key={`ph-${resetKey}`}
                  id="phoneNumber"
                  name="phoneNumber"
                  value={extra.phoneNumber}
                  onChange={(value) =>
                    setExtra((prev) => ({ ...prev, phoneNumber: value }))
                  }
                  mask="99-999-9999"
                  placeholder="0X-XXX-XXXX"
                  autoClear={false}
                />
              </div>
              <div>
                <label
                  className="block text-sm mb-1"
                  htmlFor="mobilePhoneNumber"
                >
                  เบอร์มือถือ <span className="text-red-500">*</span>
                </label>
                <PrimaryInputMask
                  key={`mp-${resetKey}`}
                  id="mobilePhoneNumber"
                  name="mobilePhoneNumber"
                  value={extra.mobilePhoneNumber}
                  onChange={(value) =>
                    setExtra((prev) => ({ ...prev, mobilePhoneNumber: value }))
                  }
                  mask="999-999-9999"
                  placeholder="0XX-XXX-XXXX"
                  autoClear={false}
                  required
                  invalid={!!errors.mobilePhoneNumber}
                  errorMessage={errors.mobilePhoneNumber}
                />
              </div>
            </div>
            <h3 className="font-semibold text-center pt-4">ที่อยู่เกษตรกร</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm mb-1" htmlFor="houseNo">
                  บ้านเลขที่ <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="houseNo"
                  name="houseNo"
                  placeholder="บ้านเลขที่"
                  value={extra.houseNo}
                  onChange={onChangeExtra}
                  className={`w-full ${errors.houseNo ? "p-invalid" : ""}`}
                />
                {errors.houseNo && (
                  <small className="p-error text-sm">{errors.houseNo}</small>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="villageName">
                  หมู่บ้าน
                </label>
                <InputText
                  id="villageName"
                  name="villageName"
                  placeholder="หมู่บ้าน"
                  value={extra.villageName}
                  onChange={onChangeExtra}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="moo">
                  หมู่ที่ <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="moo"
                  name="moo"
                  placeholder="หมู่ที่"
                  value={extra.moo}
                  onChange={onChangeExtra}
                  className={`w-full ${errors.moo ? "p-invalid" : ""}`}
                />
                {errors.moo && (
                  <small className="p-error text-sm">{errors.moo}</small>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="road">
                  ถนน
                </label>
                <InputText
                  id="road"
                  name="road"
                  placeholder="ถนน"
                  value={extra.road}
                  onChange={onChangeExtra}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="alley">
                  ซอย
                </label>
                <InputText
                  id="alley"
                  name="alley"
                  placeholder="ซอย"
                  value={extra.alley}
                  onChange={onChangeExtra}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="province">
                  จังหวัด <span className="text-red-500">*</span>
                </label>
                <PrimaryDropdown
                  id="province"
                  name="province"
                  value={province}
                  options={provinceOptions}
                  onChange={(value) => onProvinceChange(value)}
                  placeholder={
                    isLoadingAddress ? "กำลังโหลด..." : "เลือกจังหวัด"
                  }
                  filter
                  filterBy="label"
                  showClear
                  invalid={!!errors.province}
                  errorMessage={errors.province}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="district">
                  อำเภอ <span className="text-red-500">*</span>
                </label>
                <PrimaryDropdown
                  id="district"
                  name="district"
                  value={district}
                  options={districtOptions}
                  onChange={(value) => onDistrictChange(value)}
                  placeholder={province ? "เลือกอำเภอ" : "เลือกจังหวัดก่อน"}
                  disabled={!province}
                  filter
                  filterBy="label"
                  showClear
                  invalid={!!errors.district}
                  errorMessage={errors.district}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="subDistrict">
                  ตำบล <span className="text-red-500">*</span>
                </label>
                <PrimaryDropdown
                  id="subDistrict"
                  name="subDistrict"
                  value={subDistrict}
                  options={subDistrictOptions}
                  onChange={(value) => onSubDistrictChange(value)}
                  placeholder={district ? "เลือกตำบล" : "เลือกอำเภอก่อน"}
                  disabled={!district}
                  filter
                  filterBy="label"
                  showClear
                  invalid={!!errors.subDistrict}
                  errorMessage={errors.subDistrict}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="zipCode">
                  รหัสไปรษณีย์ <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="zipCode"
                  name="zipCode"
                  value={zipCode}
                  readOnly
                  className="w-full bg-gray-100"
                />
              </div>
            </div>
          </div>
        </BaseUserForm>
      </div>
    </div>
  );
}
