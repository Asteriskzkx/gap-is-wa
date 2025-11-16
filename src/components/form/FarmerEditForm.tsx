import { NormalizedUser } from "@/types/UserType";
import { InputText } from "primereact/inputtext";
import React, { useMemo, useState } from "react";
import BaseUserForm, { BaseUserFormValues } from "./BaseUserForm";

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
    birthDate: user.farmer?.birthDate ? new Date(user.farmer.birthDate).toISOString().slice(0, 10) : "",
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
      birthDate: user.farmer?.birthDate ? new Date(user.farmer.birthDate).toISOString().slice(0, 10) : "",
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

  const onChangeExtra = (e: any) => {
    const name = e.target?.name;
    const value = e.target?.value;
    if (!name) return;
    setExtra((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (values: BaseUserFormValues) => {
    const payload = {
      ...values,
      ...extra,
      moo: extra.moo ? Number(extra.moo) : null,
      birthDate: extra.birthDate ? new Date(extra.birthDate).toISOString() : null,
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
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <p className="text-lg font-bold">
        ชื่อ: {user.farmer?.firstName ?? "-"} (UserID: {user.userId})
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
          <h3 className="font-semibold">ข้อมูลเพิ่มเติมของเกษตรกร</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="identificationNumber">เลขบัตรประชาชน</label>
              <InputText id="identificationNumber" name="identificationNumber" value={extra.identificationNumber} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="birthDate">วันเกิด</label>
              <InputText id="birthDate" name="birthDate" type="date" value={extra.birthDate} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="gender">เพศ</label>
              <InputText id="gender" name="gender" value={extra.gender} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="phoneNumber">เบอร์โทรศัพท์</label>
              <InputText id="phoneNumber" name="phoneNumber" value={extra.phoneNumber} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="mobilePhoneNumber">เบอร์มือถือ</label>
              <InputText id="mobilePhoneNumber" name="mobilePhoneNumber" value={extra.mobilePhoneNumber} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="houseNo">บ้านเลขที่</label>
              <InputText id="houseNo" name="houseNo" value={extra.houseNo} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="villageName">หมู่บ้าน</label>
              <InputText id="villageName" name="villageName" value={extra.villageName} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="moo">หมู่</label>
              <InputText id="moo" name="moo" value={extra.moo} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="road">ถนน</label>
              <InputText id="road" name="road" value={extra.road} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="alley">ซอย</label>
              <InputText id="alley" name="alley" value={extra.alley} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="subDistrict">ตำบล</label>
              <InputText id="subDistrict" name="subDistrict" value={extra.subDistrict} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="district">อำเภอ</label>
              <InputText id="district" name="district" value={extra.district} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="provinceName">จังหวัด</label>
              <InputText id="provinceName" name="provinceName" value={extra.provinceName} onChange={onChangeExtra} className="w-full" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="zipCode">รหัสไปรษณีย์</label>
              <InputText id="zipCode" name="zipCode" value={extra.zipCode} onChange={onChangeExtra} className="w-full" />
            </div>
          </div>
        </div>
      </BaseUserForm>
    </div>
  );
}
