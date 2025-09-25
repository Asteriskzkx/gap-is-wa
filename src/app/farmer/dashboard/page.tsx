"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/Footer";
import { MenuIcon ,EditIcon, HomeIcon, PlusIcon, TextClipboardIcon, TrashIcon, ChevronRightIcon, DangerIcon, XIcon } from "@/components/icons";

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

export default function FarmerDashboardPage() {
  // โค้ดส่วน state และฟังก์ชัน functions เหมือนเดิม
  const router = useRouter();
  const [farmer, setFarmer] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    isLoading: true,
  });

  // State for sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(false);
  // State for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  // State to track screen size for responsive behavior
  const [isMobile, setIsMobile] = useState(false);
  // State for user dropdown menu
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  // Navigation menu items
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
    // Fetch farmer data from the farmers API
    const fetchFarmerData = async () => {
      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem("token");

        if (token) {
          // Make an API call to get farmer data
          const response = await fetch("/api/v1/farmers/current", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const farmerData = await response.json();
            setFarmer({
              namePrefix: farmerData.namePrefix || "",
              firstName: farmerData.firstName || "",
              lastName: farmerData.lastName || "",
              isLoading: false,
            });
            await fetchApplications(token, farmerData);
          } else {
            console.error("Failed to fetch farmer data");
            setFarmer({
              namePrefix: "นาย",
              firstName: "ไม่ทราบชื่อ",
              lastName: "",
              isLoading: false,
            });
          }
        } else {
          console.error("No token found");
          setFarmer({
            namePrefix: "นาย",
            firstName: "ไม่ทราบชื่อ",
            lastName: "",
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching farmer data:", error);
        setFarmer({
          namePrefix: "นาย",
          firstName: "ไม่ทราบชื่อ",
          lastName: "",
          isLoading: false,
        });
      }
    };

    const fetchApplications = async (token: string, farmerData: any) => {
      try {
        const allFarmsResponse = await fetch("/api/v1/rubber-farms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (allFarmsResponse.ok) {
          const allFarms = await allFarmsResponse.json();
          // Filter farms that belong to the current farmer
          const farms = allFarms.filter(
            (farm: any) => farm.farmerId === farmerData.farmerId
          );
          await processRubberFarms(farms, token);
        } else {
          setApplicationsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setApplicationsLoading(false);
      }
    };

    const processRubberFarms = async (farms: RubberFarm[], token: string) => {
      if (!farms || !token) {
        setApplicationsLoading(false);
        return;
      }

      const allApplicationItems: ApplicationItem[] = [];

      for (const farm of farms) {
        try {
          const inspectionsResponse = await fetch(
            `/api/v1/inspections?rubberFarmId=${farm.rubberFarmId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (inspectionsResponse.ok) {
            const inspections = await inspectionsResponse.json();

            if (inspections.length > 0) {
              // Sort inspections by date (newest first)
              const sortedInspections = inspections.sort(
                (a: Inspection, b: Inspection) =>
                  new Date(b.inspectionDateAndTime).getTime() -
                  new Date(a.inspectionDateAndTime).getTime()
              );

              // Add each inspection as a separate application item
              sortedInspections.forEach((inspection: Inspection) => {
                allApplicationItems.push({
                  rubberFarm: farm,
                  inspection: inspection,
                });
              });
            } else {
              // If no inspections, add just the farm
              allApplicationItems.push({ rubberFarm: farm });
            }
          } else {
            // If error fetching inspections, add just the farm
            allApplicationItems.push({ rubberFarm: farm });
          }
        } catch (error) {
          console.error(
            `Error fetching inspections for farm ${farm.rubberFarmId}:`,
            error
          );
          allApplicationItems.push({ rubberFarm: farm });
        }
      }

      // Sort all application items by createdAt date (newest first)
      const sortedApplications = allApplicationItems.sort(
        (a, b) =>
          new Date(b.rubberFarm.createdAt).getTime() -
          new Date(a.rubberFarm.createdAt).getTime()
      );

      // Take only the 5 most recent applications
      setApplications(sortedApplications.slice(0, 5));
      setApplicationsLoading(false);
    };

    fetchFarmerData();

    // Check if the screen is mobile size
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // On mobile, sidebar is hidden by default
      if (mobile) {
        setSidebarVisible(false);
        setSidebarCollapsed(true);
      } else {
        // On desktop, sidebar is always visible
        setSidebarVisible(true);
      }
    };

    // Set initial state
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Toggle sidebar collapsed state (for desktop)
  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Toggle sidebar visibility (for mobile)
  const toggleSidebarVisibility = () => {
    setSidebarVisible(!sidebarVisible);
    // When we show the sidebar on mobile, also close any open dropdown
    if (!sidebarVisible) {
      setDropdownOpen(false);
    }
  };

  // Handle navigation click on mobile
  const handleNavClick = () => {
    // On mobile, hide the sidebar after clicking a navigation item
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");
    // Redirect to login page
    router.push("/");
  };

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

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      {/* Mobile Overlay - only visible when sidebar is shown on mobile */}
      {isMobile && sidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebarVisibility}
        ></div>
      )}

      {/* Sidebar - shown/hidden based on state */}
      {sidebarVisible && (
        <div
          className={`bg-white shadow-md transition-all duration-300 h-screen fixed z-30 ${
            sidebarCollapsed ? "w-14" : "w-64"
          } ${isMobile ? "left-0" : ""} flex flex-col`}
        >
          {/* Toggle button at top */}
          <div className="p-3 flex justify-end border-b border-gray-200">
            <button
              onClick={
                isMobile ? toggleSidebarVisibility : toggleSidebarCollapse
              }
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label={
                isMobile
                  ? "Close sidebar"
                  : sidebarCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              {isMobile ? (
                <XIcon className="h-6 w-6 text-gray-500" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4">
            <ul className="space-y-6">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className={`flex items-center ${
                      sidebarCollapsed ? "justify-center px-3" : "px-4"
                    } py-2 text-gray-700 hover:text-gray-900`}
                    onClick={handleNavClick}
                  >
                    <div className="text-gray-500">{item.icon}</div>
                    {!sidebarCollapsed && (
                      <span className="ml-3 text-sm font-medium">
                        {item.title}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User section at bottom (optional) */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                    {farmer.firstName.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {farmer.namePrefix}
                    {farmer.firstName} {farmer.lastName}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content - ใช้ flex และ flex-col เพื่อให้ footer อยู่ด้านล่างเสมอ */}
      <div
        className={`flex-1 flex flex-col ${
          sidebarVisible && !isMobile
            ? sidebarCollapsed
              ? "ml-14"
              : "ml-64"
            : "ml-0"
        } transition-all duration-300`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              {/* Mobile menu toggle button */}
              {isMobile && (
                <button
                  onClick={toggleSidebarVisibility}
                  className="mr-2 p-1 rounded-md hover:bg-gray-100"
                  aria-label="Toggle sidebar"
                >
                  <MenuIcon className="h-6 w-6 text-gray-500" />
                </button>
              )}
              <Image
                src="/logo_header.png"
                alt="Rubber Authority of Thailand Logo"
                width={180}
                height={180}
                className="mr-2"
              />
            </div>
            <div className="flex items-center">
              {/* User profile dropdown */}
              <div className="relative">
                <button
                  className="flex items-center space-x-3 focus:outline-none"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {/* ชื่อผู้ใช้ */}
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {farmer.isLoading ? (
                      <div className="animate-pulse h-5 w-24 bg-gray-200 rounded"></div>
                    ) : (
                      <>
                        {farmer.namePrefix}
                        {farmer.firstName} {farmer.lastName}
                      </>
                    )}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                    {!farmer.isLoading && farmer.firstName.charAt(0)}
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <Link
                      href="/farmer/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ข้อมูลโปรไฟล์
                    </Link>
                    <Link
                      href="/farmer/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ตั้งค่า
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - ใช้ flex-grow เพื่อขยายพื้นที่ให้เต็ม */}
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                            ? "bg-green-100 text-green-600"
                            : index === 1
                            ? "bg-orange-100 text-orange-600"
                            : index === 2
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 flex-grow">
                        {index === 0
                          ? "ยื่นคำขอรับรองแหล่งผลิตยางพาราตามมาตรฐาน GAP"
                          : index === 1
                          ? "ตรวจสอบสถานะคำขอและผลการรับรองแหล่งผลิต"
                          : index === 2
                          ? "ขอแก้ไขข้อมูลใบรับรองแหล่งผลิตที่ได้รับการอนุมัติแล้ว"
                          : "ขอยกเลิกใบรับรองแหล่งผลิตที่ไม่ต้องการใช้งาน"}
                      </p>
                      <div className="mt-4 flex items-center text-green-600 font-medium text-sm">
                        <span>เข้าสู่เมนู</span>
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
          </div>

          {/* Status Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
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

            {applicationsLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
                <DangerIcon className="h-6 w-6 text-yellow-500 mr-3 mt-0.5 flex-shrink-0"/>
                <div>
                  <h3 className="text-base font-medium text-yellow-800">
                    ยังไม่มีการยื่นขอรับรอง
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    คุณยังไม่ได้ยื่นขอรับรองมาตรฐาน GAP
                    กรุณายื่นคำขอรับรองเพื่อเริ่มกระบวนการรับรองแหล่งผลิต
                  </p>
                  <Link
                    href="/farmer/applications/new"
                    className="inline-flex items-center mt-3 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    ยื่นขอใบรับรองตอนนี้
                  </Link>
                </div>
              </div>
            ) : !isMobile ? (
              // Desktop view - Table layout
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          รหัสสวน
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          ที่ตั้ง
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          กำหนดตรวจประเมิน
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          สถานะ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.map((application) => {
                        const statusInfo = getStatusInfo(application);
                        const { rubberFarm, inspection } = application;

                        return (
                          <tr
                            key={
                              inspection
                                ? `${rubberFarm.rubberFarmId}-${inspection.inspectionId}`
                                : rubberFarm.rubberFarmId
                            }
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              RF
                              {rubberFarm.rubberFarmId
                                .toString()
                                .padStart(5, "0")}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {rubberFarm.villageName}, หมู่ {rubberFarm.moo},{" "}
                              {rubberFarm.district}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {inspection && inspection.inspectionDateAndTime
                                ? formatThaiDate(
                                    inspection.inspectionDateAndTime
                                  )
                                : "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}
                              >
                                {statusInfo.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Mobile view - Card layout
              <div className="space-y-3">
                {applications.map((application) => {
                  const statusInfo = getStatusInfo(application);
                  const { rubberFarm, inspection } = application;

                  return (
                    <div
                      key={
                        inspection
                          ? `${rubberFarm.rubberFarmId}-${inspection.inspectionId}`
                          : rubberFarm.rubberFarmId
                      }
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">
                          RF
                          {rubberFarm.rubberFarmId.toString().padStart(5, "0")}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}
                        >
                          {statusInfo.text}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex items-start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mt-0.5 mr-1.5 text-gray-500 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>
                            {rubberFarm.villageName}, หมู่ {rubberFarm.moo},{" "}
                            {rubberFarm.district}, {rubberFarm.province}
                          </span>
                        </div>

                        {inspection && inspection.inspectionDateAndTime && (
                          <div className="flex items-start mt-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mt-0.5 mr-1.5 text-gray-500 flex-shrink-0"
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
                            <span>
                              กำหนดตรวจประเมิน:{" "}
                              {formatThaiDate(inspection.inspectionDateAndTime)}
                            </span>
                          </div>
                        )}

                        {inspection && inspection.inspectionNo && (
                          <div className="flex items-start mt-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mt-0.5 mr-1.5 text-gray-500 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span>เลขที่: {inspection.inspectionNo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* News & Announcements */}
          {/* <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ข่าวสารและประกาศ
            </h2>
            <button className="mt-4 text-sm font-medium text-green-600 hover:text-green-700 flex items-center">
              ดูข่าวสารทั้งหมด
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
            </button>
          </div> */}
        </main>

        {/* Footer - เพิ่ม mt-auto เพื่อให้อยู่ด้านล่างสุดเสมอ */}
        <Footer />
      </div>
    </div>
  );
}
