"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaCheck, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

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
interface InspectionSummary {
  inspectionId: number;
  inspectionNo: number;
  inspectionDateAndTime: string;
  inspectionStatus: string;
  inspectionResult: string;
  inspectionTypeId: number;
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
  items?: InspectionItemSummary[];
}

interface InspectionItemSummary {
  inspectionItemId: number;
  inspectionItemNo: number;
  inspectionItemResult: string;
  inspectionItemMaster?: {
    itemNo: number;
    itemName: string;
  };
  requirements?: Requirement[];
  requirementsSummary?: {
    total: number;
    passed: number;
    failed: number;
    mainRequirementsFailed: number;
  };
}

export default function AuditorInspectionSummaryPage() {
  const router = useRouter();
  const params = useParams();
  const [inspection, setInspection] = useState<InspectionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingResult, setSavingResult] = useState(false);
  const [selectedResult, setSelectedResult] = useState<string>("");
  const [comments, setComments] = useState<string>("");

  // Navigation state variables
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
    const inspectionId = params.id;
    if (!inspectionId) return;

    const fetchInspectionSummary = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch inspection data - use the same approach as in AuditorInspectionPage
        const response = await fetch(`/api/v1/inspections/${inspectionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch inspection data");
        }

        const inspectionData = await response.json();
        console.log("Initial inspection data:", inspectionData);

        // Check if inspection type is missing but ID is present
        if (
          inspectionData.inspectionTypeId &&
          (!inspectionData.inspectionType ||
            !inspectionData.inspectionType.typeName)
        ) {
          // Fetch all inspection types
          const typesResponse = await fetch(`/api/v1/inspections/types`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (typesResponse.ok) {
            const typesData = await typesResponse.json();
            // Find the matching inspection type
            const matchingType = typesData.find(
              (type: any) =>
                type.inspectionTypeId === inspectionData.inspectionTypeId
            );

            // Add the inspection type to the inspection data
            if (matchingType) {
              inspectionData.inspectionType = {
                typeName: matchingType.typeName,
              };
            }
          }
        }

        console.log("Enhanced inspection data:", inspectionData);
        setInspection(inspectionData);

        // Fetch inspection items separately
        const itemsResponse = await fetch(
          `/api/v1/inspection-items?inspectionId=${inspectionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (itemsResponse.ok) {
          // Read the response body ONLY ONCE
          const itemsData = await itemsResponse.json();
          console.log("Items data:", itemsData);

          // Update with items data
          setInspection((prevData) => {
            if (!prevData) return prevData;
            return {
              ...prevData,
              items: itemsData,
            };
          });

          // Use the same itemsData here instead of reading the response again
          const shouldPass = !itemsData?.some(
            (item: InspectionItemSummary) =>
              item.inspectionItemResult === "ไม่ผ่าน"
          );
          setSelectedResult(shouldPass ? "PASS" : "FAIL");
        } else {
          console.error("Failed to fetch inspection items");
        }

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
            console.log("Farm data:", farmData);

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

            // Update with farm data
            setInspection((prevData) => {
              if (!prevData) return prevData;
              return {
                ...prevData,
                rubberFarm: farmData,
              };
            });
          }
        }
      } catch (error) {
        console.error("Error fetching inspection summary:", error);
        toast.error("ไม่สามารถดึงข้อมูลการตรวจประเมินได้");
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

    fetchInspectionSummary();
    fetchAuditorData();

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [params.id]);

  useEffect(() => {
    if (!inspection?.items) return;

    // คำนวณจำนวนข้อกำหนดหลักและผลการประเมิน
    const mainRequirements = inspection.items.flatMap(
      (item) =>
        item.requirements?.filter(
          (req) => req.requirementMaster?.requirementLevel === "ข้อกำหนดหลัก"
        ) || []
    );

    const mainRequirementsTotal = mainRequirements.length;
    const mainRequirementsPassed = mainRequirements.filter(
      (req) => req.evaluationResult === "ใช่"
    ).length;
    const mainRequirementsFailed =
      mainRequirementsTotal - mainRequirementsPassed;

    // คำนวณจำนวนข้อกำหนดรองและผลการประเมิน
    const secondaryRequirements = inspection.items.flatMap(
      (item) =>
        item.requirements?.filter(
          (req) => req.requirementMaster?.requirementLevel === "ข้อกำหนดรอง"
        ) || []
    );

    const secondaryRequirementsTotal = secondaryRequirements.length;
    const secondaryRequirementsPassed = secondaryRequirements.filter(
      (req) => req.evaluationResult === "ใช่"
    ).length;

    // คำนวณเปอร์เซ็นต์ข้อกำหนดรอง
    const secondaryCompliancePercentage =
      secondaryRequirementsTotal > 0
        ? Math.round(
            (secondaryRequirementsPassed / secondaryRequirementsTotal) * 100
          )
        : 0;

    // กำหนดเกณฑ์การผ่าน
    const isMainRequirementsPassed = mainRequirementsFailed === 0;
    const isSecondaryRequirementsPassed = secondaryCompliancePercentage >= 60;
    const isPassed = isMainRequirementsPassed && isSecondaryRequirementsPassed;

    // Auto-set the result state based on calculation
    setSelectedResult(isPassed ? "ผ่าน" : "ไม่ผ่าน");
  }, [inspection?.items]);

  const submitFinalResult = async () => {
    if (!inspection) return;

    try {
      setSavingResult(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/v1/inspections/${inspection.inspectionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            inspectionResult: selectedResult,
            summaryComments: comments,
          }),
        }
      );

      if (response.ok) {
        toast.success("บันทึกผลการประเมินเรียบร้อยแล้ว");
        router.push("/auditor/reports");
      } else {
        toast.error("ไม่สามารถบันทึกผลการประเมินได้");
      }
    } catch (error) {
      console.error("Error submitting final result:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกผลการประเมิน");
    } finally {
      setSavingResult(false);
    }
  };

  const calculateOverallStatus = () => {
    if (!inspection?.items) return "กำลังประมวลผล";

    const hasFailedItems = inspection.items.some(
      (item) => item.inspectionItemResult === "ไม่ผ่าน"
    );

    return hasFailedItems ? "ไม่ผ่าน" : "ผ่าน";
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
      <div className="flex justify-center items-center min-h-screen bg-[#EBFFF3]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
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
                const isActive =
                  item.href === "/auditor/reports" && params.id !== undefined;
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
              กรุณาตรวจสอบข้อมูลและสรุปผลการประเมินสวนยางพารา
            </p>
          </div>

          {inspection && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold">ข้อมูลทั่วไป</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">
                      เลขที่การตรวจประเมิน
                    </p>
                    <p className="font-medium">{inspection.inspectionNo}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">วันที่ตรวจประเมิน</p>
                    <p className="font-medium">
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
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">ชื่อเกษตรกร</p>
                    <p className="font-medium">
                      {inspection.rubberFarm?.farmer
                        ? `${inspection.rubberFarm.farmer.namePrefix}${inspection.rubberFarm.farmer.firstName} ${inspection.rubberFarm.farmer.lastName}`
                        : "ไม่มีข้อมูล"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">สถานที่</p>
                    <p className="font-medium">
                      {[
                        inspection.rubberFarm?.villageName,
                        inspection.rubberFarm?.district,
                        inspection.rubberFarm?.province,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">
                      ประเภทการตรวจประเมิน
                    </p>
                    <p className="font-medium">
                      {inspection.inspectionType?.typeName || "ไม่มีข้อมูล"}
                    </p>
                  </div>
                </div>
              </div>
              {/* ส่วนตารางผลการตรวจประเมินรายหัวข้อ */}
              <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold mb-4">
                  ผลการตรวจประเมินรายหัวข้อ
                </h2>

                {/* แสดงบนจอขนาดใหญ่ */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          ลำดับ
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          รายการตรวจประเมิน
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          ผลการประเมิน
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          รายละเอียด
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inspection.items
                        ?.slice()
                        .sort((a, b) => a.inspectionItemNo - b.inspectionItemNo)
                        .map((item) => (
                          <tr
                            key={item.inspectionItemId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.inspectionItemNo}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.inspectionItemMaster?.itemName ||
                                `รายการที่ ${item.inspectionItemNo}`}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.inspectionItemResult === "ผ่าน"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.inspectionItemResult === "ผ่าน" ? (
                                  <FaCheck className="mr-1" />
                                ) : (
                                  <FaTimes className="mr-1" />
                                )}
                                {item.inspectionItemResult}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <button
                                className="text-indigo-600 hover:text-indigo-900 text-sm"
                                onClick={() =>
                                  router.push(
                                    `/auditor/inspection-detail/${inspection.inspectionId}/${item.inspectionItemId}`
                                  )
                                }
                              >
                                ดูรายละเอียด
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* แสดงรูปแบบการ์ดบนอุปกรณ์มือถือ */}
                <div className="md:hidden space-y-4">
                  {inspection.items
                    ?.slice()
                    .sort((a, b) => a.inspectionItemNo - b.inspectionItemNo)
                    .map((item) => (
                      <div
                        key={item.inspectionItemId}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">
                            ลำดับที่ {item.inspectionItemNo}
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.inspectionItemResult === "ผ่าน"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.inspectionItemResult === "ผ่าน" ? (
                              <FaCheck className="mr-1" />
                            ) : (
                              <FaTimes className="mr-1" />
                            )}
                            {item.inspectionItemResult}
                          </span>
                        </div>

                        <div className="text-sm text-gray-900 mb-3">
                          {item.inspectionItemMaster?.itemName ||
                            `รายการที่ ${item.inspectionItemNo}`}
                        </div>

                        <button
                          className="w-full py-2 px-4 border border-indigo-300 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() =>
                            router.push(
                              `/auditor/inspection-detail/${inspection.inspectionId}/${item.inspectionItemId}`
                            )
                          }
                        >
                          ดูรายละเอียด
                        </button>
                      </div>
                    ))}
                </div>
              </div>
              <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold mb-4 text-center">
                  สรุปผลการตรวจประเมิน
                </h2>

                <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
                  <h3 className="text-base font-semibold mb-4 text-center">
                    ผลการ{inspection.inspectionType?.typeName || "ไม่มีข้อมูล"}
                  </h3>

                  {(() => {
                    // คำนวณจำนวนข้อกำหนดหลักและผลการประเมิน
                    const mainRequirements =
                      inspection.items?.flatMap(
                        (item) =>
                          item.requirements?.filter(
                            (req) =>
                              req.requirementMaster?.requirementLevel ===
                              "ข้อกำหนดหลัก"
                          ) || []
                      ) || [];

                    const mainRequirementsTotal = mainRequirements.length;
                    const mainRequirementsPassed = mainRequirements.filter(
                      (req) => req.evaluationResult === "ใช่"
                    ).length;
                    const mainRequirementsFailed =
                      mainRequirementsTotal - mainRequirementsPassed;

                    // คำนวณจำนวนข้อกำหนดรองและผลการประเมิน
                    const secondaryRequirements =
                      inspection.items?.flatMap(
                        (item) =>
                          item.requirements?.filter(
                            (req) =>
                              req.requirementMaster?.requirementLevel ===
                              "ข้อกำหนดรอง"
                          ) || []
                      ) || [];

                    const secondaryRequirementsTotal =
                      secondaryRequirements.length;
                    const secondaryRequirementsPassed =
                      secondaryRequirements.filter(
                        (req) => req.evaluationResult === "ใช่"
                      ).length;
                    const secondaryRequirementsFailed =
                      secondaryRequirementsTotal - secondaryRequirementsPassed;

                    // คำนวณเปอร์เซ็นต์ข้อกำหนดรอง
                    const secondaryCompliancePercentage =
                      secondaryRequirementsTotal > 0
                        ? Math.round(
                            (secondaryRequirementsPassed /
                              secondaryRequirementsTotal) *
                              100
                          )
                        : 0;

                    // กำหนดเกณฑ์การผ่าน
                    const isMainRequirementsPassed =
                      mainRequirementsFailed === 0;
                    const isSecondaryRequirementsPassed =
                      secondaryCompliancePercentage >= 60;
                    const isPassed =
                      isMainRequirementsPassed && isSecondaryRequirementsPassed;

                    return (
                      <div className="space-y-4 text-sm">
                        <div className="mb-2">
                          <p className="mb-3">
                            ข้อกำหนดหลัก {mainRequirementsTotal} ข้อ (100%)
                          </p>
                          <p className="mb-3">
                            ข้อกำหนดรอง {secondaryRequirementsTotal} ข้อ ผ่าน{" "}
                            {secondaryRequirementsPassed} ข้อ ไม่ผ่าน{" "}
                            {secondaryRequirementsFailed} ข้อ (ต้องผ่านอย่างน้อย
                            7 ข้อ)
                          </p>
                          <p className="mb-3">
                            เกณฑ์ต้องผ่านข้อกำหนดรองไม่น้อยกว่า 60%
                          </p>
                        </div>

                        <div className="border-t border-b py-4">
                          <p className="font-semibold">
                            สูตร: สอดคล้องกับข้อกำหนดรอง =
                          </p>
                          <div className="flex flex-col items-center my-2">
                            <div className="border-b border-black text-center px-2">
                              จำนวนข้อกำหนดรองที่ผ่าน X 100
                            </div>
                            <div className="text-center px-2">
                              จำนวนข้อกำหนดรองทั้งหมด
                            </div>
                          </div>
                          <p className="font-semibold mt-2">
                            = {secondaryRequirementsPassed} x 100 /{" "}
                            {secondaryRequirementsTotal} ={" "}
                            {secondaryCompliancePercentage}%
                          </p>
                        </div>

                        <div className="flex justify-center space-x-12 mt-6">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5"
                              checked={isPassed}
                              disabled
                            />
                            <span>ผ่านการตรวจประเมิน</span>
                          </label>

                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5"
                              checked={!isPassed}
                              disabled
                            />
                            <span>ไม่ผ่านการตรวจประเมิน</span>
                          </label>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 text-center">
                          ผลการประเมินถูกกำหนดอัตโนมัติตามเกณฑ์การผ่านข้อกำหนดหลักและข้อกำหนดรอง
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-6">
                  {/* <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      ผลการประเมินขั้นสุดท้าย
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          className="form-radio h-5 w-5 text-green-600"
                          name="result"
                          value="PASS"
                          checked={selectedResult === "PASS"}
                          onChange={() => setSelectedResult("PASS")}
                        />
                        <span className="ml-2">ผ่านการประเมิน</span>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          className="form-radio h-5 w-5 text-red-600"
                          name="result"
                          value="FAIL"
                          checked={selectedResult === "FAIL"}
                          onChange={() => setSelectedResult("FAIL")}
                        />
                        <span className="ml-2">ไม่ผ่านการประเมิน</span>
                      </label>
                    </div>
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ความเห็นเพิ่มเติม
                    </label>
                    <textarea
                      className="form-textarea mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      rows={4}
                      placeholder="กรุณาใส่ความเห็นหรือข้อเสนอแนะเพิ่มเติม (ถ้ามี)"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-3 sm:mb-0 order-2 sm:order-1"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={submitFinalResult}
                  disabled={savingResult}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 order-1 sm:order-2"
                >
                  {savingResult ? "กำลังบันทึก..." : "บันทึกผลการประเมิน"}
                </button>
              </div>
            </div>
          )}
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
