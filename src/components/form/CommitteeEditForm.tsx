import React, { useMemo } from "react";
import { NormalizedUser, CommitteeInfo } from "@/types/UserType";
import BaseUserForm, { BaseUserFormValues } from "./BaseUserForm";

type Props = {
  user: NormalizedUser;
  onSuccess?: (updated: CommitteeInfo) => void;
};
export default function CommitteeEditForm({ user, onSuccess }: Props) {
  const initialValues: BaseUserFormValues = useMemo(
    () => ({
      namePrefix: user.committee?.namePrefix ?? "",
      firstName: user.committee?.firstName ?? "",
      lastName: user.committee?.lastName ?? "",
      email: user.email ?? "",
    }),
    [user]
  );

  const submit = async (values: BaseUserFormValues): Promise<CommitteeInfo> => {
    const payload = {
      ...values,
      version: user.committee?.version || 0,
    };
    const res = await fetch(`/api/v1/committees/${user.committee?.committeeId}`, {
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
    
    const updated: CommitteeInfo = await res.json();
    return updated;
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          แก้ไขข้อมูลผู้ใช้ของ คณะกรรมการ
        </h1>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
         <p className="text-lg font-bold mb-4">
          คุณกำลังแก้ไขข้อมูลผู้ใช้ชื่อ{" "}
          {[
            `${user.committee?.namePrefix ?? ""}${user.committee?.firstName ?? ""}`,
            user.committee?.lastName ?? "",
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
          successMessage="บันทึกข้อมูลคณะกรรมการเรียบร้อย"
          errorMessage="บันทึกข้อมูลคณะกรรมการไม่สำเร็จ"
        />
      </div>
    </div>
  );
}
