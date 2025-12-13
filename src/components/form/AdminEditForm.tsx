import { NormalizedUser, AdminInfo } from "@/types/UserType";
import React, { useMemo } from "react";
import BaseUserForm, { BaseUserFormValues } from "./BaseUserForm";

type Props = {
  user: NormalizedUser;
  onSuccess?: (updated: AdminInfo) => void;
};

export default function AdminEditForm({ user, onSuccess }: Props) {
  const initialFormData: BaseUserFormValues = useMemo(
    () => ({
      namePrefix: user.admin?.namePrefix ?? "",
      firstName: user.admin?.firstName ?? "",
      lastName: user.admin?.lastName ?? "",
      email: user.email ?? "",
    }),
    [user]
  );

  const submit = async (values: BaseUserFormValues): Promise<AdminInfo> => {
    const payload = {
      ...values,
      version: user.admin?.version || 0,
    };
    const res = await fetch(`/api/v1/admins/${user.admin?.adminId}`, {
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
    
    const updated: AdminInfo = await res.json();
    return updated;
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขข้อมูลของ ผู้ดูแลระบบ</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
         <p className="text-lg font-bold mb-4">
          คุณกำลังแก้ไขข้อมูลผู้ใช้ชื่อ{" "}
          {[
            `${user.admin?.namePrefix ?? ""}${user.admin?.firstName ?? ""}`,
            user.admin?.lastName ?? "",
          ]
            .map((s) => s.trim())
            .filter(Boolean)
            .join(" ") || "-"}{" "}
          ( รหัสผู้ใช้ : {user.userId} )
        </p>

        <BaseUserForm
          defaultValues={initialFormData}
          onSubmit={submit}
          onSuccess={onSuccess}
          successMessage="บันทึกข้อมูลผู้ดูแลระบบเรียบร้อย"
          errorMessage="บันทึกข้อมูลผู้ดูแลระบบไม่สำเร็จ"
        />
      </div>
    </div>
  );
}
