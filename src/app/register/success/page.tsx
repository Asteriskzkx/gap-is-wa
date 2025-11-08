"use client";

import { CheckIcon } from "@/components/icons";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RegisterSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="การยางแห่งประเทศไทย"
            width={100}
            height={100}
            priority
          />
        </div>

        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckIcon className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ลงทะเบียนสำเร็จ
        </h1>
        <p className="text-gray-600 mb-8">
          ขอบคุณที่ลงทะเบียนเข้าใช้งานระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
          กรุณาเข้าสู่ระบบเพื่อเริ่มต้นใช้งาน
        </p>

        <div className="space-y-4">
          <PrimaryButton
            onClick={() => router.push("/")}
            color="success"
            fullWidth
          >
            เข้าสู่ระบบ
          </PrimaryButton>

          <PrimaryButton
            label="กลับสู่หน้าหลัก"
            variant="outlined"
            color="secondary"
            onClick={() => router.push("/")}
            fullWidth
          ></PrimaryButton>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>
          หากมีข้อสงสัยหรือต้องการความช่วยเหลือ กรุณาติดต่อ:
          support@rubber.go.th
        </p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} การยางแห่งประเทศไทย. สงวนลิขสิทธิ์.
        </p>
      </div>
    </div>
  );
}
