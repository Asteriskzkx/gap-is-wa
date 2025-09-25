
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface UserInfo {
  isLoading: boolean;
  namePrefix: string;
  firstName: string;
  lastName: string;
  role : string;
}

interface HeaderProps {
  isMobile: boolean;
  user: UserInfo;
  toggleSidebarVisibility: () => void;
  handleLogout: () => void;
}

const toggleSidebarVisibility = () => {
  console.log("Toggle sidebar");
};

const handleLogout = () => {
  console.log("Logout clicked");
};

const rolePathMap: Record<string, string> = {
  FARMER: "farmers",
  COMMITTEE: "committees",
  ADMIN: "admins",
  AUDITOR : "auditors",
  // add more if needed
};

const Header: React.FC<HeaderProps> = ({
  isMobile,
  user,
  toggleSidebarVisibility,
  handleLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (<header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
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
                    {user.isLoading ? (
                      <div className="animate-pulse h-5 w-24 bg-gray-200 rounded"></div>
                    ) : (
                      <>
                        {user.namePrefix}
                        {user.firstName} {user.lastName}
                      </>
                    )}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                    {!user.isLoading && user.firstName.charAt(0)}
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
                      href="/${rolePathMap[user.role]}"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ข้อมูลโปรไฟล์
                    </Link>
                    <Link
                      href="/${rolePathMap[user.role]}"
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

    );
};
export default Header;