"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Icons
import HomeIcon from "@/components/icons/HomeIcon";
import TextClipboardIcon from "@/components/icons/TextClipboardIcon";
import CalendarIcon from "@/components/icons/CalendarIcon";
import FileIcon from "@/components/icons/FileIcon";
import LandFrameIcon from "@/components/icons/LandFrameIcon";
import ChatBubbleIcon from "@/components/icons/ChatBubbleIcon";
import AuditorLayout from "@/components/layout/AuditorLayout";

interface Inspection {
  inspectionId: number;
  inspectionNo: string;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  auditorChiefId: number;
  rubberFarmId: number;
  rubberFarm?: {
    villageName: string;
    district: string;
    province: string;
    farmer?: {
      namePrefix: string;
      firstName: string;
      lastName: string;
    };
  };
}
interface InspectionSummary {
  pendingSchedule: number; // รอการนัดหมาย
  pendingInspection: number; // รอการตรวจประเมิน
  pendingResult: number; // รอสรุปผล
  completed: number; // ประเมินเสร็จสิ้น
  passed: number; // ผ่าน
  failed: number; // ไม่ผ่าน
}

export default function AuditorDashboardPage() {
  const { data: session, status } = useSession();
  const [auditor, setAuditor] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    isLoading: true,
    id: 0,
  });

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [inspectionSummary, setInspectionSummary] = useState<InspectionSummary>(
    {
      pendingSchedule: 0,
      pendingInspection: 0,
      pendingResult: 0,
      completed: 0,
      passed: 0,
      failed: 0,
    }
  );
  const [availableFarms, setAvailableFarms] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Navigation menu items
  const navItems = [
    {
      title: "หน้าหลัก",
      href: "/auditor/dashboard",
      icon: HomeIcon(),
    },
    {
      title: "ตรวจประเมินสวนยางพารา",
      href: "/auditor/inspections",
      icon: TextClipboardIcon(),
    },
    {
      title: "แจ้งกำหนดการวันที่ตรวจประเมิน",
      href: "/auditor/applications",
      icon: CalendarIcon(),
    },
    {
      title: "สรุปผลการตรวจประเมิน",
      href: "/auditor/reports",
      icon: FileIcon(),
    },
    {
      title: "บันทึกข้อมูลประจำสวนยาง",
      href: "/auditor/garden-data",
      icon: LandFrameIcon(),
    },
    {
      title: "บันทึกการให้คำปรึกษาและข้อบกพร่อง",
      href: "/auditor/consultations",
      icon: ChatBubbleIcon(),
    },
  ];

  const fetchInspectionData = async (auditorId: number) => {
    if (!auditorId) return;

    try {
      setLoading(true);

      // 1. ดึงรายการตรวจประเมินทั้งหมด
      const inspectionsResponse = await fetch("/api/v1/inspections");

      if (!inspectionsResponse.ok) {
        throw new Error("ไม่สามารถดึงรายการตรวจประเมินได้");
      }

      const allInspections = await inspectionsResponse.json();

      // 2. ดึงรายการ AuditorInspection ที่เกี่ยวข้องกับ Auditor คนนี้
      const auditorInspectionsResponse = await fetch(
        `/api/v1/auditor-inspections?auditorId=${auditorId}`
      );

      if (!auditorInspectionsResponse.ok) {
        throw new Error("ไม่สามารถดึงรายการตรวจประเมินที่มอบหมายได้");
      }

      const auditorInspections = await auditorInspectionsResponse.json();

      // ดึงเฉพาะ inspectionId ที่มอบหมายให้เป็นผู้ตรวจประเมินในทีม
      const teamInspectionIds = auditorInspections.map(
        (ai: { inspectionId: number }) => ai.inspectionId
      );

      // 3. กรองรายการตรวจประเมินที่เกี่ยวข้องกับ Auditor คนนี้
      // ทั้งกรณีเป็นหัวหน้าผู้ตรวจ (auditorChiefId) และเป็นผู้ตรวจในทีม (AuditorInspection)
      const relevantInspections = allInspections.filter(
        (inspection: Inspection) =>
          inspection.auditorChiefId === auditorId || // เป็นหัวหน้าผู้ตรวจ
          teamInspectionIds.includes(inspection.inspectionId) // เป็นผู้ตรวจในทีม
      );

      // เรียกใช้ฟังก์ชันดึงข้อมูลเพิ่มเติมและประมวลผล
      await processInspectionData(relevantInspections);
    } catch (error) {
      console.error("Error fetching inspection data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processInspectionData = async (inspections: Inspection[]) => {
    // 1. ดึงข้อมูลเพิ่มเติมและทำให้ข้อมูลสมบูรณ์
    const enhancedInspections = await Promise.all(
      inspections.map(async (inspection) => {
        if (inspection.rubberFarmId && !inspection.rubberFarm) {
          try {
            const farmResponse = await fetch(
              `/api/v1/rubber-farms/${inspection.rubberFarmId}`
            );

            if (farmResponse.ok) {
              const farmData = await farmResponse.json();

              // ถ้ามี farmerId แต่ไม่มีข้อมูล farmer ให้ดึงข้อมูล farmer
              if (farmData.farmerId && !farmData.farmer) {
                const farmerResponse = await fetch(
                  `/api/v1/farmers/${farmData.farmerId}`
                );

                if (farmerResponse.ok) {
                  farmData.farmer = await farmerResponse.json();
                }
              }

              inspection.rubberFarm = farmData;
            }
          } catch (error) {
            console.error("Error fetching farm data:", error);
          }
        }
        return inspection;
      })
    );

    setInspections(enhancedInspections);

    // 2. สร้างสรุปสถานะงาน
    const summary = {
      pendingSchedule: 0, // รอการนัดหมาย
      pendingInspection: 0, // รอการตรวจประเมิน
      pendingResult: 0, // รอสรุปผล
      completed: 0, // ประเมินเสร็จสิ้น
      passed: 0, // ผ่าน
      failed: 0, // ไม่ผ่าน
    };

    enhancedInspections.forEach((inspection) => {
      if (inspection.inspectionStatus === "รอการนัดหมาย") {
        summary.pendingSchedule++;
      } else if (inspection.inspectionStatus === "รอการตรวจประเมิน") {
        summary.pendingInspection++;
      } else if (
        inspection.inspectionStatus === "ตรวจประเมินแล้ว" &&
        inspection.inspectionResult === "รอผลการตรวจประเมิน"
      ) {
        summary.pendingResult++;
      } else if (
        inspection.inspectionStatus === "ตรวจประเมินแล้ว" &&
        ["ผ่าน", "ไม่ผ่าน"].includes(inspection.inspectionResult)
      ) {
        summary.completed++;
        if (inspection.inspectionResult === "ผ่าน") {
          summary.passed++;
        } else if (inspection.inspectionResult === "ไม่ผ่าน") {
          summary.failed++;
        }
      }
    });

    setInspectionSummary((prev) => ({
      ...summary,
      pendingSchedule: summary.pendingSchedule + availableFarms,
    }));

    // 3. จัดเรียงการตรวจประเมินล่าสุด (เรียงตามวันที่จากมากไปน้อย)
    const sorted = [...enhancedInspections].sort(
      (a, b) =>
        new Date(b.inspectionDateAndTime).getTime() -
        new Date(a.inspectionDateAndTime).getTime()
    );

    // เลือก 3 รายการล่าสุดที่มีสถานะ "ตรวจประเมินแล้ว"
    const recent = sorted
      .filter((insp) => insp.inspectionStatus === "ตรวจประเมินแล้ว")
      .slice(0, 3);

    setRecentInspections(recent);
  };

  const fetchAvailableFarms = async (auditorId: number) => {
    try {
      const response = await fetch("/api/v1/auditors/available-farms");

      if (response.ok) {
        const result = await response.json();
        // จัดการกับ response ที่อาจมีรูปแบบแตกต่างกัน
        const availableFarmsData = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

        setAvailableFarms(availableFarmsData.length);

        // อัปเดตค่า summary โดยเพิ่มจำนวนสวนยางที่รอนัดหมาย
        setInspectionSummary((prev) => ({
          ...prev,
          pendingSchedule: prev.pendingSchedule + availableFarmsData.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching available farms:", error);
    }
  };

  useEffect(() => {
    // ดึงข้อมูลจาก NextAuth session
    if (status === "authenticated" && session?.user) {
      const auditorId = session.user.roleData?.auditorId;
      if (auditorId) {
        setAuditor({
          namePrefix: session.user.roleData?.namePrefix || "",
          firstName: session.user.roleData?.firstName || "",
          lastName: session.user.roleData?.lastName || "",
          isLoading: false,
          id: auditorId,
        });

        fetchInspectionData(auditorId);
        fetchAvailableFarms(auditorId);
      }
    } else if (status === "loading") {
      setAuditor((prev) => ({ ...prev, isLoading: true }));
    }
  }, [status, session]); // eslint-disable-line react-hooks/exhaustive-deps

  const LoadingIndicator = () => (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <AuditorLayout>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          หน้าหลักผู้ตรวจประเมิน
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          ยินดีต้อนรับสู่ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
        </p>
      </div>

      {/* Action Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {navItems
          .filter((item) => item.title !== "หน้าหลัก")
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
                        ? "bg-blue-100 text-blue-600"
                        : index === 1
                        ? "bg-green-100 text-green-600"
                        : index === 2
                        ? "bg-purple-100 text-purple-600"
                        : index === 3
                        ? "bg-amber-100 text-amber-600"
                        : "bg-indigo-100 text-indigo-600"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 flex-grow">
                    {index === 0
                      ? "ดำเนินการตรวจประเมินแหล่งผลิตยางพาราตามมาตรฐานจีเอพี"
                      : index === 1
                      ? "กำหนดและแจ้งวันตรวจประเมินแหล่งผลิตแก่เกษตรกร"
                      : index === 2
                      ? "สรุปและบันทึกผลการตรวจประเมินแหล่งผลิตยางพารา"
                      : index === 3
                      ? "จัดเก็บข้อมูลสำคัญของสวนยางพาราที่ได้รับการตรวจประเมิน"
                      : "บันทึกรายละเอียดคำแนะนำและข้อบกพร่องที่พบระหว่างการตรวจ"}
                  </p>
                  <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
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

      {/* Status Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          สรุปสถานะงานตรวจประเมิน
        </h2>
        {loading ? (
          <LoadingIndicator />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-amber-500 mr-3 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-amber-800">
                    {availableFarms} รายการ
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">รอการนัดหมาย</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-amber-200">
                <Link
                  href="/auditor/applications"
                  className="text-xs text-amber-600 hover:text-amber-800 flex items-center mt-1"
                >
                  จัดการนัดหมาย
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500 mr-3 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75a2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25z"
                  />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-blue-800">
                    {inspectionSummary.pendingInspection} รายการ
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">รอการตรวจประเมิน</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200">
                <Link
                  href="/auditor/inspections"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                >
                  ดำเนินการตรวจ
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-yellow-500 mr-3 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-base font-medium text-yellow-800">
                    {inspectionSummary.pendingResult} รายการ
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">รอสรุปผล</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-yellow-200">
                <Link
                  href="/auditor/reports"
                  className="text-xs text-yellow-600 hover:text-yellow-800 flex items-center"
                >
                  จัดการรายงาน
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500 mr-3 mt-0.5"
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
                  <h3 className="text-base font-medium text-green-800">
                    {inspectionSummary.completed} รายการ
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    ประเมินเสร็จสิ้น
                  </p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-green-200">
                <div className="flex justify-between">
                  <span className="text-xs text-green-600">
                    ผ่าน: {inspectionSummary.passed}
                  </span>
                  <span className="text-xs text-red-600">
                    ไม่ผ่าน: {inspectionSummary.failed}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            การตรวจประเมินล่าสุด
          </h2>
          <Link
            href="/auditor/reports"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            ดูทั้งหมด
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </Link>
        </div>

        <div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ) : recentInspections.length > 0 ? (
            <>
              {/* มุมมองแบบการ์ดสำหรับมือถือ */}
              <div className="md:hidden space-y-4">
                {recentInspections.map((inspection, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {inspection.inspectionNo}
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                          {inspection.rubberFarm?.farmer
                            ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`
                            : "ไม่มีข้อมูล"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          inspection.inspectionResult === "รอผลการตรวจประเมิน"
                            ? "bg-yellow-100 text-yellow-800"
                            : inspection.inspectionResult === "ผ่าน"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {inspection.inspectionResult === "รอผลการตรวจประเมิน"
                          ? "รอสรุปผล"
                          : inspection.inspectionResult}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 mt-2">
                      วันที่:{" "}
                      {new Date(
                        inspection.inspectionDateAndTime
                      ).toLocaleDateString("th-TH")}
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Link
                        href={`/auditor/inspection-summary/${inspection.inspectionId}`}
                        className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        {inspection.inspectionResult === "รอผลการตรวจประเมิน"
                          ? "สรุปผล"
                          : "ดูรายละเอียด"}
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          ></path>
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* มุมมองแบบตารางสำหรับหน้าจอขนาดกลางขึ้นไป */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เลขที่
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        เกษตรกร
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentInspections.map((inspection, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {inspection.inspectionNo}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {inspection.rubberFarm?.farmer
                            ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`
                            : "ไม่มีข้อมูล"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            inspection.inspectionDateAndTime
                          ).toLocaleDateString("th-TH")}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              inspection.inspectionResult ===
                              "รอผลการตรวจประเมิน"
                                ? "bg-yellow-100 text-yellow-800"
                                : inspection.inspectionResult === "ผ่าน"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {inspection.inspectionResult ===
                            "รอผลการตรวจประเมิน"
                              ? "รอสรุปผล"
                              : inspection.inspectionResult}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/auditor/inspection-summary/${inspection.inspectionId}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {inspection.inspectionResult ===
                            "รอผลการตรวจประเมิน"
                              ? "สรุปผล"
                              : "ดูรายละเอียด"}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              ไม่มีการตรวจประเมินล่าสุด
            </div>
          )}
        </div>
      </div>
    </AuditorLayout>
  );
}
