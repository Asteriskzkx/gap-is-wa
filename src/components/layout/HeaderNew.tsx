"use client";

import Image from "next/image";
import { Menu as PrimeMenu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { useRef, useState } from "react";
import { ChevronBottomIcon, MenuIcon } from "../icons";
import styles from "./Header.module.css";

interface UserInfo {
  isLoading: boolean;
  namePrefix: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface HeaderProps {
  readonly isMobile: boolean;
  readonly user: UserInfo;
  readonly toggleSidebarVisibility: () => void;
  readonly handleLogout: () => void;
  readonly avatarColor?: "blue" | "green" | "indigo";
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
              <MenuIcon className={styles.menuIcon} />
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
            <div className={styles.userArea}>
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

              <button
                type="button"
                className={styles.userButton}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                aria-controls="header-user-menu"
                onClick={(e) => menuRef.current?.toggle(e)}
              >
                <div className={`${styles.avatar} ${avatarClass}`}>
                  {!user.isLoading && user.firstName.charAt(0)}
                </div>

                <ChevronBottomIcon
                  className={`${styles.chevronIcon} ${
                    dropdownOpen ? styles.rotated : ""
                  }`}
                />
              </button>
            </div>

            <PrimeMenu
              model={menuItems}
              popup
              ref={menuRef}
              id="header-user-menu"
              className="mt-2"
              onShow={() => setDropdownOpen(true)}
              onHide={() => setDropdownOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
