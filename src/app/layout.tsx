import type { Metadata } from "next";
import { sarabun } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพารา ตามมาตรฐานจีเอพี",
  description:
    "ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพารา ตามมาตรฐานจีเอพี",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  // เพิ่ม meta tags อื่นๆ
  keywords: "GAP, จีเอพี, ยางพารา, การยางแห่งประเทศไทย, เกษตรกร, รับรองมาตรฐาน",
  authors: [{ name: "การยางแห่งประเทศไทย" }],
  creator: "การยางแห่งประเทศไทย",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${sarabun.variable} antialiased`}>
      <head>
        {/* เพิ่ม meta tags สำหรับ mobile optimization */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${sarabun.className} min-h-screen bg-gray-50`}>
        <div className="min-h-screen w-full overflow-x-hidden">{children}</div>
      </body>
    </html>
  );
}
