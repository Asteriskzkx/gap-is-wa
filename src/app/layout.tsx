import type { Metadata } from "next";
import { sarabun } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพารา ตามมาตรฐานจีเอพี",
  description:
    "ระบบสารสนเทศสำหรับการจัดการข้อมูลทางการเกษตรผลผลิตยางพารา ตามมาตรฐานจีเอพี",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={sarabun.variable}>
      <body className={sarabun.className}>{children}</body>
    </html>
  );
}
