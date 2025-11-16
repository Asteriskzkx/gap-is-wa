import { NormalizedUser } from "@/types/UserType";
import { InputText } from "primereact/inputtext";
import React, { useMemo, useState } from "react";
import BaseUserForm, { BaseUserFormValues } from "./BaseUserForm";
import { PrimaryCalendar, PrimaryInputMask, PrimaryDropdown } from "../ui";
import useThaiAddress from "@/hooks/useThaiAddress";

type Props = {
  user: NormalizedUser;
};

export default function FarmerEditForm({ user }: Props) {
  const initialValues: BaseUserFormValues = useMemo(
    () => ({
      namePrefix: user.farmer?.namePrefix ?? "",
      firstName: user.farmer?.firstName ?? "",
      lastName: user.farmer?.lastName ?? "",
      email: user.email ?? "",
    }),
    [user]
  );

  const [extra, setExtra] = useState({
    identificationNumber: user.farmer?.identificationNumber ?? "",
    birthDate: user.farmer?.birthDate
      ? new Date(user.farmer.birthDate).toISOString().slice(0, 10)
      : "",
    gender: user.farmer?.gender ?? "",
    houseNo: user.farmer?.houseNo ?? "",
    villageName: user.farmer?.villageName ?? "",
    moo: user.farmer?.moo?.toString?.() ?? "",
    road: user.farmer?.road ?? "",
    alley: user.farmer?.alley ?? "",
    subDistrict: user.farmer?.subDistrict ?? "",
    district: user.farmer?.district ?? "",
    provinceName: user.farmer?.provinceName ?? "",
    zipCode: user.farmer?.zipCode ?? "",
    phoneNumber: user.farmer?.phoneNumber ?? "",
    mobilePhoneNumber: user.farmer?.mobilePhoneNumber ?? "",
  });

  const initialExtra = useMemo(
    () => ({
      identificationNumber: user.farmer?.identificationNumber ?? "",
      birthDate: user.farmer?.birthDate
        ? new Date(user.farmer.birthDate).toISOString().slice(0, 10)
        : "",
      gender: user.farmer?.gender ?? "",
      houseNo: user.farmer?.houseNo ?? "",
      villageName: user.farmer?.villageName ?? "",
      moo: user.farmer?.moo?.toString?.() ?? "",
      road: user.farmer?.road ?? "",
      alley: user.farmer?.alley ?? "",
      subDistrict: user.farmer?.subDistrict ?? "",
      district: user.farmer?.district ?? "",
      provinceName: user.farmer?.provinceName ?? "",
      zipCode: user.farmer?.zipCode ?? "",
      phoneNumber: user.farmer?.phoneNumber ?? "",
      mobilePhoneNumber: user.farmer?.mobilePhoneNumber ?? "",
    }),
    [user]
  );

  const externalDirty = useMemo(
    () => JSON.stringify(extra) !== JSON.stringify(initialExtra),
    [extra, initialExtra]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const onChangeExtra = (e: any) => {
    const name = e.target?.name;
    const value = e.target?.value;
    if (!name) return;
    setExtra((prev) => ({ ...prev, [name]: value }));
  };

  // Thai address cascade state using hook
  const {
    isLoading: isLoadingAddress,
    provinces,
    getDistricts,
    getSubDistricts,
    getZipCode,
  } = useThaiAddress();

  const [province, setProvince] = useState<string>(extra.provinceName);
  const [district, setDistrict] = useState<string>(extra.district);
  const [subDistrict, setSubDistrict] = useState<string>(extra.subDistrict);
  const [zipCode, setZipCode] = useState<string>(extra.zipCode);

  // Dropdown options
  const provinceOptions = useMemo(
    () => provinces.map((p) => ({ label: p, value: p })),
    [provinces]
  );
  const districtOptions = useMemo(
    () =>
      province
        ? getDistricts(province).map((d) => ({ label: d, value: d }))
        : [],
    [province, getDistricts]
  );
  const subDistrictOptions = useMemo(
    () =>
      province && district
        ? getSubDistricts(province, district).map((s) => ({
            label: s,
            value: s,
          }))
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

  const onProvinceChange = (value: string) => {
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
  };

  const onDistrictChange = (value: string) => {
    setDistrict(value);
    setSubDistrict("");
    setZipCode("");
    setExtra((prev) => ({
      ...prev,
      district: value,
      subDistrict: "",
      zipCode: "",
    }));
  };

  const onSubDistrictChange = (value: string) => {
    setSubDistrict(value);
    const z = getZipCode(province, district, value);
    setZipCode(z);
    setExtra((prev) => ({ ...prev, subDistrict: value, zipCode: z }));
  };

  // Keep local cascades in sync if external resets occur
  React.useEffect(() => {
    setProvince(extra.provinceName);
    setDistrict(extra.district);
    setSubDistrict(extra.subDistrict);
    setZipCode(extra.zipCode);
  }, [extra.provinceName, extra.district, extra.subDistrict, extra.zipCode]);

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    // Required: identificationNumber (13 digits)
    const idDigits = (extra.identificationNumber || "").replace(/\D/g, "");
    if (idDigits.length !== 13)
      errs.identificationNumber = "เลขบัตรประชาชนต้องมี 13 หลัก";

    // Required: birthDate
    if (!extra.birthDate) errs.birthDate = "กรุณาเลือกวันเดือนปีเกิด";

    // Required: gender
    if (!extra.gender?.trim()) errs.gender = "กรุณาเลือกเพศ";

    // Required: houseNo
    if (!extra.houseNo?.trim()) errs.houseNo = "กรุณากรอกบ้านเลขที่";

    // Required: moo (integer 0-1000)
    const mooStr = (extra.moo ?? "").toString().trim();
    const mooNum = mooStr === "" ? NaN : Number(mooStr);
    if (Number.isNaN(mooNum)) errs.moo = "กรุณากรอกหมู่เป็นตัวเลข";
    else if (mooNum < 0 || mooNum > 1000)
      errs.moo = "กรุณากรอกหมู่ระหว่าง 0-1000";

    // Required cascade: province, district, subDistrict
    if (!province) errs.province = "กรุณาเลือกจังหวัด";
    if (!district) errs.district = "กรุณาเลือกอำเภอ";
    if (!subDistrict) errs.subDistrict = "กรุณาเลือกตำบล";

    // Required: mobilePhoneNumber (10 digits)
    const mobileDigits = (extra.mobilePhoneNumber || "").replace(/\D/g, "");
    if (mobileDigits.length !== 10)
      errs.mobilePhoneNumber = "กรุณากรอกเบอร์มือถือ 10 หลัก";

    // Optional: villageName, road, alley, phoneNumber
    return errs;
  };

  const submit = async (values: BaseUserFormValues) => {
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      throw new Error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
    const payload = {
      ...values,
      ...extra,
      moo: extra.moo ? Number(extra.moo) : null,
      birthDate: extra.birthDate
        ? new Date(extra.birthDate).toISOString().split("T")[0]
        : null,
      identificationNumber: (extra.identificationNumber || "").replaceAll(
        "-",
        ""
      ),
      phoneNumber: (extra.phoneNumber || "").replaceAll("-", ""),
      mobilePhoneNumber: (extra.mobilePhoneNumber || "").replaceAll("-", ""),
    };

    const res = await fetch(`/api/farmers/${user.userId}`, {
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
          successMessage="บันทึกข้อมูลเกษตรกรเรียบร้อย"
          errorMessage="บันทึกข้อมูลเกษตรกรไม่สำเร็จ"
          externalDirty={externalDirty}
          onResetExternal={() => setExtra(initialExtra)}
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
                  // invalid={!!errors.identificationNumber}
                  // errorMessage={errors.identificationNumber}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="birthDate">
                  วันเดือนปีเกิด <span className="text-red-500">*</span>
                </label>
                <PrimaryCalendar
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
                  // invalid={!!errors.birthDate}
                  // errorMessage={errors.birthDate}
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
