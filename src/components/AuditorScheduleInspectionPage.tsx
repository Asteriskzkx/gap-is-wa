"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RubberFarm {
  id: number;
  location: string;
  farmerName: string;
  farmerEmail: string;
}

interface InspectionType {
  inspectionTypeId: number;
  typeName: string;
  description: string | null;
}

interface Auditor {
  id: number;
  name: string;
  email: string;
}

export default function AuditorScheduleInspectionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State for form data
  const [rubberFarms, setRubberFarms] = useState<RubberFarm[]>([]);
  const [inspectionTypes, setInspectionTypes] = useState<InspectionType[]>([]);
  const [auditors, setAuditors] = useState<Auditor[]>([]);

  const [selectedFarm, setSelectedFarm] = useState<RubberFarm | null>(null);
  const [selectedInspectionType, setSelectedInspectionType] =
    useState<InspectionType | null>(null);
  const [selectedAuditors, setSelectedAuditors] = useState<Auditor[]>([]);
  const [inspectionDate, setInspectionDate] = useState("");

  // State for search and pagination
  const [farmSearchTerm, setFarmSearchTerm] = useState("");
  const [auditorSearchTerm, setAuditorSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

    // Fetch rubber farms
    const fetchRubberFarms = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/auditors/available-farms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setRubberFarms(data);
        }
      } catch (error) {
        console.error("Error fetching rubber farms:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch inspection types
    const fetchInspectionTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/inspections/types", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setInspectionTypes(data);
        }
      } catch (error) {
        console.error("Error fetching inspection types:", error);
      }
    };

    // Fetch other auditors
    const fetchAuditors = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/auditors/other-auditors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setAuditors(data);
        }
      } catch (error) {
        console.error("Error fetching auditors:", error);
      }
    };

    fetchAuditorData();
    fetchRubberFarms();
    fetchInspectionTypes();
    fetchAuditors();

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
  }, []);

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

  // Filter and pagination for farms
  const filteredFarms = rubberFarms.filter(
    (farm) =>
      farm.location.toLowerCase().includes(farmSearchTerm.toLowerCase()) ||
      farm.farmerName.toLowerCase().includes(farmSearchTerm.toLowerCase()) ||
      farm.farmerEmail.toLowerCase().includes(farmSearchTerm.toLowerCase())
  );

  const indexOfLastFarm = currentPage * itemsPerPage;
  const indexOfFirstFarm = indexOfLastFarm - itemsPerPage;
  const currentFarms = filteredFarms.slice(indexOfFirstFarm, indexOfLastFarm);
  const totalPages = Math.ceil(filteredFarms.length / itemsPerPage);

  // Filter for auditors
  const filteredAuditors = auditors.filter(
    (auditor) =>
      auditor.name.toLowerCase().includes(auditorSearchTerm.toLowerCase()) ||
      auditor.email.toLowerCase().includes(auditorSearchTerm.toLowerCase())
  );

  const handleNextStep = () => {
    // Validation for each step
    if (currentStep === 1 && !selectedFarm) {
      setError("กรุณาเลือกสวนยางพารา");
      return;
    }
    if (currentStep === 2 && !selectedInspectionType) {
      setError("กรุณาเลือกประเภทการตรวจประเมิน");
      return;
    }
    if (currentStep === 4 && !inspectionDate) {
      setError("กรุณาเลือกวันที่ตรวจประเมิน");
      return;
    }

    setError("");
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/inspections/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rubberFarmId: selectedFarm!.id,
          inspectionTypeId: selectedInspectionType!.inspectionTypeId,
          inspectionDateAndTime: new Date(inspectionDate).toISOString(),
          additionalAuditorIds: selectedAuditors.map((a) => a.id),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("กำหนดการตรวจประเมินถูกบันทึกเรียบร้อยแล้ว");
        setTimeout(() => {
          router.push("/auditor/dashboard");
        }, 2000);
      } else {
        setError(data.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  const handleAuditorToggle = (auditor: Auditor) => {
    setSelectedAuditors((prev) => {
      const exists = prev.find((a) => a.id === auditor.id);
      if (exists) {
        return prev.filter((a) => a.id !== auditor.id);
      } else {
        return [...prev, auditor];
      }
    });
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Step indicator component
  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${
                  currentStep >= step
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }
              `}
            >
              {currentStep > step ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < 5 && (
              <div
                className={`w-full h-1 mx-2 ${
                  currentStep > step ? "bg-green-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-600">เลือกสวนยาง</span>
        <span className="text-xs text-gray-600">ประเภทการตรวจ</span>
        <span className="text-xs text-gray-600">คณะผู้ตรวจ</span>
        <span className="text-xs text-gray-600">วันที่ตรวจ</span>
        <span className="text-xs text-gray-600">ยืนยัน</span>
      </div>
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ขั้นตอนที่ 1: เลือกสวนยางพารา
            </h2>

            {/* Search bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="ค้นหาสวนยางพารา..."
                value={farmSearchTerm}
                onChange={(e) => setFarmSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[600px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เลือก
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รหัสสวน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      พื้นที่
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เกษตรกร
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      อีเมล
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : currentFarms.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-4 text-gray-500"
                      >
                        ไม่พบข้อมูลสวนยางพารา
                      </td>
                    </tr>
                  ) : (
                    currentFarms.map((farm) => (
                      <tr
                        key={farm.id}
                        className={`hover:bg-gray-50 ${
                          selectedFarm?.id === farm.id ? "bg-green-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="radio"
                            name="farm"
                            checked={selectedFarm?.id === farm.id}
                            onChange={() => setSelectedFarm(farm)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          RF{farm.id.toString().padStart(5, "0")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {farm.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {farm.farmerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {farm.farmerEmail}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  แสดง {indexOfFirstFarm + 1} ถึง{" "}
                  {Math.min(indexOfLastFarm, filteredFarms.length)} จาก{" "}
                  {filteredFarms.length} รายการ
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-md disabled:opacity-50"
                  >
                    ก่อนหน้า
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-md disabled:opacity-50"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ขั้นตอนที่ 2: เลือกประเภทการตรวจประเมิน
            </h2>

            <div className="grid gap-4">
              {inspectionTypes.map((type) => (
                <div
                  key={type.inspectionTypeId}
                  className={`
                    p-6 border-2 rounded-lg cursor-pointer transition-all
                    ${
                      selectedInspectionType?.inspectionTypeId ===
                      type.inspectionTypeId
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }
                  `}
                  onClick={() => setSelectedInspectionType(type)}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="inspectionType"
                      checked={
                        selectedInspectionType?.inspectionTypeId ===
                        type.inspectionTypeId
                      }
                      onChange={() => setSelectedInspectionType(type)}
                      className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {type.typeName}
                      </h3>
                      {type.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {type.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ขั้นตอนที่ 3: เลือกคณะผู้ตรวจประเมินเพิ่มเติม (ไม่บังคับ)
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              ท่านสามารถเลือกผู้ตรวจประเมินเพิ่มเติมเพื่อร่วมในการตรวจประเมินได้
            </p>

            {/* Search bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="ค้นหาผู้ตรวจประเมิน..."
                value={auditorSearchTerm}
                onChange={(e) => setAuditorSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[600px] divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เลือก
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รหัสผู้ตรวจ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อ-นามสกุล
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      อีเมล
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAuditors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-4 text-gray-500"
                      >
                        ไม่พบผู้ตรวจประเมินในระบบ
                      </td>
                    </tr>
                  ) : (
                    filteredAuditors.map((auditor) => (
                      <tr
                        key={auditor.id}
                        className={`hover:bg-gray-50 ${
                          selectedAuditors.find((a) => a.id === auditor.id)
                            ? "bg-green-50"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={
                              !!selectedAuditors.find(
                                (a) => a.id === auditor.id
                              )
                            }
                            onChange={() => handleAuditorToggle(auditor)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          AD{auditor.id.toString().padStart(5, "0")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {auditor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {auditor.email}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {selectedAuditors.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  เลือกผู้ตรวจประเมินแล้ว {selectedAuditors.length} คน
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ขั้นตอนที่ 4: เลือกวันและเวลาตรวจประเมิน
            </h2>

            <div className="max-w-md mx-auto">
              <label
                htmlFor="inspectionDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                วันที่และเวลาตรวจประเมิน
              </label>
              <input
                type="datetime-local"
                id="inspectionDate"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                min={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                required
              />

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <svg
                    className="inline-block w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  กรุณาเลือกวันที่และเวลาที่เหมาะสมสำหรับการตรวจประเมิน
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ขั้นตอนที่ 5: ยืนยันข้อมูลการตรวจประเมิน
            </h2>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              {/* Selected Farm */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  สวนยางพาราที่เลือก
                </h3>
                <div className="mt-2 p-4 bg-white rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    รหัสสวน: RF{selectedFarm?.id.toString().padStart(5, "0")}
                  </p>
                  <p className="text-sm text-gray-600">
                    พื้นที่: {selectedFarm?.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    เกษตรกร: {selectedFarm?.farmerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    อีเมล: {selectedFarm?.farmerEmail}
                  </p>
                </div>
              </div>

              {/* Inspection Type */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  ประเภทการตรวจประเมิน
                </h3>
                <div className="mt-2 p-4 bg-white rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedInspectionType?.typeName}
                  </p>
                  {selectedInspectionType?.description && (
                    <p className="text-sm text-gray-600">
                      {selectedInspectionType.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Auditors */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  คณะผู้ตรวจประเมิน
                </h3>
                <div className="mt-2 p-4 bg-white rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    หัวหน้าผู้ตรวจ: {auditor.namePrefix}
                    {auditor.firstName} {auditor.lastName}
                  </p>
                  {selectedAuditors.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        ผู้ตรวจร่วม:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedAuditors.map((a) => (
                          <li key={a.id}>
                            • {a.name} ({a.email})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">ไม่มีผู้ตรวจร่วม</p>
                  )}
                </div>
              </div>

              {/* Inspection Date */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  วันที่และเวลาตรวจประเมิน
                </h3>
                <div className="mt-2 p-4 bg-white rounded-md border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {inspectionDate
                      ? new Date(inspectionDate).toLocaleString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EBFFF3] w-full overflow-x-hidden">
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
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className={`flex items-center ${
                      sidebarCollapsed ? "justify-center px-3" : "px-4"
                    } py-2 text-gray-700 hover:text-gray-900 ${
                      item.href === "/auditor/applications"
                        ? "bg-green-50 border-l-4 border-green-500 text-green-700"
                        : ""
                    }`}
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
        } transition-all duration-300 w-full`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200 w-full">
          <div className="w-full max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
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
              <Image
                src="/logo_header.png"
                alt="Rubber Authority of Thailand Logo"
                width={180}
                height={180}
                className="mr-2"
              />
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

        {/* Main Content Area */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8 overflow-x-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              แจ้งกำหนดการวันที่ตรวจประเมิน
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              กำหนดวันและเวลาสำหรับการตรวจประเมินสวนยางพาราตามมาตรฐานจีเอพี
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator />

          {/* Content Card */}
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 w-full">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className={`
                 px-6 py-2 rounded-md font-medium
                 ${
                   currentStep === 1
                     ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                     : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                 }
               `}
              >
                ย้อนกลับ
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
                >
                  ถัดไป
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      กำลังบันทึก...
                    </span>
                  ) : (
                    "ยืนยันและบันทึก"
                  )}
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white py-6 border-t mt-auto w-full">
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
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
