"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuditorDashboardPage() {
  const [auditor, setAuditor] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    isLoading: true,
  });

  // State for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  // State to track screen size for responsive behavior
  const [isMobile, setIsMobile] = useState(false);

  // Navigation menu items
  const navItems = [
    {
      title: "ตรวจประเมินสวนยางพารา",
      href: "/auditor/inspections",
    },
    {
      title: "แจ้งกำหนดการวันที่ตรวจประเมิน",
      href: "/auditor/applications",
    },
    {
      title: "สรุปผลการตรวจประเมิน",
      href: "/auditor/reports",
    },
  ];

  useEffect(() => {
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
            });
          } else {
            console.error("Failed to fetch auditor data");
            setAuditor({
              namePrefix: "นาย",
              firstName: "ไม่ทราบชื่อ",
              lastName: "",
              isLoading: false,
            });
          }
        } else {
          console.error("No token found");
          setAuditor({
            namePrefix: "นาย",
            firstName: "ไม่ทราบชื่อ",
            lastName: "",
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching auditor data:", error);
        setAuditor({
          namePrefix: "นาย",
          firstName: "ไม่ทราบชื่อ",
          lastName: "",
          isLoading: false,
        });
      }
    };

    fetchAuditorData();

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

  return (
    <div className="flex min-h-screen bg-[#EBFFF3]">
      {/* Sidebar - hidden on mobile unless toggled */}
      {(!isMobile || !sidebarCollapsed) && (
        <div
          className={`bg-white shadow-md transition-all duration-300 h-screen fixed z-10 ${
            sidebarCollapsed ? "w-12" : "w-52"
          } flex flex-col`}
        >
          {/* Toggle button */}
          <div className="flex justify-end p-1">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 30 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 4.625C0 3.63044 0.395088 2.67661 1.09835 1.97335C1.80161 1.27009 2.75544 0.875 3.75 0.875H26.25C27.2446 0.875 28.1984 1.27009 28.9016 1.97335C29.6049 2.67661 30 3.63044 30 4.625V23.375C30 24.3696 29.6049 25.3234 28.9016 26.0266C28.1984 26.7299 27.2446 27.125 26.25 27.125H3.75C2.75544 27.125 1.80161 26.7299 1.09835 26.0266C0.395088 25.3234 0 24.3696 0 23.375V4.625ZM9.375 2.75V25.25H26.25C26.7473 25.25 27.2242 25.0525 27.5758 24.7008C27.9275 24.3492 28.125 23.8723 28.125 23.375V4.625C28.125 4.12772 27.9275 3.65081 27.5758 3.29917C27.2242 2.94754 26.7473 2.75 26.25 2.75H9.375ZM7.5 2.75H3.75C3.25272 2.75 2.77581 2.94754 2.42417 3.29917C2.07254 3.65081 1.875 4.12772 1.875 4.625V23.375C1.875 23.8723 2.07254 24.3492 2.42417 24.7008C2.77581 25.0525 3.25272 25.25 3.75 25.25H7.5V2.75Z"
                  fill="currentColor"
                  className="text-gray-700"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4">
            <ul>
              {navItems.map((item, index) => (
                <li key={index} className="mb-4">
                  <Link
                    href={item.href}
                    className={`flex items-center py-2 ${
                      sidebarCollapsed ? "justify-center px-1" : "px-4"
                    }`}
                  >
                    {!sidebarCollapsed && (
                      <span className="text-gray-700 text-sm truncate w-full">
                        {item.title}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 ${
          !isMobile || !sidebarCollapsed
            ? sidebarCollapsed
              ? "ml-12"
              : "ml-52"
            : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              {/* Show toggle button on mobile when sidebar is collapsed */}
              {isMobile && sidebarCollapsed && (
                <button
                  onClick={toggleSidebar}
                  className="mr-2 p-1 rounded-md hover:bg-gray-100"
                  aria-label="Show sidebar"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 30 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 4.625C0 3.63044 0.395088 2.67661 1.09835 1.97335C1.80161 1.27009 2.75544 0.875 3.75 0.875H26.25C27.2446 0.875 28.1984 1.27009 28.9016 1.97335C29.6049 2.67661 30 3.63044 30 4.625V23.375C30 24.3696 29.6049 25.3234 28.9016 26.0266C28.1984 26.7299 27.2446 27.125 26.25 27.125H3.75C2.75544 27.125 1.80161 26.7299 1.09835 26.0266C0.395088 25.3234 0 24.3696 0 23.375V4.625ZM9.375 2.75V25.25H26.25C26.7473 25.25 27.2242 25.0525 27.5758 24.7008C27.9275 24.3492 28.125 23.8723 28.125 23.375V4.625C28.125 4.12772 27.9275 3.65081 27.5758 3.29917C27.2242 2.94754 26.7473 2.75 26.25 2.75H9.375ZM7.5 2.75H3.75C3.25272 2.75 2.77581 2.94754 2.42417 3.29917C2.07254 3.65081 1.875 4.12772 1.875 4.625V23.375C1.875 23.8723 2.07254 24.3492 2.42417 24.7008C2.77581 25.0525 3.25272 25.25 3.75 25.25H7.5V2.75Z"
                      fill="currentColor"
                      className="text-gray-700"
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
              {/* <div className="text-sm font-semibold text-gray-900">
                การยางแห่งประเทศไทย
              </div> */}
            </div>
            <div className="flex items-center space-x-3">
              {auditor.isLoading ? (
                <div className="animate-pulse h-5 w-24 bg-gray-200 rounded"></div>
              ) : (
                <span className="text-gray-700">
                  {auditor.namePrefix}
                  {auditor.firstName} {auditor.lastName}
                </span>
              )}
              <button className="text-gray-400 hover:text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Action Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
            {navItems.map((item, index) => (
              <div key={index} className="bg-white rounded-md shadow p-4">
                <Link href={item.href} className="block">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`p-3 rounded-full mb-4 ${
                        index === 0
                          ? "bg-blue-100"
                          : index === 1
                          ? "bg-green-100"
                          : "bg-purple-100"
                      }`}
                    >
                      {index === 0 ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75a2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                          />
                        </svg>
                      ) : index === 1 ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-purple-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-base font-medium text-gray-900">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Dashboard Stats */}
          {/* <div className="bg-white rounded-md shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">สรุปงานตรวจสอบ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="text-xl font-bold text-blue-600">15</div>
                <div className="text-sm text-gray-600">
                  คำขอรับรองที่รอการตรวจสอบ
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-md">
                <div className="text-xl font-bold text-yellow-600">3</div>
                <div className="text-sm text-gray-600">
                  การนัดหมายที่กำลังจะมาถึง
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <div className="text-xl font-bold text-green-600">42</div>
                <div className="text-sm text-gray-600">
                  การตรวจสอบที่เสร็จสิ้นแล้ว
                </div>
              </div>
            </div>
          </div> */}
        </main>
      </div>
    </div>
  );
}
