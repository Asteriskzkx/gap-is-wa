"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Menu as PrimeMenu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import styles from "./Header.module.css";

interface UserInfo {
  isLoading: boolean;
  namePrefix: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface HeaderProps {
  isMobile: boolean;
  user: UserInfo;
  toggleSidebarVisibility: () => void;
  handleLogout: () => void;
  avatarColor?: "blue" | "green" | "indigo";
}

const rolePathMap: Record<string, string> = {
  FARMER: "farmer",
  COMMITTEE: "committee",
  ADMIN: "admin",
  AUDITOR: "auditor",
};

export default function Header({
  isMobile,
  user,
  toggleSidebarVisibility,
  handleLogout,
  avatarColor = "blue",
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<PrimeMenu>(null);

  const menuItems: MenuItem[] = [
    {
      label: "ข้อมูลโปรไฟล์",
      icon: "pi pi-user",
      command: () => {
        globalThis.location.href = `/${rolePathMap[user.role]}/profile`;
      },
    },
    {
      label: "ตั้งค่า",
      icon: "pi pi-cog",
      command: () => {
        globalThis.location.href = `/${rolePathMap[user.role]}/settings`;
      },
    },
    {
      separator: true,
    },
    {
      label: "ออกจากระบบ",
      icon: "pi pi-sign-out",
      className: "text-red-600",
      command: handleLogout,
    },
  ];

  const avatarClass = {
    blue: styles.avatarBlue,
    green: styles.avatarGreen,
    indigo: styles.avatarIndigo,
  }[avatarColor];

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.leftSection}>
          {isMobile && (
            <button
              onClick={toggleSidebarVisibility}
              className={styles.menuButton}
              aria-label="Toggle sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={styles.menuIcon}
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
        <div className={styles.rightSection}>
          <div className="relative">
            <button
              className={styles.userButton}
              onClick={(e) => {
                setDropdownOpen(!dropdownOpen);
                menuRef.current?.toggle(e);
              }}
            >
              <span className={`${styles.userName} ${styles.userNameHidden}`}>
                {user.isLoading ? (
                  <div className={styles.loadingSkeleton}></div>
                ) : (
                  <>
                    {user.namePrefix}
                    {user.firstName} {user.lastName}
                  </>
                )}
              </span>
              <div className={`${styles.avatar} ${avatarClass}`}>
                {!user.isLoading && user.firstName.charAt(0)}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${styles.chevronIcon} ${
                  dropdownOpen ? styles.rotated : ""
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

            <PrimeMenu
              model={menuItems}
              popup
              ref={menuRef}
              id="header-user-menu"
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
