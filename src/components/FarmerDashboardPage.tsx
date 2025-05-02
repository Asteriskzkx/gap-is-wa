"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FarmerDashboardPage() {
  const router = useRouter();
  const [farmer, setFarmer] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    isLoading: true,
  });

  // State for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  // State to track screen size for responsive behavior
  const [isMobile, setIsMobile] = useState(false);
  // State for user dropdown menu
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Navigation menu items
  const navItems = [
    {
      title: "หน้าหลัก",
      href: "/farmer/dashboard",
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
      title: "ยื่นขอใบรับรองแหล่งผลิต",
      href: "/farmer/applications/new",
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
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    },
    {
      title: "ติดตามสถานะการรับรอง",
      href: "/farmer/applications",
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

    fetchFarmerData();

    // Check if the screen is mobile size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    // Set initial state
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle logout
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");
    // Redirect to login page
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-[#EBFFF3]">
      {/* Sidebar - always visible but width changes */}
      <div
        className={`bg-white shadow-md transition-all duration-300 h-screen fixed z-10 ${
          sidebarCollapsed ? "w-14" : "w-64"
        } flex flex-col`}
      >
        {/* Toggle button at top */}
        <div className="p-3 flex justify-end border-b">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
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

      {/* Main Content */}
      <div
        className={`flex-1 ${
          sidebarCollapsed ? "ml-14" : "ml-64"
        } transition-all duration-300`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
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
                  <span className="text-sm font-medium text-gray-700">
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

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">หน้าหลัก</h1>
            <p className="mt-1 text-sm text-gray-500">
              ยินดีต้อนรับสู่ระบบการรับรองแหล่งผลิตยางพาราตามมาตรฐาน GAP
            </p>
          </div>

          {/* Action Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {navItems.map((item, index) => (
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
                          : "bg-blue-100 text-blue-600"
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
                        : "จัดการข้อมูลสวนยางพาราของท่าน"}
                    </p>
                    <div className="mt-4 flex items-center text-green-600 font-medium text-sm">
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
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              สถานะการรับรอง
            </h2>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
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
          </div>

          {/* News & Announcements */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ข่าวสารและประกาศ
            </h2>
            {/* <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-base font-medium text-gray-900">
                  ประกาศรับสมัครเกษตรกรเข้าร่วมโครงการ GAP ยางพารา ปี 2568
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  การยางแห่งประเทศไทยเปิดรับสมัครเกษตรกรเข้าร่วมโครงการรับรองแหล่งผลิตยางพาราตามมาตรฐาน
                  GAP ประจำปี 2568
                </p>
                <p className="text-xs text-gray-400 mt-2">1 พฤษภาคม 2568</p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-base font-medium text-gray-900">
                  แนวทางการปฏิบัติตามมาตรฐาน GAP ยางพารา
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  คู่มือและแนวทางการปฏิบัติตามมาตรฐาน GAP
                  สำหรับเกษตรกรชาวสวนยางพารา
                </p>
                <p className="text-xs text-gray-400 mt-2">24 เมษายน 2568</p>
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  ราคายางประจำวันที่ 1 พฤษภาคม 2568
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  ราคายางแผ่นดิบ ราคายางแผ่นรมควัน และราคาน้ำยางสด ประจำวันที่ 1
                  พฤษภาคม 2568
                </p>
                <p className="text-xs text-gray-400 mt-2">1 พฤษภาคม 2568</p>
              </div>
            </div> */}
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
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white mt-auto py-6 border-t">
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
