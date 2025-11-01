"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaSearch,
  FaHistory,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

interface Inspection {
  inspectionId: number;
  inspectionNo: number;
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

export default function AuditorReportsPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("pending"); // pending, completed

  //state variables for navigation
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [auditor, setAuditor] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    isLoading: true,
  });

  // Navigation menu items
  const navItems = [
    {
      title: "หน้าหลัก",
      href: "/auditor/dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      title: "ตรวจประเมินสวนยางพารา",
      href: "/auditor/inspections",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75a2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
          />
        </svg>
      ),
    },
    {
      title: "แจ้งกำหนดการวันที่ตรวจประเมิน",
      href: "/auditor/applications",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
          />
        </svg>
      ),
    },
    {
      title: "สรุปผลการตรวจประเมิน",
      href: "/auditor/reports",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      ),
    },
    {
      title: "บันทึกข้อมูลประจำสวนยาง",
      href: "/auditor/garden-data",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V7.875c0-.621-.504-1.125-1.125-1.125H12a9.06 9.06 0 00-1.5.124"
          />
        </svg>
      ),
    },
    {
      title: "บันทึกการให้คำปรึกษาและข้อบกพร่อง",
      href: "/auditor/consultations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // 1. ดึงข้อมูล Auditor ที่กำลัง login
        const auditorResponse = await fetch("/api/v1/auditors/current", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!auditorResponse.ok) {
          throw new Error("ไม่สามารถดึงข้อมูล Auditor ได้");
        }

        const auditorData = await auditorResponse.json();
        const auditorId = auditorData.auditorId;

        // 2. ดึงรายการตรวจประเมินทั้งหมด
        const inspectionsResponse = await fetch("/api/v1/inspections", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!inspectionsResponse.ok) {
          throw new Error("ไม่สามารถดึงรายการตรวจประเมินได้");
        }

        const allInspections = await inspectionsResponse.json();

        // 3. ดึงรายการ AuditorInspection ที่เกี่ยวข้องกับ Auditor คนนี้
        const auditorInspectionsResponse = await fetch(
          `/api/v1/auditor-inspections?auditorId=${auditorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!auditorInspectionsResponse.ok) {
          throw new Error("ไม่สามารถดึงรายการตรวจประเมินที่มอบหมายได้");
        }

        const auditorInspections = await auditorInspectionsResponse.json();

        // ดึงเฉพาะ inspectionId ที่มอบหมายให้เป็นผู้ตรวจประเมินในทีม
        const teamInspectionIds = auditorInspections.map(
          (ai: { inspectionId: number }) => ai.inspectionId
        );

        // 4. กรองรายการตรวจประเมินที่เกี่ยวข้องกับ Auditor คนนี้
        // ทั้งกรณีเป็นหัวหน้าผู้ตรวจ (auditorChiefId) และเป็นผู้ตรวจในทีม (AuditorInspection)
        const assignedInspections = allInspections.filter(
          (inspection: Inspection) =>
            inspection.auditorChiefId === auditorId || // เป็นหัวหน้าผู้ตรวจ
            teamInspectionIds.includes(inspection.inspectionId) // เป็นผู้ตรวจในทีม
        );

        setInspections(assignedInspections);
      } catch (error) {
        console.error("Error fetching assigned inspections:", error);
        setInspections([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchAuditorData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/auditors/current", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const auditorData = await response.json();
          setAuditor({
            namePrefix: auditorData.namePrefix || "",
            firstName: auditorData.firstName || "",
            lastName: auditorData.lastName || "",
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching auditor data:", error);
        setAuditor({
          namePrefix: "",
          firstName: "ไม่ทราบชื่อ",
          lastName: "",
          isLoading: false,
        });
      }
    };

    // Check screen size
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarVisible(false);
        setSidebarCollapsed(true);
      } else {
        setSidebarVisible(true);
      }
    };

    fetchInspections();
    fetchAuditorData();

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredInspections = inspections.filter((inspection) => {
    // กรองตาม tab ที่เลือก
    if (currentTab === "pending") {
      if (
        inspection.inspectionStatus !== "ตรวจประเมินแล้ว" ||
        inspection.inspectionResult !== "รอผลการตรวจประเมิน"
      ) {
        return false;
      }
    } else if (currentTab === "completed") {
      if (inspection.inspectionResult === "รอผลการตรวจประเมิน") {
        return false;
      }
    }

    // กรองตามคำค้นหา
    const searchLower = searchTerm.toLowerCase();
    const inspectionNo =
      inspection.inspectionNo?.toString().toLowerCase() || "";
    const farmerName = inspection.rubberFarm?.farmer
      ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`.toLowerCase()
      : "";
    const location = [
      inspection.rubberFarm?.villageName || "",
      inspection.rubberFarm?.district || "",
      inspection.rubberFarm?.province || "",
    ]
      .join(" ")
      .toLowerCase();
    const date = new Date(inspection.inspectionDateAndTime)
      .toLocaleDateString("th-TH")
      .toLowerCase();

    return (
      inspectionNo.includes(searchLower) ||
      farmerName.includes(searchLower) ||
      location.includes(searchLower) ||
      date.includes(searchLower)
    );
  });

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleSidebarVisibility = () => {
    setSidebarVisible(!sidebarVisible);
    if (!sidebarVisible) {
      setDropdownOpen(false);
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      {/* Mobile Overlay */}
      {isMobile && sidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebarVisibility}
        ></div>
      )}

      {/* Sidebar */}
      {sidebarVisible && (
        <div
          className={`bg-white shadow-md transition-all duration-300 h-screen fixed z-30 ${
            sidebarCollapsed ? "w-14" : "w-64"
          } ${isMobile ? "left-0" : ""} flex flex-col`}
        >
          {/* Toggle button */}
          <div className="p-3 flex justify-end border-b border-gray-200">
            <button
              onClick={
                isMobile ? toggleSidebarVisibility : toggleSidebarCollapse
              }
              className="p-1 rounded-md hover:bg-gray-100"
            >
              {isMobile ? (
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
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
              {navItems.map((item, index) => {
                const isActive = item.href === "/auditor/reports";
                return (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${
                        sidebarCollapsed ? "justify-center px-3" : "px-4"
                      } py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors ${
                        isActive
                          ? "bg-green-50 border-l-4 border-green-500 text-green-700"
                          : ""
                      }`}
                      onClick={handleNavClick}
                    >
                      <div
                        className={
                          isActive ? "text-green-600" : "text-gray-500"
                        }
                      >
                        {item.icon}
                      </div>
                      {!sidebarCollapsed && (
                        <span className="ml-3 text-sm font-medium">
                          {item.title}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {auditor.firstName.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {auditor.namePrefix}
                    {auditor.firstName} {auditor.lastName}
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

      {/* Main Content */}
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <div className="flex items-center">
              {isMobile && (
                <button
                  onClick={toggleSidebarVisibility}
                  className="mr-2 p-1 rounded-md hover:bg-gray-100"
                >
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
                </button>
              )}
              <Link href="/auditor/dashboard">
                <Image
                  src="/logo_header.png"
                  alt="Rubber Authority of Thailand Logo"
                  width={180}
                  height={180}
                  className="mr-2 w-[120px] sm:w-[140px] md:w-[180px]"
                />
              </Link>
            </div>

            <div className="flex items-center">
              <div className="relative">
                <button
                  className="flex items-center space-x-3 focus:outline-none"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {auditor.isLoading ? (
                      <div className="animate-pulse h-5 w-24 bg-gray-200 rounded"></div>
                    ) : (
                      <>
                        {auditor.namePrefix}
                        {auditor.firstName} {auditor.lastName}
                      </>
                    )}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {!auditor.isLoading && auditor.firstName.charAt(0)}
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

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <Link
                      href="/auditor/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ข้อมูลโปรไฟล์
                    </Link>
                    <Link
                      href="/auditor/settings"
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

        {/* Main Content */}
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              สรุปผลการตรวจประเมิน
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              จัดการและสรุปผลการตรวจประเมินสวนยางพารา
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="relative rounded-md mb-4 sm:mb-0 sm:max-w-xs w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                    placeholder="ค้นหาการตรวจประเมิน..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex space-x-2 sm:space-x-4">
                  <button
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentTab === "pending"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setCurrentTab("pending")}
                  >
                    <FaHistory className="inline mr-1" />
                    รอสรุปผล
                  </button>
                  <button
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentTab === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setCurrentTab("completed")}
                  >
                    <FaCheckCircle className="inline mr-1" />
                    เสร็จสิ้น
                  </button>
                </div>
              </div>

              {/* Inspection List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900 mx-auto"></div>
                  <p className="mt-3 text-sm text-gray-500">
                    กำลังโหลดข้อมูล...
                  </p>
                </div>
              ) : (
                <>
                  {/* มุมมองแบบตาราง - แสดงบนจอขนาดใหญ่ */}
                  <div className="hidden md:block">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              เลขที่
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
                              สถานที่
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              วันที่ตรวจ
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              สถานะ
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              จัดการ
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredInspections.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-6 py-12 text-center"
                              >
                                <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">
                                  {currentTab === "pending"
                                    ? "ไม่พบรายการตรวจประเมินที่รอสรุปผล"
                                    : "ไม่พบรายการตรวจประเมินที่เสร็จสิ้น"}
                                </p>
                              </td>
                            </tr>
                          ) : (
                            filteredInspections.map((inspection) => (
                              <tr
                                key={inspection.inspectionId}
                                className="hover:bg-gray-50 cursor-pointer"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {inspection.inspectionNo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {inspection.rubberFarm?.farmer
                                    ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`
                                    : "ไม่มีข้อมูล"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {[
                                    inspection.rubberFarm?.villageName,
                                    inspection.rubberFarm?.district,
                                    inspection.rubberFarm?.province,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(
                                    inspection.inspectionDateAndTime
                                  ).toLocaleDateString("th-TH", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${
                      inspection.inspectionResult === "รอผลการตรวจประเมิน"
                        ? "bg-yellow-100 text-yellow-800"
                        : inspection.inspectionResult === "ผ่าน"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                                  >
                                    {inspection.inspectionResult ===
                                    "รอผลการตรวจประเมิน"
                                      ? "รอสรุปผล"
                                      : inspection.inspectionResult === "ผ่าน"
                                      ? "ผ่าน"
                                      : "ไม่ผ่าน"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() =>
                                      router.push(
                                        `/auditor/inspection-summary/${inspection.inspectionId}`
                                      )
                                    }
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    {inspection.inspectionResult ===
                                    "รอผลการตรวจประเมิน"
                                      ? "สรุปผล"
                                      : "ดูรายละเอียด"}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* มุมมองแบบการ์ด - แสดงบนอุปกรณ์มือถือ */}
                  <div className="md:hidden space-y-4">
                    {filteredInspections.length === 0 ? (
                      <div className="text-center py-12">
                        <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">
                          {currentTab === "pending"
                            ? "ไม่พบรายการตรวจประเมินที่รอสรุปผล"
                            : "ไม่พบรายการตรวจประเมินที่เสร็จสิ้น"}
                        </p>
                      </div>
                    ) : (
                      <>
                        {filteredInspections.map((inspection) => (
                          <div
                            key={inspection.inspectionId}
                            className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
                            onClick={() =>
                              router.push(
                                `/auditor/inspection-summary/${inspection.inspectionId}`
                              )
                            }
                          >
                            <div className="flex justify-between items-start">
                              <div className="text-sm font-medium text-gray-900">
                                เลขที่: {inspection.inspectionNo}
                              </div>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
              ${
                inspection.inspectionResult === "รอผลการตรวจประเมิน"
                  ? "bg-yellow-100 text-yellow-800"
                  : inspection.inspectionResult === "ผ่าน"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
                              >
                                {inspection.inspectionResult ===
                                "รอผลการตรวจประเมิน"
                                  ? "รอสรุปผล"
                                  : inspection.inspectionResult === "ผ่าน"
                                  ? "ผ่าน"
                                  : "ไม่ผ่าน"}
                              </span>
                            </div>

                            <div className="mt-3">
                              <p className="text-sm font-medium">
                                เกษตรกร:{" "}
                                <span className="font-normal text-gray-900">
                                  {inspection.rubberFarm?.farmer
                                    ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`
                                    : "ไม่มีข้อมูล"}
                                </span>
                              </p>

                              <p className="text-sm font-medium mt-1">
                                สถานที่:{" "}
                                <span className="font-normal text-gray-600">
                                  {[
                                    inspection.rubberFarm?.villageName,
                                    inspection.rubberFarm?.district,
                                    inspection.rubberFarm?.province,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                </span>
                              </p>

                              <p className="text-sm font-medium mt-1">
                                วันที่ตรวจ:{" "}
                                <span className="font-normal text-gray-600">
                                  {new Date(
                                    inspection.inspectionDateAndTime
                                  ).toLocaleDateString("th-TH", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </p>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                                {inspection.inspectionResult ===
                                "รอผลการตรวจประเมิน"
                                  ? "สรุปผล →"
                                  : "ดูรายละเอียด →"}
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="text-center text-xs text-gray-500 italic mt-2">
                          กดที่รายการเพื่อดูรายละเอียด
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white py-6 border-t mt-auto">
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
                  © {new Date().getFullYear()} การยางแห่งประเทศไทย.
                  สงวนลิขสิทธิ์.
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
    </div>
  );
}
