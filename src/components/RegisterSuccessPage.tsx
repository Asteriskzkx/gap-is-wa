"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ลงทะเบียนสำเร็จ!
        </h1>
        <p className="text-gray-600 mb-8">
          ขอบคุณที่ลงทะเบียนเข้าใช้งานระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
          กรุณาเข้าสู่ระบบเพื่อเริ่มต้นใช้งาน
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            เข้าสู่ระบบ
          </Link>

          <button
            onClick={() => router.push("/")}
            className="block w-full px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            กลับสู่หน้าหลัก
          </button>
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
