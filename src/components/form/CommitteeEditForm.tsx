import React, { useMemo } from "react";
import { NormalizedUser } from "@/types/UserType";
import BaseUserForm, { BaseUserFormValues } from "./BaseUserForm";

type Props = {
  user: NormalizedUser;
};
export default function CommitteeEditForm({ user }: Props) {
  const initialValues: BaseUserFormValues = useMemo(
    () => ({
      namePrefix: user.committee?.namePrefix ?? "",
      firstName: user.committee?.firstName ?? "",
      lastName: user.committee?.lastName ?? "",
      email: user.email ?? "",
    }),
    [user]
  );

  const submit = async (values: BaseUserFormValues) => {
    const res = await fetch(`/api/committees/${user.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
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
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-lg font-bold mb-4">
        ชื่อ: {user.committee?.firstName ?? "-"} (UserID: {user.userId})
      </p>
      <BaseUserForm
        defaultValues={initialValues}
        onSubmit={submit}
        successMessage="บันทึกข้อมูลคณะกรรมการเรียบร้อย"
        errorMessage="บันทึกข้อมูลคณะกรรมการไม่สำเร็จ"
      />
    </div>
  );
}
