"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaCheck, FaTimes, FaArrowLeft } from "react-icons/fa";

// Icons
import HomeIcon from "@/components/icons/HomeIcon";
import TextClipboardIcon from "@/components/icons/TextClipboardIcon";
import CalendarIcon from "@/components/icons/CalendarIcon";
import FileIcon from "@/components/icons/FileIcon";
import LandFrameIcon from "@/components/icons/LandFrameIcon";
import ChatBubbleIcon from "@/components/icons/ChatBubbleIcon";
import Footer from "@/components/layout/Footer";

interface Inspection {
  inspectionId: number;
  inspectionNo: number;
  inspectionDateAndTime: string;
  inspectionTypeId: number;
  inspectionStatus: string;
  inspectionResult: string;
  auditorChiefId: number;
  rubberFarmId: number;
  inspectionType?: {
    typeName: string;
  };
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

interface InspectionItem {
  inspectionItemId: number;
  inspectionId: number;
  inspectionItemMasterId: number;
  inspectionItemNo: number;
  inspectionItemResult: string;
  otherConditions: any;
  inspectionItemMaster?: {
    itemNo: number;
    itemName: string;
  };
  requirements?: Requirement[];
}

interface Requirement {
  requirementId: number;
  requirementNo: number;
  evaluationResult: string;
  evaluationMethod: string;
  note: string;
  requirementMaster?: {
    requirementName: string;
    requirementLevel: string;
    requirementLevelNo: string;
  };
}

export default function AuditorInspectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [inspectionItem, setInspectionItem] = useState<InspectionItem | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // State for sidebar
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Auditor info
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

  useEffect(() => {
    // Get IDs from params
    if (params && params.id && params.itemId) {
      setInspectionId(params.id as string);
      setItemId(params.itemId as string);

      // Fetch data
      if (params.id && params.itemId) {
        fetchInspectionData(params.id as string, params.itemId as string);
      }
    }

    // Fetch auditor data
    const fetchAuditorData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch("/api/v1/auditors/current", {
            headers: { Authorization: `Bearer ${token}` },
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

    fetchAuditorData();

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

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [params]);

  const fetchInspectionData = async (inspectionId: string, itemId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch inspection data
      const inspectionResponse = await fetch(
        `/api/v1/inspections/${inspectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!inspectionResponse.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลการตรวจประเมินได้");
      }

      const inspectionData = await inspectionResponse.json();

      // Fetch inspection type if not included
      if (
        inspectionData.inspectionTypeId &&
        (!inspectionData.inspectionType ||
          !inspectionData.inspectionType.typeName)
      ) {
        const typesResponse = await fetch(`/api/v1/inspections/types`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (typesResponse.ok) {
          const typesData = await typesResponse.json();
          const matchingType = typesData.find(
            (type: any) =>
              type.inspectionTypeId === inspectionData.inspectionTypeId
          );

          if (matchingType) {
            inspectionData.inspectionType = {
              typeName: matchingType.typeName,
            };
          }
        }
      }

      setInspection(inspectionData);

      // Fetch rubber farm details if available
      if (inspectionData.rubberFarmId) {
        const farmResponse = await fetch(
          `/api/v1/rubber-farms/${inspectionData.rubberFarmId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (farmResponse.ok) {
          const farmData = await farmResponse.json();

          // Fetch farmer details if not included
          if (farmData && !farmData.farmer && farmData.farmerId) {
            const farmerResponse = await fetch(
              `/api/v1/farmers/${farmData.farmerId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (farmerResponse.ok) {
              const farmerData = await farmerResponse.json();
              farmData.farmer = farmerData;
            }
          }

          // Update inspection with farm data
          setInspection((prevData) => {
            if (!prevData) return prevData;
            return {
              ...prevData,
              rubberFarm: farmData,
            };
          });
        }
      }

      const itemsResponse = await fetch(
        `/api/v1/inspection-items?inspectionId=${inspectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!itemsResponse.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลรายการตรวจประเมินได้");
      }

      const itemsData = await itemsResponse.json();
      // หลังจากได้ทุกรายการแล้ว ค้นหารายการที่ต้องการแสดงผล
      const selectedItem = itemsData.find(
        (item: any) => item.inspectionItemId.toString() === itemId
      );

      if (!selectedItem) {
        throw new Error("ไม่พบรายการตรวจที่ต้องการ");
      }

      setInspectionItem(selectedItem);
    } catch (error) {
      console.error("Error fetching inspection data:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // Renders additional fields based on inspection item type
  const renderAdditionalFields = () => {
    if (!inspectionItem) return null;

    const itemName = inspectionItem?.inspectionItemMaster?.itemName || "";
    const otherConditions = inspectionItem?.otherConditions || {};

    switch (itemName) {
      case "น้ำ":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แหล่งน้ำที่ใช้ในแปลงปลูก
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                  {otherConditions.waterSource || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  น้ำที่ใช้ในกระบวนการหลังการเก็บเกี่ยว
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                  {otherConditions.postHarvestWaterSource || "-"}
                </div>
              </div>
            </div>
          </div>
        );

      case "พื้นที่ปลูก":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สภาพพื้นที่ปลูก
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                {otherConditions.topography === "อื่นๆ"
                  ? `อื่นๆ: ${otherConditions.topographyOther || ""}`
                  : otherConditions.topography || "-"}
              </div>
            </div>
          </div>
        );

      case "วัตถุอันตรายทางการเกษตร":
        return (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-800 mb-3">
              ข้อมูลเพิ่มเติม
            </h3>
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  id="no-hazardous-materials"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  checked={otherConditions.noHazardousMaterials === "true"}
                  disabled
                />
                <label
                  htmlFor="no-hazardous-materials"
                  className="ml-2 block text-sm text-gray-900"
                >
                  ไม่ได้ใช้วัตถุอันตรายทางการเกษตรในการผลิต
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Navigation functions
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-secondary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#EBFFF3]">
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
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                รายละเอียดการตรวจประเมิน
              </h1>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <FaArrowLeft className="mr-2" />
                กลับไปหน้าสรุปผล
              </button>
            </div>

            {inspection && (
              <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">
                      รหัสการตรวจประเมิน
                    </h2>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {inspection.inspectionNo}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">
                      วันที่นัดหมาย
                    </h2>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {new Date(
                        inspection.inspectionDateAndTime
                      ).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500">
                      ประเภทการตรวจ
                    </h2>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {inspection.inspectionType?.typeName || "-"}
                    </p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <h2 className="text-sm font-medium text-gray-500">
                      พื้นที่สวนยาง
                    </h2>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      {inspection.rubberFarm?.villageName || "-"},{" "}
                      {inspection.rubberFarm?.district || "-"},{" "}
                      {inspection.rubberFarm?.province || "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {inspectionItem && (
            <div className="bg-white rounded-lg shadow p-6">
              {/* หัวข้อรายการตรวจประเมิน */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  รายการตรวจที่ {inspectionItem.inspectionItemNo} :{" "}
                  {inspectionItem.inspectionItemMaster?.itemName || ""}
                </h2>

                <div className="mt-4">
                  <div
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium 
                    ${inspectionItem.inspectionItemResult === 'ผ่าน' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'}"
                  >
                    <span className="mr-1.5">
                      {inspectionItem.inspectionItemResult === "ผ่าน" ? (
                        <FaCheck className="inline-block" />
                      ) : (
                        <FaTimes className="inline-block" />
                      )}
                    </span>
                    ผลการประเมิน: {inspectionItem.inspectionItemResult}
                  </div>
                </div>
              </div>

              {/* Requirements section */}
              {inspectionItem.requirements &&
              inspectionItem.requirements.length > 0 ? (
                <div className="mb-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    ข้อกำหนด
                  </h3>

                  {inspectionItem.requirements
                    .sort((a, b) => a.requirementNo - b.requirementNo)
                    .map((requirement) => (
                      <div
                        key={requirement.requirementId}
                        className="p-4 border rounded-md bg-gray-50"
                      >
                        <div className="mb-2">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  requirement.requirementMaster
                                    ?.requirementLevel === "ข้อกำหนดหลัก"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {requirement.requirementMaster
                                  ?.requirementLevel || ""}
                                {requirement.requirementMaster
                                  ?.requirementLevelNo
                                  ? ` ${requirement.requirementMaster.requirementLevelNo}`
                                  : ""}
                              </span>
                            </div>
                            <h4 className="ml-2 text-md font-medium text-gray-900">
                              {requirement.requirementNo}.{" "}
                              {requirement.requirementMaster?.requirementName ||
                                ""}
                            </h4>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {/* ผลการตรวจประเมิน */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              ผลการตรวจประเมิน
                            </label>
                            <div
                              className={`w-full px-3 py-2 border rounded-md ${
                                requirement.evaluationResult === "ใช่"
                                  ? "bg-green-50 border-green-200 text-green-700"
                                  : requirement.evaluationResult === "ไม่ใช่"
                                  ? "bg-red-50 border-red-200 text-red-700"
                                  : requirement.evaluationResult === "NA"
                                  ? "bg-gray-100 border-gray-200 text-gray-700"
                                  : "bg-gray-100 border-gray-300 text-gray-700"
                              }`}
                            >
                              {requirement.evaluationResult || "ไม่มีข้อมูล"}
                            </div>
                          </div>

                          {/* วิธีการตรวจประเมิน */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              วิธีการตรวจประเมิน
                            </label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                              {requirement.evaluationMethod || "ไม่มีข้อมูล"}
                            </div>
                          </div>

                          {/* บันทึกเพิ่มเติม */}
                          {requirement.note && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                บันทึกเพิ่มเติม
                              </label>
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 min-h-[80px]">
                                {requirement.note || "-"}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  ไม่พบข้อกำหนดสำหรับรายการตรวจนี้
                </p>
              )}

              {/* Additional fields section */}
              {renderAdditionalFields()}

              {/* Navigation button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700"
                >
                  <FaArrowLeft className="inline-block mr-2" />
                  กลับไปหน้าสรุปผล
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
