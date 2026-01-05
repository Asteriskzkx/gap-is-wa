"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { PrimaryPassword, PrimaryButton } from "./ui";

interface ChangePasswordDialogProps {
  visible: boolean;
  onPasswordChanged: () => void;
}

export default function ChangePasswordDialog({
  visible,
  onPasswordChanged,
}: Readonly<ChangePasswordDialogProps>) {
  const { data: session } = useSession();
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
    // Validate
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
          userId: Number.parseInt(session?.user?.id || "0"),
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      }

      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Notify parent
      onPasswordChanged();
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="จำเป็นต้องเปลี่ยนรหัสผ่าน"
      visible={visible}
      onHide={() => {}}
      style={{ width: "90%", maxWidth: "500px" }}
      modal
      closable={false}
      blockScroll={true}
      draggable={false}
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <i className="pi pi-exclamation-triangle"></i>
            <span>เพื่อความปลอดภัยของบัญชี กรุณาเปลี่ยนรหัสผ่านของคุณ</span>
          </p>
        </div>

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
          <p className="text-xs text-gray-500 mt-1">
            รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัว ประกอบด้วยตัวพิมพ์ใหญ่
            ตัวพิมพ์เล็ก และตัวเลข
          </p>
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

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
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
    </Dialog>
  );
}
