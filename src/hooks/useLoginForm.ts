import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type UserRole = "FARMER" | "AUDITOR" | "COMMITTEE" | "ADMIN";

interface UseLoginFormReturn {
  // Form state
  email: string;
  password: string;
  selectedRole: UserRole;
  isLoading: boolean;
  error: string;
  emailError: string;
  passwordError: string;

  // Form actions
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setSelectedRole: (role: UserRole) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  validateEmail: (email: string) => boolean;
  validatePassword: (password: string) => boolean;
  getRoleLabel: (role: string) => string;
}

export function useLoginForm(): UseLoginFormReturn {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("FARMER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Validate email format
  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError("กรุณากรอกอีเมล");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("รูปแบบอีเมลไม่ถูกต้อง");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Validate password
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("กรุณากรอกรหัสผ่าน");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Get role label in Thai
  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "FARMER":
        return "เกษตรกร";
      case "AUDITOR":
        return "ผู้ตรวจประเมิน";
      case "COMMITTEE":
        return "คณะกรรมการ";
      case "ADMIN":
        return "ผู้ดูแลระบบ";
      default:
        return role;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      // ใช้ NextAuth แทน API เดิม
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        // ดึง session มาตรวจสอบ role
        const response = await fetch("/api/auth/session");
        const session = await response.json();

        if (!session?.user) {
          throw new Error("ไม่สามารถดึงข้อมูล session ได้");
        }

        // ตรวจสอบว่า role ที่เลือกตรงกับ role ที่แท้จริงหรือไม่
        if (session.user.role !== selectedRole) {
          // ถ้าไม่ตรง ให้ออกจากระบบและแจ้งเตือน
          await signOut({ redirect: false });
          throw new Error(
            `คุณไม่มีสิทธิ์เข้าใช้งานในฐานะ${getRoleLabel(selectedRole)}`
          );
        }

        // Redirect based on actual role from session
        switch (session.user.role) {
          case "FARMER":
            router.push("/farmer/dashboard");
            break;
          case "AUDITOR":
            router.push("/auditor/dashboard");
            break;
          case "COMMITTEE":
            router.push("/committee/dashboard");
            break;
          case "ADMIN":
            router.push("/admin/dashboard");
            break;
          default:
            router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message ?? "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    email,
    password,
    selectedRole,
    isLoading,
    error,
    emailError,
    passwordError,

    // Actions
    setEmail,
    setPassword,
    setSelectedRole,
    handleSubmit,
    validateEmail,
    validatePassword,
    getRoleLabel,
  };
}
