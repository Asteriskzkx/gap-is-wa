"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import FooterNew from "./FooterNew";
import HeaderNew from "./HeaderNew";
import SidebarComponent from "./SidebarNew";

// Icons
import {
  EditIcon,
  HomeIcon,
  PlusIcon,
  TextClipboardIcon,
  TrashIcon,
} from "@/components/icons";

interface FarmerLayoutProps {
  children: React.ReactNode;
}

export default function FarmerLayout({ children }: FarmerLayoutProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [farmer, setFarmer] = useState({
    namePrefix: "",
    firstName: "",
    lastName: "",
    isLoading: true,
    role: "FARMER",
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
      href: "/farmer/dashboard",
      icon: <HomeIcon className="h-6 w-6" />,
    },
    {
      title: "ยื่นขอใบรับรองแหล่งผลิต",
      href: "/farmer/applications/new",
      icon: <PlusIcon className="h-6 w-6" />,
    },
    {
      title: "ติดตามสถานะการรับรอง",
      href: "/farmer/applications",
      icon: <TextClipboardIcon className="h-6 w-6" />,
    },
    {
      title: "ขอแก้ไขข้อมูลใบรับรองแหล่งผลิต",
      href: "/farmer/applications/edit",
      icon: <EditIcon className="h-6 w-6" />,
    },
    {
      title: "ขอยกเลิกใบรับรองแหล่งผลิต",
      href: "/farmer/applications/cancel",
      icon: <TrashIcon className="h-6 w-6" />,
    },
  ];

  useEffect(() => {
    // ใช้ข้อมูลจาก NextAuth session แทน localStorage
    if (status === "authenticated" && session?.user) {
      const roleData = session.user.roleData;
      setFarmer({
        namePrefix: roleData?.namePrefix || "",
        firstName: roleData?.firstName || session.user.name || "",
        lastName: roleData?.lastName || "",
        isLoading: false,
        role: "FARMER",
      });
    } else if (status === "loading") {
      setFarmer((prev) => ({ ...prev, isLoading: true }));
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
        user={farmer}
        handleLogout={handleLogout}
        visible={sidebarVisible}
        collapsed={sidebarCollapsed}
        navItems={navItems}
        onNavItemClick={handleNavClick}
        onToggleCollapse={toggleSidebarCollapse}
        onVisibilityChange={setSidebarVisible}
        avatarColor="green"
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col ${getMainContentMargin()} transition-all duration-300`}
      >
        {/* Header */}
        <HeaderNew
          isMobile={isMobile}
          user={farmer}
          toggleSidebarVisibility={toggleSidebarVisibility}
          handleLogout={handleLogout}
          avatarColor="green"
        />

        {/* Main Content Area */}
        <main className="flex-grow">{children}</main>

        {/* Footer */}
        <FooterNew />
      </div>
    </div>
  );
}
