"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { PrimaryButton, PrimaryPassword } from "@/components/ui";

export default function SettingPage() {
  const { update } = useSession();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
    }
    if (!/[A-Z]/.test(password)) {
      return "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว";
    }
    if (!/[a-z]/.test(password)) {
      return "รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว";
    }
    if (!/\d/.test(password)) {
      return "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว";
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/v1/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      }

      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Refresh session so requirePasswordChange can be updated if needed
      await update();
    } catch (error: any) {
      toast.error(error?.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-full">
        <h1 className="text-2xl font-semibold text-gray-900">ตั้งค่า</h1>
        <p className="text-sm text-gray-600 mt-1">
          จัดการการตั้งค่าพื้นฐานของบัญชีผู้ใช้
        </p>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                เปลี่ยนรหัสผ่าน
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                รหัสผ่านต้องมีอย่างน้อย 8 ตัว และประกอบด้วยตัวพิมพ์ใหญ่
                ตัวพิมพ์เล็ก และตัวเลข
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                รหัสผ่านปัจจุบัน <span className="text-red-500">*</span>
              </label>
              <PrimaryPassword
                id="currentPassword"
                value={currentPassword}
                onChange={(value) => setCurrentPassword(value)}
                placeholder="กรอกรหัสผ่านปัจจุบัน"
                feedback={false}
                toggleMask
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                รหัสผ่านใหม่ <span className="text-red-500">*</span>
              </label>
              <PrimaryPassword
                id="newPassword"
                value={newPassword}
                onChange={(value) => setNewPassword(value)}
                placeholder="กรอกรหัสผ่านใหม่"
                toggleMask
                feedback
                weakLabel="อ่อนแอ"
                mediumLabel="ปานกลาง"
                strongLabel="แข็งแรง"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
              </label>
              <PrimaryPassword
                id="confirmPassword"
                value={confirmPassword}
                onChange={(value) => setConfirmPassword(value)}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                feedback={false}
                toggleMask
                disabled={loading}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <PrimaryButton
                label="เปลี่ยนรหัสผ่าน"
                icon="pi pi-check"
                onClick={handleSubmit}
                loading={loading}
                disabled={loading}
                color="success"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
