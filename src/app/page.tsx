"use client";

import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { PrimaryInputText, PrimaryPassword } from "@/components/ui";
import React, { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("FARMER");
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
          await signOut({ redirect: false }); // eslint-disable-line
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

  const getRoleLabel = (role: string) => {
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

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-secondary to-white">
      {/* Left side - image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-secondary relative">
        <div className="p-12 w-full">
          <Image
            src="/rubber-tapping.jpg"
            alt="การยางแห่งประเทศไทย"
            className="rounded-lg shadow-lg object-cover"
            width={600}
            height={800}
            style={{ width: "100%", height: "auto", maxHeight: "80vh" }}
            priority
          />
          <div className="absolute bottom-10 left-10 right-10 bg-white/80 p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-green-800">
              ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
            </h3>
            <p className="text-green-700">การยางแห่งประเทศไทย</p>
          </div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Rubber Authority of Thailand Logo"
                width={120}
                height={120}
                priority
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
              เข้าสู่ระบบ
            </h1>
            <p className="text-gray-600">
              ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                เข้าสู่ระบบในฐานะ
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "FARMER", label: "เกษตรกร" },
                  { id: "AUDITOR", label: "ผู้ตรวจประเมิน" },
                  { id: "COMMITTEE", label: "คณะกรรมการ" },
                  { id: "ADMIN", label: "ผู้ดูแลระบบ" },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    className={`py-2 px-3 text-sm rounded-md border transition-colors ${
                      selectedRole === role.id
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                อีเมล
              </label>
              <PrimaryInputText
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(value) => {
                  setEmail(value);
                  if (emailError) validateEmail(value);
                }}
                placeholder="email@example.com"
                autoComplete="email"
                required
                invalid={!!emailError}
                errorMessage={emailError}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                รหัสผ่าน
              </label>
              <PrimaryPassword
                id="password"
                name="password"
                value={password}
                onChange={(value) => {
                  setPassword(value);
                  if (passwordError) validatePassword(value);
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                feedback={false}
                toggleMask={true}
                invalid={!!passwordError}
                errorMessage={passwordError}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  จดจำฉันไว้
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-green-600 hover:text-green-500"
                  onClick={() => alert("ฟีเจอร์นี้กำลังพัฒนา")}
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
            </div>

            <div>
              <PrimaryButton
                type="submit"
                label="เข้าสู่ระบบ"
                loading={isLoading}
                fullWidth
              />
            </div>
          </form>

          <div className="mt-8 text-center">
            <p
              className={`text-sm text-gray-600 ${
                selectedRole === "FARMER" ? "visible" : "invisible"
              }`}
            >
              ยังไม่มีบัญชีผู้ใช้?{" "}
              <Link
                href="/register"
                className="font-medium text-green-600 hover:text-green-500"
              >
                สมัครสมาชิกใหม่
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-4">
              &copy; {new Date().getFullYear()} การยางแห่งประเทศไทย.
              สงวนลิขสิทธิ์.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
