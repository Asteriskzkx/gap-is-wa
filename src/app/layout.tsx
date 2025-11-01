import type { Metadata, Viewport } from "next";
import { sarabun } from "./fonts";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title:
    "ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพารา ตามมาตรฐานจีเอพี",
  description:
    "ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพารา ตามมาตรฐานจีเอพี",
  // ลบ viewport ออกจาก metadata
  keywords: "GAP, จีเอพี, ยางพารา, การยางแห่งประเทศไทย, เกษตรกร, รับรองมาตรฐาน",
  authors: [{ name: "การยางแห่งประเทศไทย" }],
  creator: "การยางแห่งประเทศไทย",
  robots: "index, follow",
};

// แยก viewport ออกมาเป็น export แยก
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
        <Providers>
          <div className="min-h-screen w-full overflow-x-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
