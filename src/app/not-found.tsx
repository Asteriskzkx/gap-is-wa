"use client";

import PrimaryButton from "@/components/ui/PrimaryButton";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo-with-text.png"
            alt="การยางแห่งประเทศไทย"
            width={120}
            height={120}
            priority
          />
        </div>

        <div className="mb-8">
          <h1 className="text-9xl font-bold text-green-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ไม่พบหน้าที่คุณต้องการ
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            ขออภัย ไม่พบหน้าที่คุณกำลังมองหา
          </p>
          <p className="text-gray-500">
            หน้าที่คุณพยายามเข้าถึงอาจถูกย้าย ลบ หรือไม่เคยมีอยู่จริง
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <PrimaryButton
            label="กลับไปหน้าหลัก"
            icon="pi pi-home"
            onClick={() => router.push("/")}
          />
          <PrimaryButton
            label="กลับไปหน้าก่อนหน้า"
            icon="pi pi-arrow-left"
            color="secondary"
            variant="outlined"
            onClick={() => router.back()}
          />
        </div>

        <p className="text-sm text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} การยางแห่งประเทศไทย. สงวนลิขสิทธิ์.
        </p>
      </div>
    </div>
  );
}
