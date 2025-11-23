import React, { useState, useEffect, useMemo } from "react";
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

type Props = {
  namePrefixOptions?: Option[];
  visible: boolean;
  onHide: () => void;
  onCreated: () => Promise<void>;
  showSuccess: () => void;
  showError: () => void;
};

export const AddUserDialog: React.FC<Props> = ({
  visible,
  namePrefixOptions,
  onHide,
  onCreated,
  showSuccess,
  showError,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [namePrefix, setNamePrefix] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState("ชาย");
  const [houseNo, setHouseNo] = useState("");
  const [villageName, setVillageName] = useState("");
  const [moo, setMoo] = useState("");
  const [road, setRoad] = useState("");
  const [alley, setAlley] = useState("");
  const [subDistrict, setSubDistrict] = useState("");
  const [district, setDistrict] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mobilePhoneNumber, setMobilePhoneNumber] = useState("");
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [amphureId, setAmphureId] = useState<number | "">("");
  const [tambonId, setTambonId] = useState<number | "">("");
  const [provinces, setProvinces] = useState<any[]>([]);
  const [amphures, setAmphures] = useState<any[]>([]);
  const [tambons, setTambons] = useState<any[]>([]);
  // Track per-field dirtiness (value changed) and touched (blurred/focused)
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const reset = () => {
    setSelectedRole(null);
    setNamePrefix("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setIdentificationNumber("");
    setBirthDate(null);
    setGender("ชาย");
    setHouseNo("");
    setVillageName("");
    setMoo("");
    setRoad("");
    setAlley("");
    setSubDistrict("");
    setDistrict("");
    setProvinceName("");
    setZipCode("");
    setPhoneNumber("");
    setMobilePhoneNumber("");
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

  useEffect(() => {
    if (provinceId !== "") {
      const p = provinces.find((p) => p.id === provinceId);
      if (p) {
        setAmphures(p.amphures);
        setProvinceName(p.name_th);
        setAmphureId("");
        setTambonId("");
        setDistrict("");
        setSubDistrict("");
        setZipCode("");
      }
    } else {
      setAmphures([]);
      setTambons([]);
    }
  }, [provinceId, provinces]);

  useEffect(() => {
    if (amphureId !== "") {
      const a = amphures.find((a) => a.id === amphureId);
      if (a) {
        setTambons(a.tambons);
        setDistrict(a.name_th);
        setTambonId("");
        setSubDistrict("");
        setZipCode("");
      }
    } else {
      setTambons([]);
    }
  }, [amphureId, amphures]);

  useEffect(() => {
    if (tambonId !== "") {
      const t = tambons.find((t) => t.id === tambonId);
      if (t) {
        setSubDistrict(t.name_th);
        setZipCode(String(t.zip_code));
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

  const canSubmit = () => {
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
      const idClean = identificationNumber.replaceAll("-", "");
      return (
        idClean.length === 13 &&
        birthDate !== null &&
        gender &&
        houseNo &&
        moo !== "" &&
        provinceId !== "" &&
        amphureId !== "" &&
        tambonId !== "" &&
        mobilePhoneNumber.replaceAll("-", "").length === 10
      );
    }
    return true;
  };

  const submit = async () => {
    if (!canSubmit()) return;
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
        const idClean = identificationNumber.replaceAll("-", "");
        payload.identificationNumber = idClean;
        payload.birthDate = birthDate
          ? birthDate.toISOString().split("T")[0]
          : null;
        payload.gender = gender;
        payload.houseNo = houseNo;
        payload.villageName = villageName;
        payload.moo = moo === "" ? null : Number(moo);
        payload.road = road;
        payload.alley = alley;
        payload.subDistrict = subDistrict;
        payload.district = district;
        payload.provinceName = provinceName;
        payload.zipCode = zipCode;
        payload.phoneNumber = phoneNumber.replaceAll("-", "");
        payload.mobilePhoneNumber = mobilePhoneNumber.replaceAll("-", "");
      }
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("create failed");
      await onCreated();
      showSuccess();
      onHide();
      reset();
    } catch (e) {
      console.error(e);
      showError();
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
        <PrimaryDropdown
          value={selectedRole}
          options={Object.values(UserRole).map((r) => ({ label: r, value: r }))}
          onChange={(v) => {
            setSelectedRole(v);
            setDirty((d) => ({ ...d, selectedRole: true }));
          }}
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

            {selectedRole === UserRole.FARMER && (
              <>
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
                    mask="9-9999-99999-99-9"
                    required
                    invalid={
                      (dirty.identificationNumber ||
                        touched.identificationNumber) &&
                      identificationNumber.replaceAll("-", "").length !== 13
                    }
                    errorMessage={
                      dirty.identificationNumber || touched.identificationNumber
                        ? identificationNumber
                          ? identificationNumber.replaceAll("-", "").length !==
                            13
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
                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    บ้านเลขที่ <span className="text-red-500">*</span>
                  </label>
                  <PrimaryInputText
                    value={houseNo}
                    onChange={(v) => {
                      setHouseNo(v);
                      setDirty((d) => ({ ...d, houseNo: true }));
                    }}
                    required
                    invalid={(dirty.houseNo || touched.houseNo) && !houseNo}
                    errorMessage={
                      (dirty.houseNo || touched.houseNo) && !houseNo
                        ? "กรุณากรอกบ้านเลขที่"
                        : ""
                    }
                  />
                </span>
                <span className="flex flex-col">
                  <label className="text-sm mb-1">ชื่อหมู่บ้าน</label>
                  <PrimaryInputText
                    value={villageName}
                    onChange={(v) => {
                      setVillageName(v);
                      setDirty((d) => ({ ...d, villageName: true }));
                    }}
                  />
                </span>
                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    หมู่ที่ (Moo) <span className="text-red-500">*</span>
                  </label>
                  <PrimaryInputText
                    type="number"
                    value={String(moo)}
                    onChange={(v) => {
                      if (v === "" || /^\d+$/.test(v)) {
                        setMoo(v);
                        setDirty((d) => ({ ...d, moo: true }));
                      }
                    }}
                    required
                    invalid={(dirty.moo || touched.moo) && moo === ""}
                    errorMessage={
                      (dirty.moo || touched.moo) && moo === ""
                        ? "กรุณากรอกหมู่ที่"
                        : ""
                    }
                  />
                </span>
                <span className="flex flex-col">
                  <label className="text-sm mb-1">ถนน</label>
                  <PrimaryInputText
                    value={road}
                    onChange={(v) => {
                      setRoad(v);
                      setDirty((d) => ({ ...d, road: true }));
                    }}
                  />
                </span>
                <span className="flex flex-col">
                  <label className="text-sm mb-1">ซอย</label>
                  <PrimaryInputText
                    value={alley}
                    onChange={(v) => {
                      setAlley(v);
                      setDirty((d) => ({ ...d, alley: true }));
                    }}
                  />
                </span>
                <span className="flex flex-col">
                  <label className="text-sm mb-1">
                    จังหวัด <span className="text-red-500">*</span>
                  </label>
                  <PrimaryAutoComplete
                    value={provinceId}
                    options={provinceOptions}
                    onChange={(v) => {
                      setProvinceId(v);
                      setDirty((d) => ({ ...d, provinceId: true }));
                    }}
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
                      setAmphureId(v);
                      setDirty((d) => ({ ...d, amphureId: true }));
                    }}
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
                      setTambonId(v);
                      setDirty((d) => ({ ...d, tambonId: true }));
                    }}
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
                    value={zipCode}
                    onChange={() => {}}
                    disabled
                    required
                    invalid={
                      (dirty.tambonId || touched.zipCode) && zipCode === ""
                    }
                    errorMessage={
                      (dirty.tambonId || touched.zipCode) && zipCode === ""
                        ? "เลือกตำบลเพื่อเติมรหัสไปรษณีย์"
                        : ""
                    }
                  />
                </span>
                <span className="flex flex-col">
                  <label className="text-sm mb-1">เบอร์โทรศัพท์บ้าน</label>
                  <PrimaryInputMask
                    value={phoneNumber}
                    onChange={(v) => {
                      setPhoneNumber(v);
                      setDirty((d) => ({ ...d, phoneNumber: true }));
                    }}
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
                    mask="999-999-9999"
                    required
                    invalid={
                      (dirty.mobilePhoneNumber || touched.mobilePhoneNumber) &&
                      mobilePhoneNumber.replaceAll("-", "").length !== 10
                    }
                    errorMessage={
                      dirty.mobilePhoneNumber || touched.mobilePhoneNumber
                        ? mobilePhoneNumber
                          ? mobilePhoneNumber.replaceAll("-", "").length !== 10
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
            disabled={!canSubmit() || loading}
            loading={loading}
            onClick={submit}
            className="px-4"
          />
        </div>
      </div>
    </Dialog>
  );
};
