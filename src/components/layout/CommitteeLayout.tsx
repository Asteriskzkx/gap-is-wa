"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FooterNew from "./FooterNew";
import HeaderNew from "./HeaderNew";
import SidebarComponent from "./SidebarNew";

// Icons
import {
  CancelIcon,
  EditIcon,
  HomeIcon,
  StacksIcon,
  TextClipboardIcon,
} from "@/components/icons";

interface CommitteeLayoutProps {
  readonly children: React.ReactNode;
}

export default function CommitteeLayout({ children }: CommitteeLayoutProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [committee, setCommittee] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    isLoading: true,
    role: "COMMITTEE",
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
      href: "/committee/dashboard",
      icon: <HomeIcon className="h-6 w-6" />,
    },
    {
      title: "พิจารณาผลการตรวจประเมิน",
      href: "/committee/assessments",
      icon: <TextClipboardIcon className="h-6 w-6" />,
    },
    {
      title: "ใบรับรองแหล่งผลิตจีเอพีในระบบ",
      href: "/committee/certifications/list",
      icon: <StacksIcon className="h-6 w-6" />,
    },
    {
      title: "ออกใบรับรองแหล่งผลิตจีเอพี",
      href: "/committee/certifications/issue",
      icon: <EditIcon className="h-6 w-6" />,
    },
    {
      title: "ยกเลิกใบรับรองแหล่งผลิตจีเอพี",
      href: "/committee/certifications/revoke",
      icon: <CancelIcon className="h-6 w-6" />,
    },
  ];

  useEffect(() => {
    // ใช้ข้อมูลจาก NextAuth session แทน localStorage
    if (status === "authenticated" && session?.user) {
      const roleData = session.user.roleData;
      setCommittee({
        namePrefix: roleData?.namePrefix || "",
        firstName: roleData?.firstName || "",
        lastName: roleData?.lastName || "",
        isLoading: false,
        role: "COMMITTEE",
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
    <div className="flex flex-col min-h-screen bg-secondary">
      {/* Sidebar */}
      <SidebarComponent
        isMobile={isMobile}
        user={committee}
        handleLogout={handleLogout}
        visible={sidebarVisible}
        collapsed={sidebarCollapsed}
        navItems={navItems}
        onNavItemClick={handleNavClick}
        onToggleCollapse={toggleSidebarCollapse}
        onVisibilityChange={setSidebarVisible}
        avatarColor="indigo"
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col ${getMainContentMargin()} transition-all duration-300`}
      >
        {/* Header */}
        <HeaderNew
          isMobile={isMobile}
          user={committee}
          toggleSidebarVisibility={toggleSidebarVisibility}
          handleLogout={handleLogout}
          avatarColor="indigo"
        />

        {/* Main Content Area */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <FooterNew />
      </div>
    </div>
  );
}
