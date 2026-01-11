import React, { useMemo } from "react";
import { NormalizedUser, AuditorInfo } from "@/types/UserType";
import BaseUserForm, { BaseUserFormValues } from "./BaseUserForm";

type Props = {
  user: NormalizedUser;
  onSuccess?: (updated: AuditorInfo) => void;
};

export default function AuditorEditForm({ user, onSuccess }: Props) {
  const initialValues: BaseUserFormValues = useMemo(
    () => ({
      namePrefix: user.auditor?.namePrefix ?? "",
      firstName: user.auditor?.firstName ?? "",
      lastName: user.auditor?.lastName ?? "",
      email: user.email ?? "",
    }),
    [user]
  );

  const submit = async (values: BaseUserFormValues): Promise<AuditorInfo> => {
    const payload = {
      ...values,
      version: user.auditor?.version || 0,
    };
    const res = await fetch(`/api/v1/auditors/${user.auditor?.auditorId}`, {
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

    const updated: AuditorInfo = await res.json();
    return updated;
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          แก้ไขข้อมูลของ ผู้ตรวจประเมิน
        </h1>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg font-bold mb-4">
          คุณกำลังแก้ไขข้อมูลผู้ใช้ชื่อ{" "}
          {[
            `${user.auditor?.namePrefix ?? ""}${user.auditor?.firstName ?? ""}`,
            user.auditor?.lastName ?? "",
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
          successMessage="บันทึกข้อมูลผู้ตรวจประเมินเรียบร้อย"
          errorMessage="บันทึกข้อมูลผู้ตรวจประเมินไม่สำเร็จ"
        />
      </div>
    </div>
  );
}
