"use client";

import type { NormalizedUser } from "@/types/UserType";
import { useSession } from "next-auth/react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PrimaryCalendar from "@/components/ui/PrimaryCalendar";
import PrimaryDropdown from "@/components/ui/PrimaryDropdown";
import PrimaryInputMask from "@/components/ui/PrimaryInputMask";
import PrimaryInputText from "@/components/ui/PrimaryInputText";
import useThaiAddress from "@/hooks/useThaiAddress";

type Role = "ADMIN" | "FARMER" | "AUDITOR" | "COMMITTEE";

type Props = {
  role: Role;
  user: NormalizedUser;
  onSaved: (updated: any) => void;
};

type BaseFormState = {
  namePrefix: string;
  firstName: string;
  lastName: string;
  email: string;
};

type FarmerFormState = {
  identificationNumber: string;
  birthDate: Date | null;
  gender: string;

  houseNo: string;
  villageName: string;
  moo: string;
  road: string;
  alley: string;
  subDistrict: string;
  district: string;
  provinceName: string;
  zipCode: string;

  phoneNumber: string;
  mobilePhoneNumber: string;
};

const ROLE_META: Record<
  Exclude<Role, "FARMER">,
  { label: string; tag: any }
> = {
  ADMIN: { label: "ผู้ดูแลระบบ", tag: "info" },
  AUDITOR: { label: "ผู้ตรวจประเมิน", tag: "info" },
  COMMITTEE: { label: "คณะกรรมการ", tag: "warning" },
};

const NAME_PREFIX_OPTIONS = [
  { label: "นาย", value: "นาย" },
  { label: "นางสาว", value: "นางสาว" },
  { label: "นาง", value: "นาง" },
];

const GENDER_OPTIONS = [
  { label: "ชาย", value: "ชาย" },
  { label: "หญิง", value: "หญิง" },
  { label: "ไม่ระบุ", value: "ไม่ระบุ" },
];

function formatHomePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replaceAll(/\D/g, "");
  if (digits.length !== 9) return phone;
  return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
}

function formatMobilePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const digits = phone.replaceAll(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatIdNumber(id: string | null | undefined): string {
  if (!id) return "";
  const digits = id.replaceAll(/\D/g, "");
  if (digits.length !== 13) return id;
  return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(
    5,
    10
  )}-${digits.slice(10, 12)}-${digits[12]}`;
}

function avatarBg(role: Role): string {
  switch (role) {
    case "FARMER":
      return "bg-green-600";
    case "AUDITOR":
      return "bg-blue-600";
    case "COMMITTEE":
      return "bg-indigo-600";
    case "ADMIN":
    default:
      return "bg-indigo-700";
  }
}

function stripThaiPrefix(name: string): string {
  return (name || "")
    .replace(/^จังหวัด/, "")
    .replace(/^อำเภอ/, "")
    .replace(/^เขต/, "")
    .replace(/^ตำบล/, "")
    .replace(/^แขวง/, "")
    .trim();
}

function findMatchingOption(value: string, options: string[]): string {
  if (!value) return "";
  if (options.includes(value)) return value;
  const strippedValue = stripThaiPrefix(value);
  const match = options.find((opt) => stripThaiPrefix(opt) === strippedValue);
  return match ?? "";
}

function ProfileShell({
  left,
  right,
}: Readonly<{ left: ReactNode; right: ReactNode }>) {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">{left}</div>
        <div className="lg:col-span-2">{right}</div>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  headerRight,
}: Readonly<{
  title?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}>) {
  return (
    <div className="bg-white rounded-xl shadow">
      {(title || headerRight) && (
        <div className="px-6 py-4 border-b flex items-center justify-between gap-4">
          <div className="text-lg font-semibold text-gray-900">{title}</div>
          {headerRight}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  children,
}: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      {children}
    </div>
  );
}

function TextValue({ value }: Readonly<{ value: string }>) {
  return (
    <div className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900">
      {value || "-"}
    </div>
  );
}

function getRoleData(user: NormalizedUser, role: Role) {
  switch (role) {
    case "ADMIN":
      return user.admin;
    case "AUDITOR":
      return user.auditor;
    case "COMMITTEE":
      return user.committee;
    case "FARMER":
    default:
      return user.farmer;
  }
}

function SimpleRoleProfile({ role, user, onSaved }: Readonly<Props>) {
  const toastRef = useRef<Toast | null>(null);
  const { update } = useSession();

  const roleData = getRoleData(user, role);

  const { id, version, endpoint, displayRoleLabel, tagSeverity } =
    useMemo(() => {
      if (role === "ADMIN") {
        return {
          id: user.admin?.adminId ?? 0,
          version: user.admin?.version ?? 0,
          endpoint: "admins",
          displayRoleLabel: ROLE_META.ADMIN.label,
          tagSeverity: ROLE_META.ADMIN.tag,
        };
      }

      if (role === "AUDITOR") {
        return {
          id: user.auditor?.auditorId ?? 0,
          version: user.auditor?.version ?? 0,
          endpoint: "auditors",
          displayRoleLabel: ROLE_META.AUDITOR.label,
          tagSeverity: ROLE_META.AUDITOR.tag,
        };
      }

      return {
        id: user.committee?.committeeId ?? 0,
        version: user.committee?.version ?? 0,
        endpoint: "committees",
        displayRoleLabel: ROLE_META.COMMITTEE.label,
        tagSeverity: ROLE_META.COMMITTEE.tag,
      };
    }, [role, user]);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<BaseFormState>(() => ({
    namePrefix: String((roleData as any)?.namePrefix ?? ""),
    firstName: String((roleData as any)?.firstName ?? ""),
    lastName: String((roleData as any)?.lastName ?? ""),
    email: String(user.email ?? ""),
  }));

  const initialRef = useRef<string>("");

  const makeInitial = useCallback((): BaseFormState => {
    return {
      namePrefix: String((roleData as any)?.namePrefix ?? ""),
      firstName: String((roleData as any)?.firstName ?? ""),
      lastName: String((roleData as any)?.lastName ?? ""),
      email: String(user.email ?? ""),
    };
  }, [roleData, user.email]);

  useEffect(() => {
    const next = makeInitial();
    setForm(next);
    setErrors({});
    setIsEditing(false);
    initialRef.current = JSON.stringify(next);
  }, [makeInitial, version]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== initialRef.current,
    [form]
  );

  const displayName = useMemo(() => {
    const prefix = String((roleData as any)?.namePrefix ?? "").trim();
    const first = String((roleData as any)?.firstName ?? "").trim();
    const last = String((roleData as any)?.lastName ?? "").trim();
    return [prefix + first, last]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");
  }, [roleData]);

  const avatarLetter =
    String((roleData as any)?.firstName ?? user.name ?? "?")
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

  const validate = useCallback(() => {
    const next: Record<string, string> = {};
    if (!form.namePrefix.trim()) next.namePrefix = "กรุณาเลือกคำนำหน้า";
    if (!form.firstName.trim()) next.firstName = "กรุณากรอกชื่อ";
    if (!form.lastName.trim()) next.lastName = "กรุณากรอกนามสกุล";
    if (!form.email.trim()) next.email = "กรุณากรอกอีเมล";
    return next;
  }, [form]);

  const save = useCallback(async () => {
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      toastRef.current?.show({
        severity: "error",
        summary: "ไม่สำเร็จ",
        detail: "กรุณากรอกข้อมูลให้ครบถ้วน",
        life: 3000,
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        version,
      };

      const res = await fetch(`/api/v1/${endpoint}/${id}`, {
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

      const updated = await res.json();
      onSaved(updated);
      await update();

      toastRef.current?.show({
        severity: "success",
        summary: "สำเร็จ",
        detail: "บันทึกข้อมูลโปรไฟล์เรียบร้อย",
        life: 2500,
      });

      setErrors({});
      setIsEditing(false);
      initialRef.current = JSON.stringify(form);
    } catch (e: any) {
      toastRef.current?.show({
        severity: "error",
        summary: "ไม่สำเร็จ",
        detail: e?.message || "บันทึกไม่สำเร็จ",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  }, [endpoint, form, id, onSaved, update, validate, version]);

  const cancel = useCallback(() => {
    const initial = makeInitial();
    setForm(initial);
    setErrors({});
    setIsEditing(false);
  }, [makeInitial]);

  return (
    <ProfileShell
      left={
        <Card>
          <Toast ref={toastRef} />
          <div className="flex items-center gap-4">
            <div
              className={`h-14 w-14 rounded-full ${avatarBg(
                role
              )} text-white flex items-center justify-center text-xl font-semibold`}
            >
              {avatarLetter}
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-gray-900 truncate">
                {displayName || "-"}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Tag severity={tagSeverity} value={displayRoleLabel} />
                <div className="text-sm text-gray-600 truncate">
                  {user.email || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  label="บันทึก"
                  icon="pi pi-save"
                  severity="success"
                  onClick={save}
                  disabled={!isDirty || saving}
                  loading={saving}
                  className="flex-1"
                />
                <Button
                  label="ยกเลิก"
                  icon="pi pi-times"
                  severity="secondary"
                  onClick={cancel}
                  disabled={saving}
                  className="flex-1"
                />
              </div>
            ) : (
              <Button
                label="แก้ไขโปรไฟล์"
                icon="pi pi-pencil"
                onClick={() => setIsEditing(true)}
                className="w-full"
              />
            )}
            <Button
              label="ตั้งค่า"
              icon="pi pi-cog"
              severity="secondary"
              className="w-full"
              onClick={() => {
                globalThis.location.href = `/${role.toLowerCase()}/settings`;
              }}
            />
          </div>
        </Card>
      }
      right={
        <div className="space-y-6">
          <Card title="ข้อมูลส่วนตัว">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow label="คำนำหน้า">
                {isEditing ? (
                  <PrimaryDropdown
                    value={form.namePrefix}
                    options={NAME_PREFIX_OPTIONS}
                    onChange={(value) =>
                      setForm((p) => ({ ...p, namePrefix: value }))
                    }
                    placeholder="คำนำหน้า"
                    required
                    invalid={!!errors.namePrefix}
                    errorMessage={errors.namePrefix}
                  />
                ) : (
                  <TextValue value={form.namePrefix} />
                )}
              </FieldRow>

              <div />

              <FieldRow label="ชื่อ">
                {isEditing ? (
                  <PrimaryInputText
                    value={form.firstName}
                    onChange={(value) =>
                      setForm((p) => ({ ...p, firstName: value }))
                    }
                    placeholder="ชื่อ"
                    required
                    maxLength={100}
                    invalid={!!errors.firstName}
                    errorMessage={errors.firstName}
                  />
                ) : (
                  <TextValue value={form.firstName} />
                )}
              </FieldRow>

              <FieldRow label="นามสกุล">
                {isEditing ? (
                  <PrimaryInputText
                    value={form.lastName}
                    onChange={(value) =>
                      setForm((p) => ({ ...p, lastName: value }))
                    }
                    placeholder="นามสกุล"
                    required
                    maxLength={100}
                    invalid={!!errors.lastName}
                    errorMessage={errors.lastName}
                  />
                ) : (
                  <TextValue value={form.lastName} />
                )}
              </FieldRow>
            </div>
          </Card>

          <Card title="ข้อมูลบัญชี">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldRow label="อีเมล">
                {isEditing ? (
                  <PrimaryInputText
                    value={form.email}
                    onChange={(value) =>
                      setForm((p) => ({ ...p, email: value }))
                    }
                    placeholder="อีเมล"
                    required
                    type="email"
                    maxLength={100}
                    invalid={!!errors.email}
                    errorMessage={errors.email}
                  />
                ) : (
                  <TextValue value={form.email} />
                )}
              </FieldRow>

              <FieldRow label="รหัสผู้ใช้">
                <TextValue value={String(user.userId ?? "-")} />
              </FieldRow>
            </div>
          </Card>
        </div>
      }
    />
  );
}

function FarmerProfileSidebar({
  role,
  displayName,
  email,
  avatarLetter,
  isEditing,
  isDirty,
  saving,
  onEdit,
  onSave,
  onCancel,
}: Readonly<{
  role: Role;
  displayName: string;
  email: string;
  avatarLetter: string;
  isEditing: boolean;
  isDirty: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}>) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div
          className={`h-14 w-14 rounded-full ${avatarBg(
            role
          )} text-white flex items-center justify-center text-xl font-semibold`}
        >
          {avatarLetter}
        </div>
        <div className="min-w-0">
          <div className="text-lg font-semibold text-gray-900 truncate">
            {displayName || "-"}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Tag severity="success" value="เกษตรกร" />
            <div className="text-sm text-gray-600 truncate">{email || "-"}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              label="บันทึก"
              icon="pi pi-save"
              severity="success"
              onClick={onSave}
              disabled={!isDirty || saving}
              loading={saving}
              className="flex-1"
            />
            <Button
              label="ยกเลิก"
              icon="pi pi-times"
              severity="secondary"
              onClick={onCancel}
              disabled={saving}
              className="flex-1"
            />
          </div>
        ) : (
          <Button
            label="แก้ไขโปรไฟล์"
            icon="pi pi-pencil"
            onClick={onEdit}
            className="w-full"
          />
        )}

        <Button
          label="ตั้งค่า"
          icon="pi pi-cog"
          severity="secondary"
          className="w-full"
          onClick={() => {
            globalThis.location.href = "/farmer/settings";
          }}
        />
      </div>
    </Card>
  );
}

function FarmerProfileDetails({
  isEditing,
  base,
  setBase,
  extra,
  setExtra,
  errors,
  userId,
  isLoadingAddress,
  province,
  district,
  subDistrict,
  provinceOptions,
  districtOptions,
  subDistrictOptions,
  onProvinceChange,
  onDistrictChange,
  onSubDistrictChange,
}: Readonly<{
  isEditing: boolean;
  base: BaseFormState;
  setBase: (updater: (prev: BaseFormState) => BaseFormState) => void;
  extra: FarmerFormState;
  setExtra: (updater: (prev: FarmerFormState) => FarmerFormState) => void;
  errors: Record<string, string>;
  userId: number;
  isLoadingAddress: boolean;
  province: string;
  district: string;
  subDistrict: string;
  provinceOptions: Array<{ label: string; value: string }>;
  districtOptions: Array<{ label: string; value: string }>;
  subDistrictOptions: Array<{ label: string; value: string }>;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onSubDistrictChange: (value: string) => void;
}>) {
  return (
    <div className="space-y-6">
      <Card title="ข้อมูลส่วนตัว">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldRow label="คำนำหน้า">
            {isEditing ? (
              <PrimaryDropdown
                value={base.namePrefix}
                options={NAME_PREFIX_OPTIONS}
                onChange={(value) =>
                  setBase((p) => ({ ...p, namePrefix: value }))
                }
                placeholder="คำนำหน้า"
                required
                invalid={!!errors.namePrefix}
                errorMessage={errors.namePrefix}
              />
            ) : (
              <TextValue value={base.namePrefix} />
            )}
          </FieldRow>
          <div />
          <FieldRow label="ชื่อ">
            {isEditing ? (
              <PrimaryInputText
                value={base.firstName}
                onChange={(value) =>
                  setBase((p) => ({ ...p, firstName: value }))
                }
                placeholder="ชื่อ"
                required
                maxLength={100}
                invalid={!!errors.firstName}
                errorMessage={errors.firstName}
              />
            ) : (
              <TextValue value={base.firstName} />
            )}
          </FieldRow>
          <FieldRow label="นามสกุล">
            {isEditing ? (
              <PrimaryInputText
                value={base.lastName}
                onChange={(value) =>
                  setBase((p) => ({ ...p, lastName: value }))
                }
                placeholder="นามสกุล"
                required
                maxLength={100}
                invalid={!!errors.lastName}
                errorMessage={errors.lastName}
              />
            ) : (
              <TextValue value={base.lastName} />
            )}
          </FieldRow>

          <FieldRow label="เลขบัตรประชาชน">
            {isEditing ? (
              <PrimaryInputMask
                value={extra.identificationNumber}
                onChange={(value) =>
                  setExtra((p) => ({ ...p, identificationNumber: value }))
                }
                mask="9-9999-99999-99-9"
                placeholder="X-XXXX-XXXXX-XX-X"
                required
                invalid={!!errors.identificationNumber}
                errorMessage={errors.identificationNumber}
              />
            ) : (
              <TextValue value={extra.identificationNumber} />
            )}
          </FieldRow>

          <FieldRow label="วันเดือนปีเกิด">
            {isEditing ? (
              <PrimaryCalendar
                value={extra.birthDate}
                onChange={(value) =>
                  setExtra((p) => ({ ...p, birthDate: value }))
                }
                placeholder="เลือกวันเดือนปีเกิด"
                required
                invalid={!!errors.birthDate}
                errorMessage={errors.birthDate}
                maxDate={new Date()}
              />
            ) : (
              <TextValue
                value={
                  extra.birthDate
                    ? extra.birthDate.toLocaleDateString("th-TH")
                    : ""
                }
              />
            )}
          </FieldRow>

          <FieldRow label="เพศ">
            {isEditing ? (
              <PrimaryDropdown
                value={extra.gender}
                options={GENDER_OPTIONS}
                onChange={(value) => setExtra((p) => ({ ...p, gender: value }))}
                placeholder="เลือกเพศ"
                required
                invalid={!!errors.gender}
                errorMessage={errors.gender}
              />
            ) : (
              <TextValue value={extra.gender} />
            )}
          </FieldRow>
        </div>
      </Card>

      <Card title="ข้อมูลบัญชี">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldRow label="อีเมล">
            {isEditing ? (
              <PrimaryInputText
                value={base.email}
                onChange={(value) => setBase((p) => ({ ...p, email: value }))}
                placeholder="อีเมล"
                required
                type="email"
                maxLength={100}
                invalid={!!errors.email}
                errorMessage={errors.email}
              />
            ) : (
              <TextValue value={base.email} />
            )}
          </FieldRow>
          <FieldRow label="รหัสผู้ใช้">
            <TextValue value={String(userId ?? "-")} />
          </FieldRow>
        </div>
      </Card>

      <Card title="ข้อมูลที่อยู่">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldRow label="บ้านเลขที่">
            {isEditing ? (
              <PrimaryInputText
                value={extra.houseNo}
                onChange={(value) =>
                  setExtra((p) => ({ ...p, houseNo: value }))
                }
                placeholder="บ้านเลขที่"
                required
                invalid={!!errors.houseNo}
                errorMessage={errors.houseNo}
              />
            ) : (
              <TextValue value={extra.houseNo} />
            )}
          </FieldRow>

          <FieldRow label="ชื่อหมู่บ้าน">
            {isEditing ? (
              <PrimaryInputText
                value={extra.villageName}
                onChange={(value) =>
                  setExtra((p) => ({ ...p, villageName: value }))
                }
                placeholder="ชื่อหมู่บ้าน"
              />
            ) : (
              <TextValue value={extra.villageName} />
            )}
          </FieldRow>

          <FieldRow label="หมู่">
            {isEditing ? (
              <PrimaryInputText
                value={extra.moo}
                onChange={(value) => setExtra((p) => ({ ...p, moo: value }))}
                placeholder="หมู่"
                required
                invalid={!!errors.moo}
                errorMessage={errors.moo}
              />
            ) : (
              <TextValue value={extra.moo} />
            )}
          </FieldRow>

          <FieldRow label="ถนน">
            {isEditing ? (
              <PrimaryInputText
                value={extra.road}
                onChange={(value) => setExtra((p) => ({ ...p, road: value }))}
                placeholder="ถนน"
              />
            ) : (
              <TextValue value={extra.road} />
            )}
          </FieldRow>

          <FieldRow label="ซอย">
            {isEditing ? (
              <PrimaryInputText
                value={extra.alley}
                onChange={(value) => setExtra((p) => ({ ...p, alley: value }))}
                placeholder="ซอย"
              />
            ) : (
              <TextValue value={extra.alley} />
            )}
          </FieldRow>
          <div />

          <FieldRow label="จังหวัด">
            {isEditing ? (
              <PrimaryDropdown
                value={province}
                options={provinceOptions}
                onChange={onProvinceChange}
                placeholder={isLoadingAddress ? "กำลังโหลด..." : "เลือกจังหวัด"}
                disabled={isLoadingAddress}
                filter
                required
                invalid={!!errors.provinceName}
                errorMessage={errors.provinceName}
              />
            ) : (
              <TextValue value={province} />
            )}
          </FieldRow>

          <FieldRow label="อำเภอ">
            {isEditing ? (
              <PrimaryDropdown
                value={district}
                options={districtOptions}
                onChange={onDistrictChange}
                placeholder={province ? "เลือกอำเภอ" : "เลือกจังหวัดก่อน"}
                disabled={isLoadingAddress || !province}
                filter
                required
                invalid={!!errors.district}
                errorMessage={errors.district}
              />
            ) : (
              <TextValue value={district} />
            )}
          </FieldRow>

          <FieldRow label="ตำบล">
            {isEditing ? (
              <PrimaryDropdown
                value={subDistrict}
                options={subDistrictOptions}
                onChange={onSubDistrictChange}
                placeholder={district ? "เลือกตำบล" : "เลือกอำเภอก่อน"}
                disabled={isLoadingAddress || !province || !district}
                filter
                required
                invalid={!!errors.subDistrict}
                errorMessage={errors.subDistrict}
              />
            ) : (
              <TextValue value={subDistrict} />
            )}
          </FieldRow>

          <FieldRow label="รหัสไปรษณีย์">
            {isEditing ? (
              <PrimaryInputText
                value={extra.zipCode}
                onChange={(value) =>
                  setExtra((p) => ({ ...p, zipCode: value }))
                }
                placeholder="รหัสไปรษณีย์"
              />
            ) : (
              <TextValue value={extra.zipCode} />
            )}
          </FieldRow>
        </div>
      </Card>

      <Card title="ข้อมูลติดต่อ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldRow label="เบอร์บ้าน">
            {isEditing ? (
              <PrimaryInputMask
                value={extra.phoneNumber}
                onChange={(value) =>
                  setExtra((p) => ({ ...p, phoneNumber: value }))
                }
                mask="99-999-9999"
                placeholder="02-123-4567"
              />
            ) : (
              <TextValue value={extra.phoneNumber} />
            )}
          </FieldRow>

          <FieldRow label="เบอร์มือถือ">
            {isEditing ? (
              <PrimaryInputMask
                value={extra.mobilePhoneNumber}
                onChange={(value) =>
                  setExtra((p) => ({ ...p, mobilePhoneNumber: value }))
                }
                mask="999-999-9999"
                placeholder="081-234-5678"
                required
                invalid={!!errors.mobilePhoneNumber}
                errorMessage={errors.mobilePhoneNumber}
              />
            ) : (
              <TextValue value={extra.mobilePhoneNumber} />
            )}
          </FieldRow>
        </div>
      </Card>
    </div>
  );
}

function FarmerProfile({ role, user, onSaved }: Readonly<Props>) {
  const toastRef = useRef<Toast | null>(null);
  const { update } = useSession();

  const farmer = user.farmer;
  const farmerId = farmer?.farmerId ?? 0;
  const version = farmer?.version ?? 0;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const makeInitialBase = useCallback((): BaseFormState => {
    return {
      namePrefix: String(farmer?.namePrefix ?? ""),
      firstName: String(farmer?.firstName ?? ""),
      lastName: String(farmer?.lastName ?? ""),
      email: String(user.email ?? ""),
    };
  }, [farmer?.firstName, farmer?.lastName, farmer?.namePrefix, user.email]);

  const makeInitialFarmer = useCallback((): FarmerFormState => {
    return {
      identificationNumber: formatIdNumber(farmer?.identificationNumber),
      birthDate: farmer?.birthDate ? new Date(farmer.birthDate) : null,
      gender: String(farmer?.gender ?? ""),

      houseNo: String(farmer?.houseNo ?? ""),
      villageName: String(farmer?.villageName ?? ""),
      moo:
        farmer?.moo === undefined || farmer?.moo === null
          ? ""
          : String(farmer.moo),
      road: String(farmer?.road ?? ""),
      alley: String(farmer?.alley ?? ""),
      subDistrict: String(farmer?.subDistrict ?? ""),
      district: String(farmer?.district ?? ""),
      provinceName: String(farmer?.provinceName ?? ""),
      zipCode: String(farmer?.zipCode ?? ""),

      phoneNumber: formatHomePhone(farmer?.phoneNumber),
      mobilePhoneNumber: formatMobilePhone(farmer?.mobilePhoneNumber),
    };
  }, [farmer]);

  const [base, setBase] = useState<BaseFormState>(() => makeInitialBase());
  const [extra, setExtra] = useState<FarmerFormState>(() =>
    makeInitialFarmer()
  );

  const initialRef = useRef<string>("");

  const serializeValue = useCallback((b: BaseFormState, e: FarmerFormState) => {
    return JSON.stringify({
      base: b,
      extra: {
        ...e,
        birthDate: e.birthDate ? e.birthDate.toISOString().slice(0, 10) : null,
      },
    });
  }, []);

  // Thai address cascade
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
  const didInitAddressRef = useRef(false);

  useEffect(() => {
    const nextBase = makeInitialBase();
    const nextExtra = makeInitialFarmer();
    setBase(nextBase);
    setExtra(nextExtra);
    setProvince(nextExtra.provinceName);
    setDistrict(nextExtra.district);
    setSubDistrict(nextExtra.subDistrict);
    setErrors({});
    setIsEditing(false);
    initialRef.current = serializeValue(nextBase, nextExtra);
    didInitAddressRef.current = false;
  }, [makeInitialBase, makeInitialFarmer, serializeValue, version]);

  const isDirty = useMemo(
    () => serializeValue(base, extra) !== initialRef.current,
    [base, extra, serializeValue]
  );

  const displayName = useMemo(() => {
    const prefix = base.namePrefix.trim();
    const first = base.firstName.trim();
    const last = base.lastName.trim();
    return [prefix + first, last]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");
  }, [base.firstName, base.lastName, base.namePrefix]);

  const avatarLetter =
    String(base.firstName || user.name || "?")
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

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

  const findMatchingOption = useCallback(
    (value: string, options: string[]): string | undefined => {
      if (!value) return undefined;
      const strippedValue = stripPrefix(value);
      if (options.includes(value)) return value;
      return options.find((opt) => stripPrefix(opt) === strippedValue);
    },
    [stripPrefix]
  );

  useEffect(() => {
    if (didInitAddressRef.current) return;
    if (isLoadingAddress || provinces.length === 0) return;

    const matchedProvince = findMatchingOption(extra.provinceName, provinces);
    const resolvedProvince = matchedProvince ?? extra.provinceName;
    setProvince(resolvedProvince);

    const districts = resolvedProvince ? getDistricts(resolvedProvince) : [];
    const matchedDistrict = findMatchingOption(extra.district, districts);
    const resolvedDistrict = matchedDistrict ?? extra.district;
    setDistrict(resolvedDistrict);

    const subDistricts =
      resolvedProvince && resolvedDistrict
        ? getSubDistricts(resolvedProvince, resolvedDistrict)
        : [];
    const matchedSubDistrict = findMatchingOption(
      extra.subDistrict,
      subDistricts
    );
    const resolvedSubDistrict = matchedSubDistrict ?? extra.subDistrict;
    setSubDistrict(resolvedSubDistrict);

    const resolvedZip =
      resolvedProvince && resolvedDistrict && resolvedSubDistrict
        ? extra.zipCode ||
          getZipCode(resolvedProvince, resolvedDistrict, resolvedSubDistrict)
        : extra.zipCode;

    setExtra((p) => ({
      ...p,
      provinceName: resolvedProvince,
      district: resolvedDistrict,
      subDistrict: resolvedSubDistrict,
      zipCode: resolvedZip,
    }));

    didInitAddressRef.current = true;
  }, [
    extra.district,
    extra.provinceName,
    extra.subDistrict,
    extra.zipCode,
    findMatchingOption,
    getDistricts,
    getSubDistricts,
    getZipCode,
    isLoadingAddress,
    provinces,
  ]);

  const provinceOptions = useMemo(
    () => provinces.map((p) => ({ label: p, value: p })),
    [provinces]
  );

  const districtOptions = useMemo(
    () =>
      province
        ? getDistricts(province).map((d) => ({ label: d, value: d }))
        : [],
    [getDistricts, province]
  );

  const subDistrictOptions = useMemo(
    () =>
      province && district
        ? getSubDistricts(province, district).map((s) => ({
            label: s,
            value: s,
          }))
        : [],
    [district, getSubDistricts, province]
  );

  const onProvinceChange = useCallback((value: string) => {
    setProvince(value);
    setDistrict("");
    setSubDistrict("");
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
    setExtra((prev) => ({
      ...prev,
      district: value,
      subDistrict: "",
      zipCode: "",
    }));
  }, []);

  const onSubDistrictChange = useCallback(
    (value: string) => {
      setSubDistrict(value);
      const z = getZipCode(province, district, value);
      setExtra((prev) => ({ ...prev, subDistrict: value, zipCode: z }));
    },
    [district, getZipCode, province]
  );

  const validate = useCallback(() => {
    const next: Record<string, string> = {};
    if (!base.namePrefix.trim()) next.namePrefix = "กรุณาเลือกคำนำหน้า";
    if (!base.firstName.trim()) next.firstName = "กรุณากรอกชื่อ";
    if (!base.lastName.trim()) next.lastName = "กรุณากรอกนามสกุล";
    if (!base.email.trim()) next.email = "กรุณากรอกอีเมล";

    const idDigits = extra.identificationNumber.replaceAll("-", "").trim();
    if (!idDigits) next.identificationNumber = "กรุณากรอกเลขบัตรประชาชน";
    if (idDigits && idDigits.length !== 13)
      next.identificationNumber = "เลขบัตรประชาชนต้องมี 13 หลัก";

    if (!extra.birthDate) next.birthDate = "กรุณาเลือกวันเดือนปีเกิด";
    if (!extra.gender.trim()) next.gender = "กรุณาเลือกเพศ";

    if (!extra.houseNo.trim()) next.houseNo = "กรุณากรอกบ้านเลขที่";
    if (!extra.moo.trim()) next.moo = "กรุณากรอกหมู่";
    if (!province.trim()) next.provinceName = "กรุณาเลือกจังหวัด";
    if (!district.trim()) next.district = "กรุณาเลือกอำเภอ";
    if (!subDistrict.trim()) next.subDistrict = "กรุณาเลือกตำบล";

    const mobileDigits = extra.mobilePhoneNumber.replaceAll("-", "").trim();
    if (!mobileDigits) next.mobilePhoneNumber = "กรุณากรอกเบอร์มือถือ";

    return next;
  }, [
    base.email,
    base.firstName,
    base.lastName,
    base.namePrefix,
    district,
    extra.birthDate,
    extra.gender,
    extra.houseNo,
    extra.identificationNumber,
    extra.mobilePhoneNumber,
    extra.moo,
    province,
    subDistrict,
  ]);

  const save = useCallback(async () => {
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      toastRef.current?.show({
        severity: "error",
        summary: "ไม่สำเร็จ",
        detail: "กรุณากรอกข้อมูลให้ครบถ้วน",
        life: 3000,
      });
      return;
    }

    setSaving(true);
    try {
      const idDigits = extra.identificationNumber.replaceAll("-", "").trim();
      const phoneDigits = extra.phoneNumber.replaceAll("-", "").trim();
      const mobileDigits = extra.mobilePhoneNumber.replaceAll("-", "").trim();

      const payload: any = {
        ...base,
        identificationNumber: idDigits,
        birthDate: extra.birthDate
          ? extra.birthDate.toISOString().slice(0, 10)
          : null,
        gender: extra.gender,
        houseNo: extra.houseNo,
        villageName: extra.villageName,
        moo: extra.moo.trim() ? Number(extra.moo) : null,
        road: extra.road,
        alley: extra.alley,
        provinceName: province,
        district,
        subDistrict,
        zipCode: extra.zipCode,
        phoneNumber: phoneDigits,
        mobilePhoneNumber: mobileDigits,
        version,
      };

      const res = await fetch(`/api/v1/farmers/${farmerId}`, {
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

      const updated = await res.json();
      onSaved(updated);
      await update();

      toastRef.current?.show({
        severity: "success",
        summary: "สำเร็จ",
        detail: "บันทึกข้อมูลโปรไฟล์เรียบร้อย",
        life: 2500,
      });

      setErrors({});
      setIsEditing(false);
      initialRef.current = serializeValue(base, extra);
    } catch (e: any) {
      toastRef.current?.show({
        severity: "error",
        summary: "ไม่สำเร็จ",
        detail: e?.message || "บันทึกไม่สำเร็จ",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  }, [
    base,
    district,
    extra,
    farmerId,
    onSaved,
    province,
    serializeValue,
    subDistrict,
    update,
    validate,
    version,
  ]);

  const cancel = useCallback(() => {
    const nextBase = makeInitialBase();
    const nextExtra = makeInitialFarmer();
    setBase(nextBase);
    setExtra(nextExtra);
    setProvince(nextExtra.provinceName);
    setDistrict(nextExtra.district);
    setSubDistrict(nextExtra.subDistrict);
    setErrors({});
    setIsEditing(false);
  }, [makeInitialBase, makeInitialFarmer]);

  return (
    <ProfileShell
      left={
        <>
          <Toast ref={toastRef} />
          <FarmerProfileSidebar
            role={role}
            displayName={displayName}
            email={String(user.email ?? "")}
            avatarLetter={avatarLetter}
            isEditing={isEditing}
            isDirty={isDirty}
            saving={saving}
            onEdit={() => setIsEditing(true)}
            onSave={save}
            onCancel={cancel}
          />
        </>
      }
      right={
        <FarmerProfileDetails
          isEditing={isEditing}
          base={base}
          setBase={setBase}
          extra={extra}
          setExtra={setExtra}
          errors={errors}
          userId={user.userId}
          isLoadingAddress={isLoadingAddress}
          province={province}
          district={district}
          subDistrict={subDistrict}
          provinceOptions={provinceOptions}
          districtOptions={districtOptions}
          subDistrictOptions={subDistrictOptions}
          onProvinceChange={onProvinceChange}
          onDistrictChange={onDistrictChange}
          onSubDistrictChange={onSubDistrictChange}
        />
      }
    />
  );
}

export default function RoleProfilePage(props: Readonly<Props>) {
  if (props.role === "FARMER") {
    return <FarmerProfile {...props} />;
  }
  return <SimpleRoleProfile {...props} />;
}
