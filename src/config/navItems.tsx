import { HomeIcon, TextClipboardIcon, EditIcon, XIcon, FileIcon, ManageAccountIcon, InspectIcon, PlusIcon, FindInPageIcon } from "@/components/icons";

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
          title: "ตรวจสอบเหตุการณ์ในระบบ",
          href: "/admin/incident-inspection",
          icon: <InspectIcon className="h-6 w-6" />,
        },
        {
          title: "สร้างรายงาน",
          href: "/admin/create-report",
          icon: <PlusIcon className="h-6 w-6" />,
        },
        {
          title: "ตรวจสอบรายงาน",
          href: "/admin/report-inspection",
          icon: <FindInPageIcon className="h-6 w-6" />,
        },
      ];