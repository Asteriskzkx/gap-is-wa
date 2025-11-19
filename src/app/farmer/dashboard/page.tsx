"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Icons
import {
  ChevronRightIcon,
  EditIcon,
  HomeIcon,
  PlusIcon,
  TextClipboardIcon,
  TrashIcon,
} from "@/components/icons";

// Layout
import FarmerLayout from "@/components/layout/FarmerLayout";

// Components
import {
  ActionCard,
  ApplicationMobileCard,
  EmptyApplicationsState,
} from "@/components/farmer";

import { PrimaryCard } from "@/components/ui";
import PrimaryDataTable from "@/components/ui/PrimaryDataTable";

interface RubberFarm {
  rubberFarmId: number;
  villageName: string;
  moo: number;
  district: string;
  province: string;
  createdAt: string;
}

interface Inspection {
  inspectionId: number;
  inspectionNo: string;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  rubberFarmId: number;
}

interface ApplicationItem {
  rubberFarm: RubberFarm;
  inspection?: Inspection;
}

// Helper functions for table rendering
const formatThaiDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusInfo = (application: ApplicationItem) => {
  if (!application.inspection) {
    return {
      text: "รอกำหนดวันตรวจประเมิน",
      color: "bg-yellow-100 text-yellow-800",
    };
  }

  const inspection = application.inspection;
  const hasInspectionDate =
    inspection.inspectionDateAndTime &&
    new Date(inspection.inspectionDateAndTime) > new Date(0);
  const inspectionDateInFuture =
    hasInspectionDate &&
    new Date(inspection.inspectionDateAndTime) > new Date();

  const status = inspection.inspectionStatus;
  const result = inspection.inspectionResult;

  if (
    status === "รอการตรวจประเมิน" &&
    hasInspectionDate &&
    inspectionDateInFuture
  ) {
    return {
      text: "รอการตรวจประเมิน",
      color: "bg-blue-100 text-blue-800",
    };
  } else if (status === "ตรวจประเมินแล้ว") {
    if (result === "รอผลการตรวจประเมิน") {
      return {
        text: "ตรวจประเมินแล้ว รอสรุปผล",
        color: "bg-purple-100 text-purple-800",
      };
    } else if (result === "ผ่าน") {
      return {
        text: "ผ่านการรับรอง",
        color: "bg-green-100 text-green-800",
      };
    } else if (result === "ไม่ผ่าน") {
      return {
        text: "ไม่ผ่านการรับรอง",
        color: "bg-red-100 text-red-800",
      };
    }
  }

  return {
    text: status || "ไม่ทราบสถานะ",
    color: "bg-gray-100 text-gray-800",
  };
};

const renderFarmId = (rowData: ApplicationItem) =>
  `RF${rowData.rubberFarm.rubberFarmId.toString().padStart(5, "0")}`;

const renderLocation = (rowData: ApplicationItem) => (
  <div>
    <p>
      {rowData.rubberFarm.villageName} หมู่ {rowData.rubberFarm.moo}
    </p>
    <p className="text-sm text-gray-500">
      {rowData.rubberFarm.district}, {rowData.rubberFarm.province}
    </p>
  </div>
);

const renderInspectionDate = (rowData: ApplicationItem) =>
  formatThaiDate(rowData.inspection?.inspectionDateAndTime);

const renderStatus = (rowData: ApplicationItem) => {
  const statusInfo = getStatusInfo(rowData);
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}
    >
      {statusInfo.text}
    </span>
  );
};

export default function FarmerDashboardPage() {
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  // Helper function สำหรับกำหนด color class
  const getActionCardColorClass = (index: number): string => {
    if (index === 0) return "bg-green-100 text-green-600";
    if (index === 1) return "bg-orange-100 text-orange-600";
    if (index === 2) return "bg-blue-100 text-blue-600";
    return "bg-red-100 text-red-600";
  };

  // Helper function สำหรับกำหนด description
  const getActionCardDescription = (index: number): string => {
    if (index === 0) return "ยื่นคำขอรับรองแหล่งผลิตยางพาราตามมาตรฐานจีเอพี";
    if (index === 1) return "ตรวจสอบสถานะคำขอและผลการรับรองแหล่งผลิต";
    if (index === 2)
      return "ขอแก้ไขข้อมูลใบรับรองแหล่งผลิตที่ต้องการปรับปรุงข้อมูล";
    return "ขอยกเลิกใบรับรองแหล่งผลิตที่ไม่ประสงค์จะรับรองต่อ";
  };

  // Navigation menu items for action cards
  const navItems = [
    {
      title: "หน้าหลัก",
      href: "/farmer/dashboard",
      icon: <HomeIcon className="h-6 w-6" />,
    },
    {
      title: "ยื่นขอใบรับรองแหล่งผลิต",
      href: "/farmer/applications/new",
      icon: <PlusIcon className="h-6 w-6" />,
    },
    {
      title: "ติดตามสถานะการรับรอง",
      href: "/farmer/applications",
      icon: <TextClipboardIcon className="h-6 w-6" />,
    },
    {
      title: "ขอแก้ไขข้อมูลใบรับรองแหล่งผลิต",
      href: "/farmer/applications/edit",
      icon: <EditIcon className="h-6 w-6" />,
    },
    {
      title: "ขอยกเลิกใบรับรองแหล่งผลิต",
      href: "/farmer/applications/cancel",
      icon: <TrashIcon className="h-6 w-6" />,
    },
  ];

  useEffect(() => {
    // ใช้ข้อมูลจาก NextAuth session
    const fetchApplicationsData = async () => {
      try {
        if (status === "loading") {
          return; // รอให้ session โหลดเสร็จก่อน
        }

        if (status === "unauthenticated" || !session?.user) {
          setApplicationsLoading(false);
          return;
        }

        // ดึง farmerId จาก session
        const roleData = session.user.roleData;
        if (roleData?.farmerId) {
          await fetchApplications(roleData.farmerId);
        } else {
          console.error("No farmer data found in session");
          setApplicationsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching applications data:", error);
        setApplicationsLoading(false);
      }
    };

    const fetchApplications = async (farmerId: number) => {
      try {
        // ดึงรายการสวนยาง 5 อันล่าสุด พร้อมข้อมูล inspection
        // เพิ่ม priorityStatus=รอการตรวจประเมิน เพื่อให้แสดงสถานะนี้ก่อน
        const allFarmsResponse = await fetch(
          `/api/v1/rubber-farms?farmerId=${farmerId}&includeInspections=true&limit=5&offset=0&sortField=createdAt&sortOrder=desc&priorityStatus=รอการตรวจประเมิน`
        );

        if (allFarmsResponse.ok) {
          const result = await allFarmsResponse.json();

          // Handle paginated response
          const farms = result.results || result;

          // แปลงข้อมูลเป็น ApplicationItem format
          const applicationItems: ApplicationItem[] = farms.map(
            (farm: any) => ({
              rubberFarm: {
                rubberFarmId: farm.rubberFarmId,
                villageName: farm.villageName,
                moo: farm.moo,
                district: farm.district,
                province: farm.province,
                createdAt: farm.createdAt,
              },
              inspection: farm.inspection || undefined,
            })
          );

          setApplications(applicationItems);
        }

        setApplicationsLoading(false);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setApplicationsLoading(false);
      }
    };

    fetchApplicationsData();
  }, [session, status]);

  return (
    <FarmerLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">หน้าหลัก</h1>
          <p className="mt-1 text-sm text-gray-500">
            ยินดีต้อนรับสู่ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพาราตามมาตรฐานจีเอพี
          </p>
        </div>

        {/* Action Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navItems
            .filter((item) => item.title !== "หน้าหลัก")
            .map((item, index) => (
              <ActionCard
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
        <PrimaryCard className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              สถานะการรับรองล่าสุด
            </h2>
            <Link
              href="/farmer/applications"
              className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center"
            >
              ดูทั้งหมด
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {applicationsLoading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}

          {!applicationsLoading && applications.length === 0 && (
            <EmptyApplicationsState />
          )}

          {!applicationsLoading && applications.length > 0 && (
            <>
              {/* Desktop view - PrimaryDataTable */}
              <div className="hidden md:block">
                <PrimaryDataTable
                  value={applications}
                  loading={applicationsLoading}
                  emptyMessage="ไม่มีข้อมูลการยื่นขอรับรอง"
                  dataKey="rubberFarm.rubberFarmId"
                  columns={[
                    {
                      field: "rubberFarmId",
                      header: "รหัสสวน",
                      headerAlign: "center",
                      bodyAlign: "center",
                      body: renderFarmId,
                    },
                    {
                      field: "location",
                      header: "สถานที่",
                      headerAlign: "center",
                      bodyAlign: "left",
                      body: renderLocation,
                    },
                    {
                      field: "inspectionDate",
                      header: "กำหนดตรวจประเมิน",
                      headerAlign: "center",
                      bodyAlign: "center",
                      body: renderInspectionDate,
                    },
                    {
                      field: "status",
                      header: "สถานะ",
                      headerAlign: "center",
                      bodyAlign: "center",
                      body: renderStatus,
                    },
                  ]}
                />
              </div>

              {/* Mobile view - Card layout */}
              <div className="md:hidden space-y-3">
                {applications.map((application) => {
                  const statusInfo = getStatusInfo(application);
                  const { rubberFarm, inspection } = application;

                  return (
                    <ApplicationMobileCard
                      key={
                        inspection
                          ? `${rubberFarm.rubberFarmId}-${inspection.inspectionId}`
                          : rubberFarm.rubberFarmId
                      }
                      rubberFarm={rubberFarm}
                      inspection={inspection}
                      statusInfo={statusInfo}
                      formatThaiDate={formatThaiDate}
                    />
                  );
                })}
              </div>
            </>
          )}
        </PrimaryCard>
      </div>
    </FarmerLayout>
  );
}
