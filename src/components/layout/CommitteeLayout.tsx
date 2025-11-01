"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Footer from "@/components/layout/Footer";

interface CommitteeLayoutProps {
  children: React.ReactNode;
}

export default function CommitteeLayout({ children }: CommitteeLayoutProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [committee, setCommittee] = useState({
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
  // Get current path for navigation highlighting
  const [selectedPath, setSelectedPath] = useState<string>("");

  // Navigation menu items
  const navItems = [
    {
      title: "หน้าหลัก",
      href: "/committee/dashboard",
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
      title: "พิจารณาผลการตรวจประเมิน",
      href: "/committee/assessments",
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      title: "ออกใบรับรองแหล่งผลิตจีเอพี",
      href: "/committee/certifications/issue",
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      title: "ยกเลิกใบรับรองแหล่งผลิตจีเอพี",
      href: "/committee/certifications/revoke",
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
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      ),
    },
    {
      title: "รายงานสรุปการรับรอง",
      href: "/committee/reports",
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    // Set selected path
    if (typeof window !== "undefined") {
      setSelectedPath(window.location.pathname);
    }

    // ใช้ข้อมูลจาก NextAuth session แทน localStorage
    if (status === "authenticated" && session?.user) {
      const roleData = session.user.roleData;
      setCommittee({
        namePrefix: roleData?.namePrefix || "",
        firstName: roleData?.firstName || "",
        lastName: roleData?.lastName || "",
        isLoading: false,
      });
    } else if (status === "loading") {
      setCommittee((prev) => ({ ...prev, isLoading: true }));
    } else if (status === "unauthenticated") {
      // ถ้ายังไม่ login ให้ redirect ไปหน้า login
      router.push("/");
    }

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
  }, [status, session, router]);

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
  const handleLogout = async () => {
    // ใช้ NextAuth signOut แทน localStorage (ทำลาย session และ redirect ไปหน้า login)
    await signOut({ callbackUrl: "/", redirect: true });
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
                      item.href === selectedPath
                        ? "bg-green-50 text-green-600"
                        : ""
                    }`}
                    onClick={handleNavClick}
                  >
                    <div
                      className={`${
                        item.href === selectedPath
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
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
              ))}
            </ul>
          </nav>

          {/* User section at bottom (optional) */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                    {committee.firstName.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {committee.namePrefix}
                    {committee.firstName} {committee.lastName}
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
                    {committee.isLoading ? (
                      <div className="animate-pulse h-5 w-24 bg-gray-200 rounded"></div>
                    ) : (
                      <>
                        {committee.namePrefix}
                        {committee.firstName} {committee.lastName}
                      </>
                    )}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                    {!committee.isLoading && committee.firstName.charAt(0)}
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
                      href="/committee/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ข้อมูลโปรไฟล์
                    </Link>
                    <Link
                      href="/committee/settings"
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
