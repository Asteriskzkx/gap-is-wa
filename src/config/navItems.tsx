import {
  FindInPageIcon,
  HomeIcon,
  InspectIcon,
  ManageAccountIcon,
} from "@/components/icons";

export const adminNavItems = [
  {
    title: "หน้าหลัก",
    href: "/admin/dashboard",
    icon: <HomeIcon className="h-6 w-6" />,
  },
  {
    title: "จัดการผู้ใช้ในระบบ",
    href: "/admin/user-management",
    icon: <ManageAccountIcon className="h-6 w-6" />,
  },
  {
    title: "ตรวจสอบบันทึกเหตุการณ์ในระบบ",
    href: "/admin/audit-logs",
    icon: <InspectIcon className="h-6 w-6" />,
  },
  {
    title: "ตรวจสอบรายงาน",
    href: "/admin/report",
    icon: <FindInPageIcon className="h-6 w-6" />,
  },
];
