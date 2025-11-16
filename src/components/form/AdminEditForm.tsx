import { NormalizedUser } from "@/types/UserType";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useMemo, useState } from "react";

type Props = {
  user: NormalizedUser;
};

export default function AdminEditForm({ user }: Props) {
  const [formData, setFormData] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  const namePrefixOptions = [
    { name: "นาย", value: "นาย" },
    { name: "นางสาว", value: "นางสาว" },
    { name: "นาง", value: "นาง" },
  ];

  // ค่าฟอร์มเริ่มต้น อ้างอิงจาก props.user (memoized)
  const initialFormData = useMemo(
    () => ({
      namePrefix: user.admin?.namePrefix ?? "",
      firstName: user.admin?.firstName ?? "",
      lastName: user.admin?.lastName ?? "",
      email: user.email ?? "",
    }),
    [user]
  );

  // ตั้งค่าเริ่มต้นเมื่อ user เปลี่ยน
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(initialFormData),
    [formData, initialFormData]
  );

  const handleReset = () => {
    // รีเซ็ตกลับเป็นค่าเริ่มต้นก่อนแก้ไข
    setFormData(initialFormData);
  };

  const handleChange = (e: any) => {
    const name = e.target?.name;
    const value = e.value ?? e.target?.value; // dropdown ใช้ e.value
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admins/${user.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const result = await res.json();
        console.log("User updated:", result);
        // Optionally show success UI or redirect
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขผู้ดูแลระบบ</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg font-bold mb-4">
          ชื่อ: {user.admin?.firstName} (UserID: {user.userId})
        </p>

        <form onSubmit={handleSubmit} onReset={handleReset} className="space-y-4">
          <div className="w-full items-center gap-4">
              <label htmlFor="namePrefix" className="w-28">
                คำนำหน้า <span className="text-red-500">*</span>
              </label>
              <Dropdown
                inputId="namePrefix"
                name="namePrefix"
                value={formData.namePrefix}
                onChange={handleChange}
                options={namePrefixOptions}
                optionLabel="name"
                optionValue="value"
                className="w-full"
                placeholder="คำนำหน้า"
              />
            </div>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            

            <div className="w-full items-center gap-4">
              <label htmlFor="firstName" className="w-28">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <InputText
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full"
                placeholder="ชื่อ"
              />
            </div>

            <div className="w-full items-center gap-4">
              <label htmlFor="lastName" className="w-28">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <InputText
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full"
                placeholder="นามสกุล"
              />
            </div>

            
          </div>
          <div className="w-full items-center gap-4">
              <label htmlFor="email" className="w-28">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <InputText
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
                placeholder="อีเมล"
              />
            </div>
          <div className="flex gap-4 mt-4 inset-0 w-full justify-end">
            <Button
              type="submit"
              label="บันทึก"
              icon="pi pi-save"
              className="px-3 py-2"
              severity="success"
              disabled={!isDirty}
            />
            <Button
              type="reset"
              label="รีเซ็ต"
              icon="pi pi-times"
              className="px-3 py-2"
              severity="danger"
              disabled={!isDirty}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
