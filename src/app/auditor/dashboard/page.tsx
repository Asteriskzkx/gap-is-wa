"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Icons
import {
  CalendarIcon,
  ChatBubbleIcon,
  CheckCircleIcon,
  FileIcon,
  HomeIcon,
  LandFrameIcon,
  TextClipboardIcon,
} from "@/components/icons";

// Layout
import AuditorLayout from "@/components/layout/AuditorLayout";

// Components
import {
  AuditorActionCard,
  LoadingIndicator,
  StatusCard,
} from "@/components/auditor";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";

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

// Helper functions for table rendering
const renderFarmerName = (rowData: Inspection) => {
  const farmerName = rowData.rubberFarm?.farmer
    ? `${rowData.rubberFarm.farmer.namePrefix}${rowData.rubberFarm.farmer.firstName} ${rowData.rubberFarm.farmer.lastName}`
    : "ไม่มีข้อมูล";
  return <span>{farmerName}</span>;
};

const renderInspectionDate = (rowData: Inspection) => (
  <span>
    {new Date(rowData.inspectionDateAndTime).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}
  </span>
);

const renderInspectionStatus = (rowData: Inspection) => {
  const getResultBadgeColor = (result: string): string => {
    if (result === "รอผลการตรวจประเมิน") {
      return "bg-yellow-100 text-yellow-800";
    }
    if (result === "ผ่าน") {
      return "bg-green-100 text-green-800";
    }
    return "bg-red-100 text-red-800";
  };

  const getResultText = (result: string): string => {
    return result === "รอผลการตรวจประเมิน" ? "รอสรุปผล" : result;
  };

  return (
    <div className="inline-flex justify-center w-full">
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getResultBadgeColor(
          rowData.inspectionResult
        )}`}
      >
        {getResultText(rowData.inspectionResult)}
      </span>
    </div>
  );
};

const renderActionLink = (rowData: Inspection) => {
  const getLinkText = (result: string): string => {
    return result === "รอผลการตรวจประเมิน" ? "สรุปผล" : "ดูรายละเอียด";
  };

  return (
    <Link
      href={`/auditor/inspection-summary/${rowData.inspectionId}`}
      className="text-indigo-600 hover:text-indigo-900 font-medium"
    >
      {getLinkText(rowData.inspectionResult)}
    </Link>
  );
};

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

  // These states are accessed via their setters only
  const _unusedStateCheck = Boolean(auditor) && Boolean(inspections);
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

  // Helper functions สำหรับกำหนด color และ description
  const getActionCardColorClass = (index: number): string => {
    if (index === 0) return "bg-blue-100 text-blue-600";
    if (index === 1) return "bg-green-100 text-green-600";
    if (index === 2) return "bg-purple-100 text-purple-600";
    if (index === 3) return "bg-amber-100 text-amber-600";
    return "bg-indigo-100 text-indigo-600";
  };

  const getActionCardDescription = (index: number): string => {
    if (index === 0)
      return "ดำเนินการตรวจประเมินแหล่งผลิตยางพาราตามมาตรฐานจีเอพี";
    if (index === 1) return "กำหนดและแจ้งวันตรวจประเมินแหล่งผลิตแก่เกษตรกร";
    if (index === 2) return "สรุปและบันทึกผลการตรวจประเมินแหล่งผลิตยางพารา";
    if (index === 3)
      return "จัดเก็บข้อมูลสำคัญของสวนยางพาราที่ได้รับการตรวจประเมิน";
    return "บันทึกรายละเอียดคำแนะนำและข้อบกพร่องที่พบระหว่างการตรวจ";
  };

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

      // ดึงรายการตรวจประเมินที่เกี่ยวข้องกับ Auditor คนนี้โดยตรง (filter ที่ server)
      // API จะ filter ทั้งกรณีเป็นหัวหน้าผู้ตรวจ (auditorChiefId) และเป็นผู้ตรวจในทีม (AuditorInspection)
      const inspectionsResponse = await fetch(
        `/api/v1/inspections?auditorId=${auditorId}&limit=1000&offset=0`
      );

      if (!inspectionsResponse.ok) {
        throw new Error("ไม่สามารถดึงรายการตรวจประเมินได้");
      }

      const data = await inspectionsResponse.json();
      const relevantInspections = data.results || [];

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

    for (const inspection of enhancedInspections) {
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
    }

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
      // Fetch with limit to get total count, we only need the count here
      const response = await fetch(
        "/api/v1/auditors/available-farms?limit=1&offset=0"
      );

      if (response.ok) {
        const result = await response.json();
        // Handle new paginated response format
        if (result.paginator) {
          setAvailableFarms(result.paginator.total);
        } else {
          // Fallback for old format
          let availableFarmsData = [];
          if (Array.isArray(result.data)) {
            availableFarmsData = result.data;
          } else if (Array.isArray(result)) {
            availableFarmsData = result;
          }
          setAvailableFarms(availableFarmsData.length);
        }

        // อัปเดตค่า summary โดยเพิ่มจำนวนสวนยางที่รอนัดหมาย
        setInspectionSummary((prev) => ({
          ...prev,
          pendingSchedule:
            prev.pendingSchedule + (result.paginator?.total || 0),
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

  return (
    <AuditorLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
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
              <AuditorActionCard
                key={`action-${item.href}`}
                title={item.title}
                description={getActionCardDescription(index)}
                href={item.href}
                icon={item.icon}
                colorClass={getActionCardColorClass(index)}
              />
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
              <StatusCard
                title="รอการนัดหมาย"
                count={availableFarms}
                icon={
                  <CalendarIcon className="h-6 w-6 text-amber-500 mr-3 mt-0.5" />
                }
                bgColor="bg-amber-50"
                borderColor="border-amber-100"
                textColor="text-amber-800"
                linkText="จัดการนัดหมาย"
                linkHref="/auditor/applications"
                linkTextColor="text-amber-600"
              />

              <StatusCard
                title="รอการตรวจประเมิน"
                count={inspectionSummary.pendingInspection}
                icon={
                  <TextClipboardIcon className="h-6 w-6 text-blue-500 mr-3 mt-0.5" />
                }
                bgColor="bg-blue-50"
                borderColor="border-blue-100"
                textColor="text-blue-800"
                linkText="ดำเนินการตรวจ"
                linkHref="/auditor/inspections"
                linkTextColor="text-blue-600"
              />

              <StatusCard
                title="รอสรุปผล"
                count={inspectionSummary.pendingResult}
                icon={
                  <FileIcon className="h-6 w-6 text-yellow-500 mr-3 mt-0.5" />
                }
                bgColor="bg-yellow-50"
                borderColor="border-yellow-100"
                textColor="text-yellow-800"
                linkText="จัดการรายงาน"
                linkHref="/auditor/reports"
                linkTextColor="text-yellow-600"
              />

              <StatusCard
                title="ประเมินเสร็จสิ้น"
                count={inspectionSummary.completed}
                icon={
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
                }
                bgColor="bg-green-50"
                borderColor="border-green-100"
                textColor="text-green-800"
                linkText=""
                linkHref="#"
                linkTextColor="text-green-600"
                additionalInfo={
                  <div className="flex justify-between">
                    <span className="text-xs text-green-600">
                      ผ่าน: {inspectionSummary.passed}
                    </span>
                    <span className="text-xs text-red-600">
                      ไม่ผ่าน: {inspectionSummary.failed}
                    </span>
                  </div>
                }
              />
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

          <PrimaryDataTable
            value={recentInspections}
            loading={loading}
            emptyMessage="ไม่มีการตรวจประเมินล่าสุด"
            dataKey="inspectionId"
            columns={[
              {
                field: "inspectionNo",
                header: "รหัสการตรวจ",
                headerAlign: "center",
                bodyAlign: "center",
              },
              {
                field: "farmerName",
                header: "เกษตรกร",
                headerAlign: "center",
                bodyAlign: "left",
                body: renderFarmerName,
              },
              {
                field: "inspectionDateAndTime",
                header: "วันที่",
                headerAlign: "center",
                bodyAlign: "center",
                body: renderInspectionDate,
              },
              {
                field: "inspectionResult",
                header: "สถานะ",
                headerAlign: "center",
                bodyAlign: "center",
                body: renderInspectionStatus,
                mobileAlign: "right",
                mobileHideLabel: false,
              },
              {
                field: "action",
                header: "จัดการ",
                headerAlign: "center",
                bodyAlign: "center",
                body: renderActionLink,
                mobileAlign: "right",
                mobileHideLabel: true,
              },
            ]}
          />
        </div>
      </div>
    </AuditorLayout>
  );
}
