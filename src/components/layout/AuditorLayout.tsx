"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FooterNew from "./FooterNew";
import HeaderNew from "./HeaderNew";
import SidebarComponent from "./SidebarNew";

// Icons
import {
  CalendarIcon,
  ChatBubbleIcon,
  FileIcon,
  HomeIcon,
  LandFrameIcon,
  NaturePeopleIcon,
  TextClipboardIcon,
} from "../icons";

interface AuditorLayoutProps {
  children: React.ReactNode;
}

export default function AuditorLayout({ children }: AuditorLayoutProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [auditor, setAuditor] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    isLoading: true,
    id: 0,
    role: "AUDITOR",
  });

  // State for sidebar visibility
  const [sidebarVisible, setSidebarVisible] = useState(false);
  // State for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  // State to track screen size for responsive behavior
  const [isMobile, setIsMobile] = useState(false);

  // Navigation menu items
  const navItems = [
    {
      title: "หน้าหลัก",
      href: "/auditor/dashboard",
      icon: <HomeIcon className="h-6 w-6" />,
    },
    {
      title: "ตรวจประเมินสวนยางพารา",
      href: "/auditor/inspections",
      icon: <TextClipboardIcon className="h-6 w-6" />,
    },
    {
      title: "แจ้งกำหนดการวันที่ตรวจประเมิน",
      href: "/auditor/applications",
      icon: <CalendarIcon className="h-6 w-6" />,
    },
    {
      title: "สรุปผลการตรวจประเมิน",
      href: "/auditor/reports",
      icon: <FileIcon className="h-6 w-6" />,
    },
    {
      title: "บันทึกข้อมูลประจำสวนยาง",
      href: "/auditor/garden-data",
      icon: <NaturePeopleIcon className="h-6 w-6" />,
    },
    {
      title: "บันทึกการให้คำปรึกษาและข้อบกพร่อง",
      href: "/auditor/consultations",
      icon: <ChatBubbleIcon className="h-6 w-6" />,
    },
  ];

  useEffect(() => {
    // ใช้ข้อมูลจาก NextAuth session แทน localStorage
    if (status === "authenticated" && session?.user) {
      const roleData = session.user.roleData;
      setAuditor({
        namePrefix: roleData?.namePrefix || "",
        firstName: roleData?.firstName || "",
        lastName: roleData?.lastName || "",
        isLoading: false,
        id: roleData?.auditorId || 0,
        role: "AUDITOR",
      });
    } else if (status === "loading") {
      setAuditor((prev) => ({ ...prev, isLoading: true }));
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

  // Calculate margin left for main content
  const getMainContentMargin = () => {
    if (sidebarVisible && !isMobile) {
      return sidebarCollapsed ? "ml-14" : "ml-64";
    }
    return "ml-0";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EBFFF3]">
      {/* Sidebar */}
      <SidebarComponent
        isMobile={isMobile}
        user={auditor}
        handleLogout={handleLogout}
        visible={sidebarVisible}
        collapsed={sidebarCollapsed}
        navItems={navItems}
        onNavItemClick={handleNavClick}
        onToggleCollapse={toggleSidebarCollapse}
        onVisibilityChange={setSidebarVisible}
        avatarColor="blue"
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col ${getMainContentMargin()} transition-all duration-300`}
      >
        {/* Header */}
        <HeaderNew
          isMobile={isMobile}
          user={auditor}
          toggleSidebarVisibility={toggleSidebarVisibility}
          handleLogout={handleLogout}
          avatarColor="blue"
        />

        {/* Main Content Area */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <FooterNew />
      </div>
    </div>
  );
}
