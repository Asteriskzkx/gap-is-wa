"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/Footer";

// Icons
import HomeIcon from "@/components/icons/HomeIcon";
import TextClipboardIcon from "@/components/icons/TextClipboardIcon";
import CalendarIcon from "@/components/icons/CalendarIcon";
import FileIcon from "@/components/icons/FileIcon";
import LandFrameIcon from "@/components/icons/LandFrameIcon";
import ChatBubbleIcon from "@/components/icons/ChatBubbleIcon";

interface AuditorLayoutProps {
  children: React.ReactNode;
}

export default function AuditorLayout({ children }: AuditorLayoutProps) {
  const router = useRouter();
  const [auditor, setAuditor] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    isLoading: true,
    id: 0,
  });

  // State for sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(false);
  // State for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  // State to track screen size for responsive behavior
  const [isMobile, setIsMobile] = useState(false);
  // State for user dropdown menu
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [selectedPath, setSelectedPath] = useState("");

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

    if(typeof window !== "undefined"){
        setSelectedPath(window.location.pathname);
    }
    // Fetch auditor data from the API
    const fetchAuditorData = async () => {
      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem("token");

        if (token) {
          // Make an API call to get auditor data
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
              id: auditorData.auditorId || 0,
            });
          } else {
            console.error("Failed to fetch auditor data");
            setAuditor({
              namePrefix: "นาย",
              firstName: "ไม่ทราบชื่อ",
              lastName: "",
              isLoading: false,
              id: 0,
            });
          }
        } else {
          console.error("No token found");
          setAuditor({
            namePrefix: "นาย",
            firstName: "ไม่ทราบชื่อ",
            lastName: "",
            isLoading: false,
            id: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching auditor data:", error);
        setAuditor({
          namePrefix: "นาย",
          firstName: "ไม่ทราบชื่อ",
          lastName: "",
          isLoading: false,
          id: 0,
        });
      }
    };

    fetchAuditorData();

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

  return (
    <div className="flex flex-col min-h-screen bg-[#EBFFF3]">
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
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              {/* Mobile menu toggle button */}
              {isMobile && (
                <button
                  onClick={toggleSidebarVisibility}
                  className="mr-2 p-1 rounded-md hover:bg-gray-100"
                  aria-label="Toggle sidebar"
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
              {/* User profile dropdown */}
              <div className="relative">
                <button
                  className="flex items-center space-x-3 focus:outline-none"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {/* ชื่อผู้ใช้ */}
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

                {/* Dropdown menu */}
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
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}