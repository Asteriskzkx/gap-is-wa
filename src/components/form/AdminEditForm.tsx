import { NormalizedUser } from "@/types/UserType";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import React, { useEffect, useState } from "react";

type Props = {
  user: NormalizedUser;
};

export default function AdminEditForm({ user }: Props) {
  const [formData, setFormData] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const namePrefixOptions = [
    { name: "นาย", value: "นาย" },
    { name: "นางสาว", value: "นางสาว" },
    { name: "นาง", value: "นาง" },
  ];

  // เมื่อ user เปลี่ยนค่า ให้เซ็ตค่าเริ่มต้นใน form
  useEffect(() => {
    if (user.admin) {
      setFormData({
        namePrefix: user.admin.namePrefix ?? "",
        firstName: user.admin.firstName ?? "",
        lastName: user.admin.lastName ?? "",
        email: user.email ?? "",
        password: "",
      });
    }
  }, [user]);

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
        <h1 className="text-2xl font-bold text-gray-900">
          แก้ไขผู้ดูแลระบบ
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg font-bold mb-4">
          ชื่อ: {user.admin?.firstName} (UserID: {user.userId})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="w-full flex flex-col md:flex-row items-center gap-4">
              <label htmlFor="namePrefix" className="w-28">
                คำนำหน้า
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
              />
            </div>

            <div className="w-full flex flex-col md:flex-row items-center gap-4">
              <label htmlFor="firstName" className="w-28">
                ชื่อ
              </label>
              <InputText
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="w-full flex flex-col md:flex-row items-center gap-4">
              <label htmlFor="lastName" className="w-28">
                นามสกุล
              </label>
              <InputText
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="w-full flex flex-col md:flex-row items-center gap-4">
              <label htmlFor="email" className="w-28">
                อีเมล
              </label>
              <InputText
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            บันทึก
          </button>
        </form>
      </div>
    </div>
  );
}
