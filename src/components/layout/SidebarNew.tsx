"use client";

import Link from "next/link";
import { Sidebar as PrimeSidebar } from "primereact/sidebar";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isMobile: boolean;
  user: {
    namePrefix: string;
    firstName: string;
    lastName: string;
  };
  handleLogout: () => void;
  visible: boolean;
  collapsed: boolean;
  navItems: { title: string; href: string; icon: React.ReactNode }[];
  onNavItemClick: () => void;
  onToggleCollapse: () => void;
  onVisibilityChange: (visible: boolean) => void;
  avatarColor?: "blue" | "green" | "indigo";
}

export default function SidebarComponent({
  isMobile,
  user,
  handleLogout,
  visible,
  collapsed,
  navItems,
  onNavItemClick,
  onToggleCollapse,
  onVisibilityChange,
  avatarColor = "blue",
}: SidebarProps) {
  const avatarClass = {
    blue: styles.userAvatarBlue,
    green: styles.userAvatarGreen,
    indigo: styles.userAvatarIndigo,
  }[avatarColor];

  const handleToggle = () => {
    if (isMobile) {
      onVisibilityChange(false);
    } else {
      onToggleCollapse();
    }
  };

  const handleNavClick = () => {
    onNavItemClick();
  };

  return (
    <>
      {/* Desktop: Always visible positioned sidebar */}
      {!isMobile && visible && (
        <div
          className={`bg-white shadow-md transition-all duration-300 h-screen fixed z-30 ${
            collapsed ? "w-14" : "w-64"
          } flex flex-col`}
        >
          <div className={styles.sidebarContent}>
            {/* Toggle button at top */}
            <div className={styles.sidebarHeader}>
              <button
                onClick={handleToggle}
                className={styles.toggleButton}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.toggleIcon}
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
            <nav className={styles.nav}>
              <ul className={styles.navList}>
                {navItems.map((item) => (
                  <li key={`desktop-${item.href}`} className={styles.navItem}>
                    <Link
                      href={item.href}
                      className={`${styles.navLink} ${
                        collapsed ? styles.navLinkCollapsed : ""
                      }`}
                      onClick={handleNavClick}
                    >
                      <div className={styles.navIcon}>{item.icon}</div>
                      {!collapsed && (
                        <span className={styles.navText}>{item.title}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User section at bottom */}
            {!collapsed && (
              <div className={styles.userSection}>
                <div className={styles.userInfo}>
                  <div className={styles.userAvatarContainer}>
                    <div className={`${styles.userAvatar} ${avatarClass}`}>
                      {user.firstName.charAt(0)}
                    </div>
                  </div>
                  <div className={styles.userDetails}>
                    <p className={styles.userName}>
                      {user.namePrefix}
                      {user.firstName} {user.lastName}
                    </p>
                    <button
                      onClick={handleLogout}
                      className={styles.logoutButton}
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile: PrimeSidebar overlay */}
      {isMobile && (
        <PrimeSidebar
          visible={visible}
          onHide={() => onVisibilityChange(false)}
          position="left"
          className="w-64"
          modal
        >
          <div className={styles.sidebarContent}>
            {/* Navigation Links */}
            <nav className={styles.nav}>
              <ul className={styles.navList}>
                {navItems.map((item) => (
                  <li key={`mobile-${item.href}`} className={styles.navItem}>
                    <Link
                      href={item.href}
                      className={styles.navLink}
                      onClick={handleNavClick}
                    >
                      <div className={styles.navIcon}>{item.icon}</div>
                      <span className={styles.navText}>{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User section at bottom */}
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatarContainer}>
                  <div className={`${styles.userAvatar} ${avatarClass}`}>
                    {user.firstName.charAt(0)}
                  </div>
                </div>
                <div className={styles.userDetails}>
                  <p className={styles.userName}>
                    {user.namePrefix}
                    {user.firstName} {user.lastName}
                  </p>
                  <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PrimeSidebar>
      )}
    </>
  );
}
