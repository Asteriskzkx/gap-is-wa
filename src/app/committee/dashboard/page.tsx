"use client";

import React from "react";
import Link from "next/link";
import CommitteeLayout from "@/components/layout/CommitteeLayout";

// Icons
import {
  HomeIcon,
  TextClipboardIcon,
  EditIcon,
  XIcon,
  FileIcon,
} from "@/components/icons";

export default function CommitteeDashboardPage() {
  // Navigation menu items for dashboard content
  const navItems = [
    {
      title: "หน้าหลัก",
      href: "/committee/dashboard",
      icon: <HomeIcon className="h-6 w-6" />,
    },
    {
      title: "พิจารณาผลการตรวจประเมิน",
      href: "/committee/assessments",
      icon: <TextClipboardIcon className="h-6 w-6" />,
    },
    {
      title: "ออกใบรับรองแหล่งผลิตจีเอพี",
      href: "/committee/certifications/issue",
      icon: <EditIcon className="h-6 w-6" />,
    },
    {
      title: "ยกเลิกใบรับรองแหล่งผลิตจีเอพี",
      href: "/committee/certifications/revoke",
      icon: <XIcon className="h-6 w-6" />,
    },
    {
      title: "รายงานสรุปการรับรอง",
      href: "/committee/reports",
      icon: <FileIcon className="h-6 w-6" />,
    },
  ];

  return (
    <CommitteeLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            หน้าหลักคณะกรรมการ
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            ยินดีต้อนรับสู่ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
          </p>
        </div>

        {/* Action Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navItems
            .filter((item) => item.title !== "หน้าหลัก") // กรองการ์ดที่ไม่ต้องการแสดง
            .map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <Link href={item.href} className="block">
                  <div className="flex flex-col h-full">
                    <div
                      className={`p-3 rounded-full mb-4 w-12 h-12 flex items-center justify-center ${
                        index === 0
                          ? "bg-indigo-100 text-indigo-600"
                          : index === 1
                          ? "bg-emerald-100 text-emerald-600"
                          : index === 2
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 flex-grow">
                      {index === 0
                        ? "พิจารณาผลการตรวจประเมินสวนยางพาราจากผู้ตรวจประเมิน"
                        : index === 1
                        ? "ออกใบรับรองแหล่งผลิตยางพาราที่ผ่านการตรวจประเมิน"
                        : index === 2
                        ? "ยกเลิกใบรับรองแหล่งผลิต"
                        : "ดูรายงานสรุปข้อมูลต่างๆ"}
                    </p>
                    <div className="mt-4 flex items-center text-indigo-600 font-medium text-sm">
                      <span>เข้าสู่เมนู</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
        </div>

        {/* Pending Certification Requests */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            คำขอรับรองที่รอการพิจารณา
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-500 mr-3 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-indigo-800">
                    12 รายการ
                  </h3>
                  <p className="text-sm text-indigo-700 mt-1">
                    รายการที่รอการพิจารณา
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-emerald-500 mr-3 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-emerald-800">
                    85 รายการ
                  </h3>
                  <p className="text-sm text-emerald-700 mt-1">
                    ใบรับรองที่ออกแล้ว
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500 mr-3 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-red-800">
                    5 รายการ
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    ใบรับรองที่ถูกยกเลิก
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Certification Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            รายการขอรับรองล่าสุด
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    รหัสประจำการตรวจประเมิน
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    เกษตรกร
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    วันที่ตรวจประเมิน
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    สถานะ
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">จัดการ</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    1
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    นายวิชัย รักเกษตร
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    05/05/2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      รอการพิจารณา
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href="/committee/assessments/RGAP2024-0022"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      พิจารณา
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    2
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    นางพรทิพย์ สวัสดิรักษา
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    03/05/2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                      อนุมัติแล้ว
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href="/committee/certifications/issue/RGAP2024-0021"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      ออกใบรับรอง
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    3
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    นายสมศักดิ์ ใจกล้า
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    01/05/2024
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      ไม่ผ่านเกณฑ์
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href="/committee/assessments/RGAP2024-0019"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      ดูรายละเอียด
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Link
              href="/committee/assessments"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              ดูรายการทั้งหมด
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </CommitteeLayout>
  );
}
