"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import RubberFarmRegistrationForm from "@/components/RubberFarmRegistrationForm";

export default function RubberFarmApplication() {
  return (
    <div className="flex flex-col min-h-screen bg-[#EBFFF3]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/farmer/dashboard">
              <Image
                src="/logo_header.png"
                alt="Rubber Authority of Thailand Logo"
                width={180}
                height={180}
                className="mr-2"
              />
            </Link>
          </div>
          <Link
            href="/farmer/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RubberFarmRegistrationForm />
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Rubber Authority of Thailand Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} การยางแห่งประเทศไทย. สงวนลิขสิทธิ์.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  นโยบายความเป็นส่วนตัว
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  เงื่อนไขการใช้งาน
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  ติดต่อเรา
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
