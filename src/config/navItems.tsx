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
  PlusIcon,
  StacksIcon,
  TextClipboardIcon,
  TrashIcon,
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
  {
    title: "ตรวจสอบรายงาน",
    href: "/auditor/report",
    icon: <FindInPageIcon className="h-6 w-6" />,
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
  {
    title: "ตรวจสอบรายงาน",
    href: "/committee/report",
    icon: <FindInPageIcon className="h-6 w-6" />,
  },
];

export const farmerNavItems = [
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
    title: "ใบรับรองแหล่งผลิตที่ได้รับ",
    href: "/farmer/certificates",
    icon: <StacksIcon className="h-6 w-6" />,
  },
  {
    title: "แก้ไขข้อมูลคำขอใบรับรองแหล่งผลิต",
    href: "/farmer/applications/edit",
    icon: <EditIcon className="h-6 w-6" />,
  },
  {
    title: "ขอยกเลิกใบรับรองแหล่งผลิต",
    href: "/farmer/applications/cancel",
    icon: <TrashIcon className="h-6 w-6" />,
  },
];
