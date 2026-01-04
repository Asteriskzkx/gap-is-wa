import {
  CalendarIcon,
  CancelIcon,
  ChatBubbleIcon,
  EditIcon,
  FileIcon,
  FindInPageIcon,
  HomeIcon,
  InspectIcon,
  ManageAccountIcon,
  NaturePeopleIcon,
  StacksIcon,
  TextClipboardIcon,
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

export const auditorNavItems = [
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

export const committeeNavItems = [
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
